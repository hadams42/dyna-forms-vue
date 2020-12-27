/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import { Utilities } from "../../Utilities.js"
import { Workflow } from "../../Workflow.js";
import { FormActions } from "./FormActions.js";
import { ServerInterface } from "../../ServerInterface.js";

export default {

	props: [
		"schema",
		"data", 
		"layout",
		"formSettings",
		"isMasterForm",
		"name",
		"instanceId",
		"containerReadOnly",
		"guid",
		"showConfirmDialog",
		"showMessageDialog",
		"hideMessageDialog",
		"messageDialog",
		"formId",
		"targets",
		"containerInstanceId",
		"elementId",
		"isAdmin"
	],

  data() {
    return {
			Utilities: new Utilities(),
			ServerInterface: new ServerInterface(),
			Workflow: new Workflow(this),
			FormActions: new FormActions(this),
			ActiveFormSettings: this.formSettings || {},
			ActiveFormData: this.data || {},
			ActiveSchema: this.schema || {},
			ActiveResetData: null,
			WatchIndex: [],
			ValidationCollector: [],
			UnvalidatedFields: [],
			ActiveFieldList: [],
			IsLoading: false,
			formType: 'default',
    };
	},


	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
  methods: {

		//---------------------------------------------------------------------------------------------------
		refreshData: function() {
			this.ActiveFormData = this.data;
			this.setEmptyToNull();
		},

		//---------------------------------------------------------------------------------------------------
		makeToast(message, title, timeout=5000, hideOpenToasts=false, variant=null, href=null, filename=null) {
			if (hideOpenToasts) this.$bvToast.hide();
			this.$bvToast.toast(message, {
				title: title,
				autoHideDelay: timeout,
				noAutoHide: timeout == 0 ? true : false,
				noFade: true,
				href: href,
				appendToast: false,
				toaster: "b-toaster-bottom-right",
				variant: variant,
				toastClass: "toaster-container"
			})
		},

		//---------------------------------------------------------------------------------------------------
		resetValidationCollectors: function(qualifiedFieldName=null) {
			//If we are validating all fields
			if (qualifiedFieldName == null || qualifiedFieldName == undefined) {
				//Filter schema to include only fields that support validation
				var fieldList = this.ActiveFieldList.filter(function(f) {
					return this.fieldValidationSupported(f)
				}.bind(this));
				this.ValidationCollector = [];
				for (var i=0; i<fieldList.length; i++) {
					this.ValidationCollector.push({
						FieldName: fieldList[i],
						Status: 0,
						MessageList: []
					});
				}
			} 
			//Else, if we are only validating a single field and this field supports validation
			else if (this.fieldValidationSupported(qualifiedFieldName) == true) {
				this.ValidationCollector = [ { FieldName: qualifiedFieldName, Status: 0, MessageList: [], Emitter: 6 } ];
			} 
			//Else, clear the validation lists
			else {
				this.ValidationCollector = [];
			}

			//Clone validation list to create a list of unvalidated fields
			this.UnvalidatedFields = this.Utilities.Clone(this.ValidationCollector);
		},

		//---------------------------------------------------------------------------------------------------
		clearValidationCollectors: function() {
			this.ValidationCollector = [];
			this.UnvalidatedFields = [];
		},

		//---------------------------------------------------------------------------------------------------
		fieldValidationSupported: function(fieldName) {
			//Find matching object in array
			let selectedIndex = this.ActiveSchema.findIndex((f) => {
				return f.name == fieldName;
			});

			if (selectedIndex >= 0) {
				return (this.ActiveSchema[selectedIndex].rules != null || this.ActiveSchema[selectedIndex].enableServerValidation == true)
			} 
			else 
			{
				return false;
			}
		},


		//---------------------------------------------------------------------------------------------------
		validationMessage: function(validation) {
			var message = "";
			if (validation.MessageList != null && validation.MessageList.length > 0) {
				for (var i=0; i<validation.MessageList.length; i++) {
					if (validation.MessageList[i].Text != null) {
						message += validation.MessageList[i].Text;
					}
				}

			} else {
				message = validation.FieldName;
			}
			return message;
		},

		//---------------------------------------------------------------------------------------------------
		fieldLabel: function(fieldName) {
			let selectedIndex = this.ActiveSchema.findIndex((f) => {
				return f.name == fieldName;
			});

			var label = this.ActiveSchema[selectedIndex].label;
			if (label == null || label == "") {
				if (this.ActiveSchema[selectedIndex].fieldType == 'CheckboxInput') {
					label = this.ActiveSchema[selectedIndex].options[0].text;	
				}
				else {
					label = this.ActiveSchema[selectedIndex].name;
				}
			}

			return label;
		},

		//---------------------------------------------------------------------------------------------------
		updateValidationCollectors: function(validation, isValid, pushFailedValidations) {
			//Remove from list of fields waiting to be validated
			this.UnvalidatedFields = this.UnvalidatedFields.filter(function(f) {
				return f.FieldName != validation.FieldName
			}.bind(this));

			if (pushFailedValidations == true && isValid == false) {
				var i = 	this.ValidationCollector.findIndex(o => o.FieldName === validation.FieldName);
				if (i === -1) {
					this.ValidationCollector.push(validation)
				}
				else {
					this.ValidationCollector[i].Status = validation.Status;
					this.ValidationCollector[i].MessageList = validation.MessageList;
				}
			} else {
				//If validation was successful, then remove from collector
				if (isValid) {
					this.ValidationCollector = this.ValidationCollector.filter(function(f) {
						return f.FieldName != validation.FieldName
					}.bind(this));
				}
			}
		},

		//---------------------------------------------------------------------------------------------------
		updateField: function(changedField, value) {

			if (this.ActiveFormData[changedField] !== value || typeof value == "object") {

				//Log if required
				if (
					window["_Dyna"] != null &&
					window["_Dyna"].logHandlers == true &&
					(window["_Dyna"].hideInternals == false)
				) {
					console.log("[LOG]","Update Field", changedField, value)
				}

				//Trigger update event on this field
				this.$set(this.ActiveFormData, changedField, value);
				this.$forceUpdate();

				this.emitEvent("FieldChanged", this.guid, this.formType, changedField, value, this.ActiveFormData);

				if (this.ActiveFormSettings.autoSaveValidFields) {
					this.autoSaveForm();
				}

				var i = this.ValidationCollector.findIndex(o => o.FieldName === changedField);
				if (this.validateOnBlur === true || (i >= 0 && this.ValidationCollector[i].Status === 2)) {
					this.emitFilterEvent("_ValidateField", this.guid + this.formType + changedField);
				}

				//Trigger update on fields watching this one
				if (this.WatchIndex[changedField] != null) {
					for (var i=0; i<this.WatchIndex[changedField].length; i++) {
						var observerFieldname = this.WatchIndex[changedField][i];
						var watchedFieldname = changedField;
						var watchedField = { Name: watchedFieldname, Data: null };
						this.emitFilterEvent("_Render", this.guid + this.formType + observerFieldname, watchedField);
					}
				}
			}

		},

		//---------------------------------------------------------------------------------------------------
		renderRemoteField: function(fieldName, clearValue = false) {
			this.emitFilterEvent("_Render", this.guid + this.formType + fieldName, this.name, clearValue);							
		},

		//---------------------------------------------------------------------------------------------------
		serverValidationCallback: function(validationList, isSubmit, submitAction) {
			//If validation results were returned, then display
			if (validationList != null && validationList.length > 0) {
				//Loop through returned results and apply					
				for(var i=0; i<validationList.length; i++) {
					//Determine qualified field name
					var qualifiedFieldName;
					if (validationList[i].FormName == null) {
						qualifiedFieldName = validationList[i].FieldName;
					} else {
						qualifiedFieldName = validationList[i].FormName + "." + validationList[i].FieldName;
					}
					//Send validation result to bus
					this.emitFilterEvent("_BeforeServerFieldValidationResult", this.guid + this.formType + qualifiedFieldName, validationList[i]);
					this.serverValidationResult(qualifiedFieldName, validationList[i], isSubmit, submitAction);
				}
			//Else, if no validation errors, then send dummy validation result to bus
			} 
			else if (isSubmit) {
				this.serverValidationResult(null, null, isSubmit, submitAction);
			}
		},

		//---------------------------------------------------------------------------------------------------
		serverValidationResult: function(qualifiedFieldName, validation, isSubmit, submitAction) {

			if (qualifiedFieldName != null && validation != null) {
				//Convert validation status
				var isValid = validation.Status > 0 ? false : true;
				//Update collectors
				this.updateValidationCollectors({ 
					FieldName: qualifiedFieldName, 
					MessageList: validation.MessageList, 
					Status: validation.Status
				}, isValid, true);
			}

			this.handleValidationResult(isSubmit, submitAction)
		},

		//---------------------------------------------------------------------------------------------------
		submit: function(submitAction="Auto", validate=true) {
			this.ActiveFormSettings.enableValidation = validate;
			this.beforeSubmitEvent(submitAction);
		},

		//---------------------------------------------------------------------------------------------------
		beforeSubmitEvent: function(submitAction=null) {
			//Submit functions are disabled for sub-forms
			if (this.isSubForm) return;

			//Call client side beforeSubmit event handler if defined
			var cancel = false;
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onBeforeSubmit != null && this.ActiveFormSettings.onBeforeSubmit != "") {
				cancel = this.ActiveFormSettings.onBeforeSubmit.call(this,
					this.ActiveFormSettings,
					this.ActiveFormData,
					submitAction,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}	
			if (cancel === true) return;

			//Trigger validation event if validation is not disabled and submit was not cancelled
			if (this.ActiveFormSettings.enableValidation != false) {
				this.beforeValidateFormEvent(true, submitAction);
			}
			//Else go directly to submission
			else {
				this.submitEvent(submitAction);
			}

		},

		//---------------------------------------------------------------------------------------------------
		autoSaveForm: function(callback=null) {
			var cancel = false;
			//Call local auto-save handler if defined
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onAutoSave != null && this.ActiveFormSettings.onAutoSave != "") {
				cancel = this.ActiveFormSettings.onAutoSave.call(this,
					this.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
						this.makeToast("Save Error" + " (" + this.ActiveFormSettings.formType + ")" ,e)
					}.bind(this)
				);
			}
			//Submit to server binder if not cancelled
			if (cancel == false) {
				if (this.ActiveFormSettings != null && this.ActiveFormSettings.submitToServer == true) { 
					this.ServerInterface.AutoSaveForm(this,
							this.instanceId, 
							this.ActiveFormData, 
							callback,
							function(e) {
								console.log("AUTO-SAVE ERROR:", e);
								this.makeToast("Save Error" + " (" + this.ActiveFormSettings.formType + ")" ,e)
							}.bind(this)
					);
				}
			}
		},

		//---------------------------------------------------------------------------------------------------
		submitEvent: function(submitAction=null) {
			//Call local submit handler if server submit is not enabled
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onSubmit != null && this.ActiveFormSettings.submitToServer == false && this.ActiveFormSettings.onSubmit != "") {
				var cancel = this.ActiveFormSettings.onSubmit.call(this,
					this.ActiveFormSettings,
					this.ActiveFormData,
					submitAction,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				//Trigger after submit event if not cancelled
				if (cancel == null || cancel == false) {
					this.afterSubmitEvent(submitAction);
				} else {
					this.afterSubmitCancelEvent(submitAction);
				}
			}	
			//Else submit to server binder		
			else if (this.ActiveFormSettings != null && this.ActiveFormSettings.submitToServer == true) { 
				this.ServerInterface.SubmitForm(this,
						this.instanceId, 
						this.ActiveFormData, 
						submitAction,
						function(cbAction, redirectUrl) {
							this.afterSubmitEvent(cbAction, redirectUrl);
						}.bind(this),
						function(cbAction, redirectUrl, e) {
							console.log("SUBMIT ERROR:", e);
							this.showMessageDialog("Form Error", e != null ? e.message || e : "", function() {
								this.afterSubmitCancelEvent(cbAction, redirectUrl);
							}.bind(this));
						}.bind(this)
				);
			}
			else {
				this.afterSubmitEvent(cbAction, redirectUrl);
			}
		},

		//---------------------------------------------------------------------------------------------------
		afterSubmitCancelEvent: function(submitAction=null, redirectUrl=null) {
			//Submit functions are disabled for sub-forms
			 if (this.isSubForm) return;

			//Call client side afterSubmit event handler if defined
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onAfterSubmitCancel != null && this.ActiveFormSettings.onAfterSubmitCancel != "") {
				this.ActiveFormSettings.onAfterSubmitCancel.call(this,
					this.ActiveFormSettings,
					this.ActiveFormData,
					submitAction,
					redirectUrl,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				if (redirectUrl != null) {
					window.location = redirectUrl;
				}

			//If no afterSubmitCancel defined, then redirect now
			}	else if (redirectUrl != null) {
				window.location = redirectUrl;
			}		
		},

		//---------------------------------------------------------------------------------------------------
		afterSubmitEvent: function(submitAction=null, redirectUrl=null) {
			//Submit functions are disabled for sub-forms
			 if (this.isSubForm) return;

			//Call client side afterSubmit event handler if defined
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onAfterSubmit != null && this.ActiveFormSettings.onAfterSubmit != "") {
				var cancelled = this.ActiveFormSettings.onAfterSubmit.call(this,
					this.ActiveFormSettings,
					this.ActiveFormData,
					submitAction,
					redirectUrl,
					function(e) { //error callback
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				if (cancelled != true && redirectUrl != null) {
					window.location = redirectUrl;
				}
			//If no afterSubmit defined, then redirect now
			}	else if (redirectUrl != null) {
				window.location = redirectUrl;
			}		
		},

		//---------------------------------------------------------------------------------------------------
		validationFailedEvent: function() {
			 //Submit functions are disabled for sub-forms
			 if (this.isSubForm) return;

			//Call client side afterSubmit event handler if defined
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onValidationFailed != null && this.ActiveFormSettings.onValidationFailed != "") {
				this.ActiveFormSettings.onValidationFailed.call(this,
					this.ActiveFormSettings,
					this.ActiveFormData,
					this.ValidationCollector,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//---------------------------------------------------------------------------------------------------
		validationSuccessEvent: function(isSubmit, submitAction=null) {
			 //Submit functions are disabled for sub-forms
			 if (this.isSubForm) return;

			//Call client side afterSubmit event handler if defined
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onValidationSuccess != null && this.ActiveFormSettings.onValidationSuccess != "") {
				this.ActiveFormSettings.onValidationSuccess.call(this,
					this.ActiveFormSettings,
					this.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}

			//If we are supposed to submit this form, then call submit function
			if (isSubmit) {
				this.submitEvent(submitAction);
			}
						
		},

		//---------------------------------------------------------------------------------------------------
		loadFormEvent: function() {
			//Show flash protected content
			if (this.ActiveFormSettings.flashProtectOnLoad) {
				this.Utilities.FlashProtect();
			}
			
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onFormLoad != null && this.ActiveFormSettings.onFormLoad != "") {
				this.ActiveFormSettings.onFormLoad.call(this,
					this.ActiveFormSettings,
					this.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			

		},

		//---------------------------------------------------------------------------------------------------
		showLoadingSpinner: function() {
			this.IsLoading = true;
		},

		//---------------------------------------------------------------------------------------------------
		hideLoadingSpinner: function() {
			this.IsLoading = false;
		},

		//---------------------------------------------------------------------------------------------------
		resetFormEvent: function() {
			if (this.ActiveFormSettings != null && this.ActiveFormSettings.onReset != null && this.ActiveFormSettings.onReset != "") {
				this.ActiveFormSettings.onReset.call(this);
			}			
		},

		//---------------------------------------------------------------------------------------------------
		ValidateForm: function() {
			this.$nextTick(function() {
				this.beforeValidateFormEvent(false);
			});
		},

		//---------------------------------------------------------------------------------------------------
		beforeValidateFormEvent: function(isSubmit=false, submitAction=null) {
			//Reset collector
			this.resetValidationCollectors();
			//Trigger form validation
			this.emitFilterEvent("_ValidateForm", this.guid + this.formType, isSubmit, submitAction );
		},

		//---------------------------------------------------------------------------------------------------
		setEmptyToNull: function() {
			if (this.formSettings != null) {				
				for(var i=0; i<this.schema.length; i++) {
					if (!this.data[this.schema[i].name] && this.data[this.schema[i].name] !== 0) {
						this.ActiveFormData[this.schema[i].name] = null;
					}
				}
			}
		},

		//---------------------------------------------------------------------------------------------------
		handleValidationResult: function(isSubmit, submitAction=null) {
			//If all fields have passed validation, then submit the form now
			if (this.ValidationCollector.length == 0 && this.UnvalidatedFields.length == 0 && isSubmit == true) {
				this.validationSuccessEvent(true, submitAction);
			} else if (this.UnvalidatedFields.length == 0 && this.ValidationCollector.length != 0) {
				this.validationFailedEvent();
			} else if (this.UnvalidatedFields.length == 0 && this.ValidationCollector.length == 0) {
				this.validationSuccessEvent(false, submitAction);
			}
		},

		//---------------------------------------------------------------------------------------------------
		performServerAction: function(action) {
			this.FormActions.ServerAction(this, 
				action,
				this.instanceId, 
				this.ActiveFormData._Id, 
				this.DisplayValues
			)
		},

		//---------------------------------------------------------------------------------------------------
		filterColumns: function(columnList) {
			return columnList.filter(function(i) {
				return i.visible != false;
			}.bind(this));
		},
		
		//---------------------------------------------------------------------------------------------------
		filterFields: function(fieldList, currentColumn) {
			return fieldList.filter(function(i) {
				return i.name == currentColumn.fieldName && i.visible != false && (i.fieldType != 'ButtonInput' || this.isSubForm == false);
			}.bind(this));
		},


	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	mounted: function() {
		this.$forceUpdate();
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	created: function() {

		//Store form name as  local data on this form
		this.formType = this.ActiveFormSettings != null ? this.ActiveFormSettings.formType : 'default';
		this.ActiveResetData = this.Utilities.Clone(this.ActiveFormData);

		//Set empty to nulls and load sub-form data into form data as indicated
		this.setEmptyToNull();

		//Fire form onLoad event
		this.loadFormEvent();

		//Populate watch index
		for (var i=0; i<this.schema.length; i++)	{
			//Determine if this field maps to any watches
			if (this.schema[i].watch != null && this.schema[i].watch.length > 0)	{
				for (var y=0; y<this.schema[i].watch.length; y++) {
					//Read in maps
					var fieldName = this.schema[i].name;
					var watchedName = this.schema[i].watch[y];
					//Init array if this is the first element
					if (this.WatchIndex[watchedName] == null) {
						this.WatchIndex[watchedName] = [];
					}
					//Add element
					this.WatchIndex[watchedName].push(fieldName);
				}
			}
		}

		//---------------------------------------------------------
		//Loading Event Handlers
		//---------------------------------------------------------
		//Listen to bus for reset 
		this.onFilterEvent("_Loading", 564, this.guid, (self, status) => {
			if (status) {
				this.showLoadingSpinner();
			} else {
				this.hideLoadingSpinner();
			}
		});

		//---------------------------------------------------------
		//Reset Event Handler
		//---------------------------------------------------------
		//Listen to bus for reset 
		this.onFilterEvent("_Reset", 553, this.guid, (self) => {
			if (this.ActiveResetData != null) {
				//Reset form UI (data is reset in app.vue)
				this.ActiveFormData = this.Utilities.Clone(this.ActiveResetData);
				//Call reset event
				this.resetFormEvent();
			}
		});

		//---------------------------------------------------------
		//Validation Event Handlers
		//---------------------------------------------------------
		//Listen to bus for begin form validation event
		if (this.isSubForm == false) {
			this.onFilterEvent("_BeforeValidateForm", 582, this.guid + this.formType, (self) => {
				this.beforeValidateFormEvent();
			});
		}	

		//Listen to bus for server-side form-level validation
		if (this.ActiveFormSettings.enableServerValidation == true) {
			this.onFilterEvent("_ValidateForm", 589, this.guid + this.formType, (self, isSubmit, submitAction=null) => {
				//Send form data to server for validation
				this.ServerInterface.ValidateForm(this,
					this.instanceId,
					this.ActiveFormData, 
					function(result) {
						//Send response to callback
						this.serverValidationCallback(result, isSubmit, submitAction);
					}.bind(this)
				);
			});
		}

		//Listen to bus for local validation results
		this.onFilterEvent("_FieldValidationResult", 603, this.guid + this.formType, (self, qualifiedFieldName, validation, isSubmit=false, submitAction=null) => {
			//Convert validation status
			var isValid = (validation.Status > 0 && self.DisplayValues != null && self.DisplayValues.visible !== false) ? false : true;
			//Update collectors
			this.updateValidationCollectors({ 
				FieldName: qualifiedFieldName, 
				MessageList: validation.MessageList, 
				Status: validation.Status
			}, isValid, true);
			//Trigger next event
			if (this.isSubForm == false) {
				this.handleValidationResult(isSubmit, submitAction)
			}
		});

		//---------------------------------------------------------
		//Submit Event Handlers
		//---------------------------------------------------------
		//Listen to bus for form onSubmit events

		//NOTE: If validation is not disabled on a form, there must be at least one form field with rules set for a form be be submittable.


		if (this.isSubForm == false) {
			this.onFilterEvent("_BeforeSubmit", 642, this.guid + this.formType, (self, submitAction=null) => {
				//Trigger beforeSubmit event. That event will conditionally trigger the actual submit
				this.beforeSubmitEvent(submitAction);
			});
		}

		//---------------------------------------------------------
		//Render Event Handlers
		//---------------------------------------------------------
		//Listen to bus for newly rendered fields
		this.onFilterEvent("_FieldRendered", 652, this.guid + this.formType, (self, senderFormName, fieldName) => {
			if (senderFormName == null) {
				this.ActiveFieldList.push(fieldName);
			} else {
				this.ActiveFieldList.push(senderFormName + "." + fieldName);
			}
		});
	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	watch: {
		data: function(){
			if (this.ActiveFormData != null && typeof this.ActiveFormData == "object" ) {
				this.refreshData();
			}
		}
	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	computed: {
		isSubForm: function() {
			if (!this.isMasterForm) {
				return true;
			} else {
				return false;
			}
		},

		computedReadOnly: function() {
			return (this.ActiveFormSettings.formReadOnly || this.containerReadOnly || this.ActiveFormData._ReadOnly == true ) ? true : false;
		},

		formReadOnlyLock: function() {
			return this.ActiveFormData._ReadOnly == true ? true : false;
		},

		formName: function() {
			if (this.name == undefined || this.name == null) {
				return null;
			} else {
				return this.name;
			}
		}
		
	},
	
};
