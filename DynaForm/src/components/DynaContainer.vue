<template>
<div 
	:id="name"
	class="dyna-container"
	style="position: relative"
>

	<!-- ..................................................................... -->
	<!-- OVERLAY TO MAKE CONTAINER READ ONLY                                   -->
	<!-- ..................................................................... -->
	<div v-if="OverlayVisible"
		class="dyna-overlay"
	></div>

	<!-- ..................................................................... -->
	<!-- COMPONENT. Can be GridView or DynaForm																 -->
	<!-- ..................................................................... -->
  <b-modal 
		v-if="showInModal" 
		class="dyna-modal-container"
		ref="containerModal"
		:hide-footer="isWorkflowActivity || hideModalFormFooter"
		:hide-header="false"
		size="lg"
		:no-fade="true"
		:no-close-on-backdrop="true"
		:hide-backdrop="false"
		ok-only
		static
		ok-title="Close"
		button-size="sm"		
		:dialog-class="[modalCssClass != null ? modalCssClass : '', this.name]"
	>
		<component 
			:is="ActiveComponent.ComponentType"
			v-bind="ActiveComponent"
			:data="ActiveData"
			:containerReadOnly="readonly"
			:showConfirmDialog="ShowConfirmDialog"
			:showMessageDialog="ShowMessageDialog"
			:hideMessageDialog="HideMessageDialog"
			:messageDialog="MessageDialog"
			:targets="ActiveSettings.targets"
			:guid="ActiveGuid"
			:isAdmin="isAdmin"
			ref="ActiveComponent"
			:containerInstanceId="containerInstanceId"
		></component>
  </b-modal>

	<component 
		v-if="showInModal == false"
		:is="ActiveComponent.ComponentType"
		v-bind="ActiveComponent"
		:data="ActiveData"
		:containerReadOnly="readonly"
		:showConfirmDialog="ShowConfirmDialog"
		:showMessageDialog="ShowMessageDialog"
		:hideMessageDialog="HideMessageDialog"
		:messageDialog="MessageDialog"
		:targets="ActiveSettings.targets"
		:guid="ActiveGuid"
		:isAdmin="isAdmin"
		ref="ActiveComponent"
		:containerInstanceId="containerInstanceId"
	></component>

	
	<!-- ..................................................................... -->
	<!-- MODAL DIALOG                                                          -->
	<!-- ..................................................................... -->
	<b-modal 
		v-model="MessageDialog.Show"
		hide-header-close
		no-close-on-backdrop		
		no-close-on-esc
		:dialog-class="[MessageDialog.CustomClasses]"
		no-fade
		title-tag="h6"
		:hide-header="MessageDialog.Caption == null ? true : false"
		:size="MessageDialog.Size"
		:return-focus="MessageDialog.ReturnFocusTo"
		:title-html="MessageDialog.Caption">
      <div class="d-block text-left">
        <h6 v-html="MessageDialog.Text"></h6>
      </div>
			<div slot="modal-footer">
				<b-btn 
					v-if="MessageDialog.OkButton.Visible"
					type="button"
					class="mt-1 ml-1 btn  btn-sm float-right" 
					:variant="MessageDialog.OkButton.Variant"
					@click="MessageDialogOkClickEvent"
				>
					<i v-if="MessageDialog.OkButton.IsLoading" class='fas fa-circle-notch fa-spin'></i> 
					{{MessageDialog.OkButton.Text}}
				</b-btn>
				<b-btn 
					v-if="MessageDialog.YesButton.Visible"
					type="button"
					class="mt-1 ml-1 btn  btn-sm float-right" 
					:variant="MessageDialog.YesButton.Variant"
					@click="MessageDialogYesClickEvent"
				>
					<i v-if="MessageDialog.YesButton.IsLoading" class='fas fa-circle-notch fa-spin'></i> 
					{{MessageDialog.YesButton.Text}}
				</b-btn>
				<b-btn 
					v-if="MessageDialog.NoButton.Visible"
					type="button"
					class="mt-1 ml-1 btn  btn-sm float-right" 
					:variant="MessageDialog.NoButton.Variant"
					@click="MessageDialogNoClickEvent"
				>
					<i v-if="MessageDialog.NoButton.IsLoading" class='fas fa-circle-notch fa-spin'></i> 
					{{MessageDialog.NoButton.Text}}
				</b-btn>
				<b-btn 
					v-if="MessageDialog.CancelButton.Visible"
					type="button"
					class="mt-1 ml-1 btn  btn-sm float-right" 
					:variant="MessageDialog.CancelButton.Variant"
					@click="MessageDialogCancelClickEvent"
				>
					<i v-if="MessageDialog.CancelButton.IsLoading" class='fas fa-circle-notch fa-spin'></i> 
					{{MessageDialog.CancelButton.Text}}
				</b-btn>
			</div>
  </b-modal>

</div>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */
import { Utilities } from "../Utilities.js"
import { ServerInterface } from "../ServerInterface.js";
import LiteBusMixin from "./shared/LiteBusMixin";
import DynaForm from "./DynaForm";
import DynaContent from "./DynaContent";

export default {
  name: "DynaContainer",
	
	components: { DynaForm, DynaContent },

	mixins:[ LiteBusMixin ],

	props: [
		"settings",
		"elementId",
		"formGroupId",
		"name",
		"guid",
		"containerInstanceId",
		"initialReadOnly",
		"componentUrl",
		"showInModal",
		"modalId",
		"modalCssClass",
		"isWorkflowActivity",
		"hideModalFormFooter",
		"isAdmin"
	],

	data() {
    return {

			Utilities: new Utilities(),
			ServerInterface: new ServerInterface(),

			OverlayVisible: false,

			ActiveSettings: this.settings || {},
			ActiveData: {},
			ActiveGuid: this.GetGuid(), // this.name, //Math.random().toString(36).substr(2, 9),
			ActiveComponent: {
				Type: "DynaContent",
			},

			MessageDialog: {
				Show: false,
				Caption: "Confirm Delete",
				Text: "Do you wish to delete this record?",
				Size: "sm",
				CustomClasses: "",
				ReturnFocusTo: null,
				YesButton: {
					OnClick: null,
					Text: "Yes",
					Visible: false,
					Variant: "primary",
					IsLoading: false
				},
				NoButton: {
					OnClick: null,
					Text: "No",
					Visible: false,
					Variant: "secondary",
					IsLoading: false
				},
				CancelButton: {
					OnClick: null,
					Text: "Cancel",
					Visible: false,
					Variant: "default",
					IsLoading: false,
				},
				OkButton: {
					OnClick: null,
					Text: "Ok",
					Visible: false,
					Variant: "primary",
					IsLoading: false,
				},
			},

			readonly: this.initialReadOnly == null ? false : this.initialReadOnly,
    };
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
  methods: {

		//===================================================================================================
		// GENERAL METHODS
		//===================================================================================================
		SwitchMode: function() {
			switch (this.ActiveSettings.mode) {
				case "dyna-content":
					this.ShowContent();
					break;
				case "dyna-form":
					this.ShowForm();
					break;
			}
		},

		//---------------------------------------------------------------------------------------------------
		GetGuid: function() {
			//return this.name;
			
			return ([1e7]+1e3+4e3+8e3+1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);

			// return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	// 	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    	// 	return v.toString(16);
  		// });
		},

		//---------------------------------------------------------------------------------------------------
		GetComponentList: function() {
			var list = [];

			if (this.ActiveComponent != null) {
				var o = {
						ActiveComponent: this.ActiveComponent,
						ActiveData: this.ActiveData,
						ActiveSettings: this.ActiveSettings,
						ActiveGuid: this.ActiveGuid
				}
				list.push(o);
			}

			return list;
		},
		

		//===================================================================================================
		// DIALOG METHODS
		//===================================================================================================

		//---------------------------------------------------------------------------------------------------
		ShowMessageDialog: function(Caption, Text, OnOk, CustomClasses) {
			this.MessageDialog.Caption = Caption;
			this.MessageDialog.Text = Text;
			this.MessageDialog.YesButton.Visible = false;
			this.MessageDialog.NoButton.Visible = false;
			this.MessageDialog.CancelButton.Visible = false;
			this.MessageDialog.OkButton.Visible = true;
			this.MessageDialog.OkButton.Text = this.MessageDialog.OkButton.Text == null ? "Ok" : this.MessageDialog.OkButton.Text;
			this.MessageDialog.OkButton.OnClick = OnOk;
			this.MessageDialog.Show = true;
			this.MessageDialog.CustomClasses = CustomClasses;
		},

		//---------------------------------------------------------------------------------------------------
		HideMessageDialog: function() {
			this.MessageDialog.Show = false;
		},

		//---------------------------------------------------------------------------------------------------
		ShowConfirmDialog: function(Caption, Text, OnOk, OnCancel, OkButtonText = "Ok", CancelButtonText = "Cancel", Size = "lg") {
			this.MessageDialog.Caption = Caption;
			this.MessageDialog.Text = Text;
			this.MessageDialog.YesButton.Visible = false;
			this.MessageDialog.NoButton.Visible = false;
			this.MessageDialog.CancelButton.Visible = true;
			this.MessageDialog.CancelButton.Text = CancelButtonText;
			this.MessageDialog.CancelButton.OnClick = OnCancel;
			this.MessageDialog.OkButton.Visible = true;
			this.MessageDialog.OkButton.Text = OkButtonText;
			this.MessageDialog.OkButton.OnClick = OnOk;
			this.MessageDialog.Show = true;
			this.MessageDialog.Size = Size;
		},


		//---------------------------------------------------------------------------------------------------
		ShowWorkflowSuccessDialog: function(Caption, Text, Button1Text, Button2Text, OnButton1, OnButton2, Button1Visible=true) {
			this.MessageDialog.Caption = Caption;
			this.MessageDialog.Text = Text;
			this.MessageDialog.YesButton.Visible = false;
			this.MessageDialog.NoButton.Visible = false;
			this.MessageDialog.CancelButton.Visible = Button1Visible;
			this.MessageDialog.CancelButton.Text = Button1Text;
			this.MessageDialog.CancelButton.OnClick = OnButton1;
			this.MessageDialog.OkButton.Visible = true;
			this.MessageDialog.OkButton.Text = Button2Text;
			this.MessageDialog.OkButton.OnClick = OnButton2;
			this.MessageDialog.Show = true;
		},


		//---------------------------------------------------------------------------------------------------
		MessageDialogYesClickEvent: function(e) {
			var isCancelled = false;
			if (this.MessageDialog.YesButton.OnClick != null) {
				this.MessageDialog.YesButton.IsLoading = true;
				isCancelled = this.MessageDialog.YesButton.OnClick(e);
				this.MessageDialog.YesButton.IsLoading = false;
			}
			if (isCancelled != true) {
				this.MessageDialog.Show = false;
			}
		},

		//---------------------------------------------------------------------------------------------------
		MessageDialogNoClickEvent: function(e) {
			var isCancelled = false;
			if (this.MessageDialog.NoButton.OnClick != null) {
				this.MessageDialog.NoButton.IsLoading = true;
				isCancelled = this.MessageDialog.NoButton.OnClick(e);
				this.MessageDialog.NoButton.IsLoading = false;
			}
			if (isCancelled != true) {
				this.MessageDialog.Show = false;
			}
		},

		//---------------------------------------------------------------------------------------------------
		MessageDialogCancelClickEvent: function(e) {
			var isCancelled = false;
			if (this.MessageDialog.CancelButton.OnClick != null) {
				this.MessageDialog.CancelButton.IsLoading = true;
				isCancelled = this.MessageDialog.CancelButton.OnClick(e);
				this.MessageDialog.CancelButton.IsLoading = false;
			}
			if (isCancelled != true) {
				this.MessageDialog.Show = false;
			}
		},

		//---------------------------------------------------------------------------------------------------
		MessageDialogOkClickEvent: function(e) {
			var isCancelled = false;
			if (this.MessageDialog.OkButton.OnClick != null) {
				this.MessageDialog.OkButton.IsLoading = true;
				isCancelled = this.MessageDialog.OkButton.OnClick(e);
				this.MessageDialog.OkButton.IsLoading = false;
			}
			if (isCancelled != true) {
				this.MessageDialog.Show = false;
			}
		},

		//===================================================================================================
		// COMPONENT RENDERING METHODS
		//===================================================================================================

		//---------------------------------------------------------------------------------------------------
		ShowOverlay: function(visible) {
			this.OverlayVisible = visible;
		},

		//---------------------------------------------------------------------------------------------------
		ShowBlank: function() {
			
			//Clear event queue 
			this.DestroyForm();
			this.ActiveComponent = null;
			
			this.ActiveSettings.mode = "dyna-blank";
			var component = {
				ComponentType: "DynaContent",
				settings: {},
				name: this.name,
				guid: this.guid, //Math.random().toString(36).substr(2, 9), 
				instanceId: this.containerInstanceId,
			}
			this.ActiveComponent = component;
		},

		//---------------------------------------------------------------------------------------------------
		DestroyForm: function() {
			if (this.$refs.ActiveComponent != null && this.ActiveComponent.ComponentType == "DynaForm") {
				this.$refs.ActiveComponent.clearEvents();					
				this.$refs.ActiveComponent.$destroy();
			}
			//this.Utilities.FlashProtect(false);
		},

		//===================================================================================================
		// CONTENT METHODS
		//===================================================================================================

		ShowContent: function(content=null) {
			this.ActiveSettings.mode = "dyna-content";

			//Set new mode in form group dictionary
			if (window["_Dyna"] != null && window["_Dyna"].formGroupDict != null) {
				var formGroupDict = (window["_Dyna"]).formGroupDict;
				if (formGroupDict[this.ActiveGuid] != null) {
					formGroupDict[this.ActiveGuid].mode = this.ActiveSettings.mode;
				} else {
					formGroupDict[this.ActiveGuid] = {};
					formGroupDict[this.ActiveGuid].mode = this.ActiveSettings.mode;
				}
				window["_Dyna"].formGroupDict = formGroupDict;
			}

			//If no content is directly specified on this method, read from container settings
			if (content == null) {
				if (this.ActiveSettings.content != null && this.ActiveSettings.content.definition != null) {
					this.RenderContent(this.ActiveSettings.content.definition);
				}

			//Else, override container settings with content target specified here
			} else {
				var contentDefinition = {};
				if (content.charAt(0) == "#") contentDefinition.domElement = content;
				else if (content.charAt(0) == "<") contentDefinition.html = content;
				else contentDefinition.url = content;

				this.RenderContent(contentDefinition);				
			}
		},

		//---------------------------------------------------------------------------------------------------
		RenderContent: function(Settings) {
			var component = {
				ComponentType: "DynaContent",
				settings: Settings,
				name: this.name,
				instanceId: this.containerInstanceId,
				guid: Math.random().toString(36).substr(2, 9), 
			}

			//Clear event queue
			this.DestroyForm();

			//Update component
			this.ActiveComponent = component;

			//Call user-defined render event handler
			this.RenderEvent();
		},


		//===================================================================================================
		// FORM METHODS
		//===================================================================================================
		ShowForm: function(success, error) {
			//Set container to form mode
			this.ActiveSettings.mode = "dyna-form";
			
			//Set new mode in form group dictionary
			if (window["_Dyna"] != null && window["_Dyna"].formGroupDict != null) {
				var formGroupDict = window["_Dyna"].formGroupDict;
				if (formGroupDict[this.ActiveGuid] != null) {
					formGroupDict[this.ActiveGuid].mode = this.ActiveSettings.mode;
				} else {
					formGroupDict[this.ActiveGuid] = {};
					formGroupDict[this.ActiveGuid].mode = this.ActiveSettings.mode;
				}
				window["_Dyna"].formGroupDict = formGroupDict;
			}

			//If a local form definition has been specified, then render that definition
			if (this.ActiveSettings.form != null && this.ActiveSettings.form.definition != null) {

				this.RenderForm(
					this.containerInstanceId, 
					this.ActiveSettings.form.definition, 
					this.ActiveSettings.form.data, 
					this.ActiveSettings.form.clearDefaults, 
					success, 
					error);
			}

			//Else try the server API...
			else if (this.ValidateFormSettings() == true) {
				this.RenderServerForm(
					this.ActiveSettings.form.serverApi.formId > 0 ? this.ActiveSettings.form.serverApi.formId : this.ActiveSettings.form.serverApi.instanceId, 
					this.ActiveSettings.form.serverApi.allowedActions, 
					this.ActiveSettings.form.serverApi.renderAction, 
					this.ActiveSettings.form.serverApi.recordKey,
					this.ActiveSettings.form.serverApi.pageLevelRecordKey,
					this.ActiveSettings.form.serverApi.formLevelRecordKey,
					this.ActiveSettings.form.serverApi.activity,
					function() {
						if (success != null) {
							success.call(this);
						}
					},
					function(e) {
						if (error != null) {
							error.call(this, e);
						}
					}
				);
			}
		},

		//---------------------------------------------------------------------------------------------------
		ValidateFormSettings: function() {
			if (
				this.ActiveSettings.form == null || 
				typeof this.ActiveSettings.form.serverApi == "undefined" ||
				this.ActiveSettings.form.serverApi == null ||
				this.ActiveSettings.form.serverApi.enabled != true ||
				(this.ActiveSettings.form.serverApi.formId <= 0 && (this.ActiveSettings.form.serverApi.instanceId == null || typeof this.ActiveSettings.form.serverApi.instanceId == "undefined")) ||
				this.ActiveSettings.form.serverApi.allowedActions == null || this.ActiveSettings.form.serverApi.allowedActions == "" ||
				this.ActiveSettings.form.serverApi.renderAction == null || this.ActiveSettings.form.serverApi.renderAction == ""
			) {
				console.log("ERROR: Form settings are not valid. FormId: " + this.ActiveSettings.form.serverApi.formId + " InstanceId: " + this.ActiveSettings.form.serverApi.instanceId);
				return false;
			}
			else {
				return true;
			}
		},

		//Retrieve form from server and evaluate JS
		//----------------------------------------------
		RenderServerForm: function(formOrInstanceId, allowedActions, renderAction, recordKey, pageLevelRecordKey, formLevelRecordKey, activity, success, error) {

			var successCallback = function(form) {
				if (form != null && form.DefinitionJS != null) {
					try {
						var formDefinition = "var _Form_" + this.ActiveGuid + " = " + form.DefinitionJS;
						eval.call(null, formDefinition);
					} catch (e) {
						console.log("Error: ", e, this.name);
						return;
					}
					
					//Read in instance data
					var data = {};
					if (form.RawJsonData != null ) {
						data = JSON.parse(form.RawJsonData);
					}
					data._Activity = activity;
					var formInstanceId = form.Instance != null ? form.Instance.InstanceId : this.containerInstanceId;
					
					//Render form
					this.RenderForm(
						formInstanceId, 
						window["_Form_" + this.ActiveGuid], 
						data, 
						this.ActiveSettings.form.clearDefaults == null ? false : this.ActiveSettings.form.clearDefaults, 
						success, 
						error);						
				}
			}

			var errorCallback = function(e) {
				console.log("Cannot render form: ", e);
				var errorMessage = e.message;
				if (errorMessage == 'Network Error' || e.response == null) {
					errorMessage = 'You do not have permission, are not logged in, or you are not able to connect to the server. Check your login as well as your internet connection.';
				} 
				else if (e.response != null && e.response.status == 409) {
					errorMessage = e.response.data;
				}
				
				//Call error callback if defined, else show a popup error
				if (error != null) {
					error.call(this, e)
				} else {
					this.ShowMessageDialog("Error Loading Form", errorMessage);
				}
			}

			//If a form id is supplied, then render the form as a new instance
			if (formOrInstanceId > 0) {
				this.ServerInterface.RenderForm(this,
					formOrInstanceId,
					allowedActions,
					renderAction,
					recordKey,
					pageLevelRecordKey,
					formLevelRecordKey,
					activity == null ? null : activity.actorKey,
					successCallback.bind(this),
					errorCallback.bind(this)
				);
			}

			//If an instance is supplied, then load the form from it
			else {
				this.ServerInterface.LoadForm(this,
					formOrInstanceId,
					renderAction,
					successCallback.bind(this),
					errorCallback.bind(this)
				);
			}
		},


		//Render actual form to screen
		//----------------------------------------------
		RenderForm: function(FormInstanceId, Settings, Data, ClearDefaults, success, error) {

			try {
				//Create placeholders for missing data if required
				if (Settings.settings != null) {
					for(var i=0; i<Settings.schema.length; i++) {
						//If this is a subform, then add null placeholders as required
						if (Settings.schema[i].fieldType == "DynaForm") {
							if (Settings.data[Settings.schema[i].name] == null) Settings.data[Settings.schema[i].name] = {};
							for(var y=0; y<Settings.schema[i].schema.length; y++) {
								if (Settings.data[Settings.schema[i].name][Settings.schema[i].schema[y].name] == null) {
								  	Settings.data[Settings.schema[i].name][Settings.schema[i].schema[y].name] = null;
								}
							}			
						//Else, this is a main form field. Add null placeholders as required
						} else {
							if (Settings.data[Settings.schema[i].name] == null) {
								  Settings.data[Settings.schema[i].name] = null;
							}
						}
					}
				}

				//Merge data properties if the specified value is not null
				//If Data object is defined, then attempt to merge
				if (Data != null) {
					var utilities = new Utilities();
					if (ClearDefaults == false) {
						Settings.data = utilities.Merge(Settings.data, Data);
					} else {
						Settings.data = utilities.Clone(Data);
					}
				}			

				this.ActiveGuid = this.GetGuid();// Math.random().toString(36).substr(2, 9);

				//Configure form component
				var formComponent = {
					ComponentType: "DynaForm",
					schema: Settings.schema,
					layout: Settings.layout,
					secondaryLayoutTitleCollapsed: Settings.secondaryLayoutTitleCollapsed,
					secondaryLayoutTitleExpanded: Settings.secondaryLayoutTitleExpanded,
					secondaryLayoutSubtitle: Settings.secondaryLayoutSubtitle,			
					secondaryLayoutIsCollapsed: Settings.secondaryLayoutIsCollapsed,
					secondaryLayoutCustomClasses: Settings.secondaryLayoutCustomClasses,
					secondaryLayout: Settings.secondaryLayout,
					formSettings: Settings.settings,
					isMasterForm: true,
					elementId: this.elementId,
					//name: this.name,
					instanceId: FormInstanceId,
					guid: this.ActiveGuid,
					formId: this.ActiveSettings.form.serverApi != null ? this.ActiveSettings.form.serverApi.formId : null,
				}

				//Clear event queue
				this.DestroyForm();

				//Update component 
				this.ActiveComponent = formComponent;

				//Update form data
				this.ActiveData = Settings.data;

				//Call user-defined render event handler
				this.RenderEvent();

				//Call success callback
				if (success != null) {
					success.call(this);
				}

			} catch(e) {
				console.log("Error: ", e, this.name);
				//Call error callback
				if (error != null) {
					error(this, e);
				} 
			}
		},

		//===================================================================================================
		// WORKFLOW METHODS
		//===================================================================================================

 		//Respond to workflow activity trigger
		//---------------------------------------------------------------------------------------------------
    TriggerWorkflowActivity: function(activity) {
			//Clear container
			this.ShowBlank();
			//Read in activity details
			this.ActiveSettings.form.serverApi.activity = activity;
			this.ActiveSettings.form.serverApi.formId = activity.activityFormId;
			//Render form in container
			if (this.ActiveSettings.form.serverApi.formId != null) {
				this.ShowForm(function() {
					if (this.showInModal) this.$refs.containerModal.show();
					return true;
				});
			} 
			else {
				return false;
			}
		},

		//Respond to workflow activity finalize
		//---------------------------------------------------------------------------------------------------
    FinalizeWorkflowActivity: function(refreshPage=false, dialogOptions=null) {
			this.CancelWorkflowActivity();

			if (dialogOptions != null && dialogOptions.showDialog !== false) {
				var result = refreshPage;
				this.ShowWorkflowSuccessDialog(
					dialogOptions.caption, 
					dialogOptions.text, 
					dialogOptions.button1Text, 
					dialogOptions.button2Text,                 
					function() {
						result = dialogOptions.onButton1.call(this);
						if (result != false && (refreshPage==true || result==true)) this.refreshPage(); //else this.refreshContainer();
					}.bind(this),
					function() {
						result = dialogOptions.onButton2.call(this);
						if (result != false && (refreshPage==true || result==true)) this.refreshPage(); //else this.refreshContainer();
					}.bind(this),
					dialogOptions.button1Visible,
				);
			}
			else {
				if (refreshPage == true) this.refreshPage(); else this.refreshContainer();
			}

			return true;
		},

		//Respond to workflow activity cancel
		//---------------------------------------------------------------------------------------------------
    CancelWorkflowActivity: function() {
			if (this.showInModal) this.$refs.containerModal.hide();
			this.ShowBlank();
			return true;
		},

		//===================================================================================================
		// METHODS FOR EXTERNAL USE
		//===================================================================================================

		//Refresh container externally
		//---------------------------------------------------------------------------------------------------
		refreshContainer: function() {
			//Read in element id and remove workflow tag if present
			var elementId = this.elementId.replace("_WorkflowActivity","")
			RefreshContainer(elementId, this.componentUrl)
		},

		//Refresh entire page
		//---------------------------------------------------------------------------------------------------
		refreshPage: function() {
			location.reload(true);
		},

		//===================================================================================================
		// EVENT HANDLERS
		//===================================================================================================

		//---------------------------------------------------------------------------------------------------
		TriggerDataChangedEvent: function(guid, formType) {
			this.emitFilterEvent("_FormDataChange", guid + formType);
		},

		//---------------------------------------------------------------------------------------------------
		LoadEvent: function() {
			if (this.ActiveSettings != null && this.ActiveSettings.onContainerLoad != null && this.ActiveSettings.onContainerLoad != "") {
				this.ActiveSettings.onContainerLoad.call(this,
					function() {
					}.bind(this),
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//---------------------------------------------------------------------------------------------------
		RenderEvent: function() {
			if (this.ActiveSettings != null && this.ActiveSettings.onContainerRender != null && this.ActiveSettings.onContainerRender != "") {
				this.ActiveSettings.onContainerRender.call(this,
					function() {
					}.bind(this),
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//===================================================================================================
		// AUTO-BINDER METHODS
		//===================================================================================================

		//-------------------------------------------------------------------------------------
		// Private helper methods		
		//-------------------------------------------------------------------------------------
		_CrudHelpers_ShowForm: function(HelperSettings, action, status, id) {
			this.ShowForm(
				//Success callback
				function() {
					this.emitEvent(HelperSettings.FormGroupId, action, "success", id);
				},
				//Error callback
				function(e) {
					this.emitEvent(HelperSettings.FormGroupId, action, "error", id);
					this.ShowContent(HelperSettings.ErrorPlaceholder);
				}
			);
		},

		//-------------------------------------------------------------------------------------
		// Should be called from the selection grid's container onLoad event
		//-------------------------------------------------------------------------------------
		CrudHelpers_SelectionGridContainerLoad: function(HelperSettings) {
			this.onEvent(HelperSettings.FormGroupId, (self, action, status, id) => {
				if ((action == "edit" || action == "create") && (status == "begin" || status == "success")) {
					this.ShowOverlay(true);
				}	else {
					this.ShowOverlay(false);
				}

				//If a cancel is received, then resend selection change if a valid id was cancelled
				if (action == "cancel" && status == "success" && id > 0) {
					this.emitEvent(HelperSettings.FormGroupId, "selection", "change", id);
				} else if (action == "cancel" && status == "success" && id == -1) {
					//do nothing for now. This happens when a user does not select an existing item and hits the Create New button. 
					//as when there are no records in the table at all....
				}
			});

		},

		//-------------------------------------------------------------------------------------
		// Helper that renders the form once a selection has been made or changed.
		// This helper does not protect dirty unsaved data. Auto-save should be used with
		// this helper. Should be called from the data entry form's container onLoad event.
		//-------------------------------------------------------------------------------------
		CrudHelpers_SelectionChangeContainerLoad: function(HelperSettings, RenderAction="R") {
				this.onEvent(HelperSettings.FormGroupId, (self, action, status, recordKey, formId = null, actorKey = null) => {
					this.ActiveSettings.form.serverApi.recordKey = recordKey;					
					var pendingAction = false;

					// Selection changed
					//----------------------------------------------------------------------------
					if ((action == "selection" && status == "change")) {
						this.ActiveSettings.form.serverApi.allowedActions = "C-R-U-D";
						this.ActiveSettings.form.serverApi.renderAction = RenderAction;
						
						if (actorKey != null) {
							if (this.ActiveSettings.form.serverApi.activity != null) {
								this.ActiveSettings.form.serverApi.activity.actorKey = actorKey;
							} else {
								this.ActiveSettings.form.serverApi.activity = {actorKey: actorKey};
							}
						}
						
						this.readonly = this.initialReadOnly == null ? true : this.initialReadOnly;
						if (formId != null) {
							this.ActiveSettings.form.serverApi.formId = formId;					
						}
						pendingAction = true;
						this.ShowBlank();
					}
					
					// Display and render form
					//----------------------------------------------------------------------------
					if (pendingAction == true) {
						this._CrudHelpers_ShowForm(HelperSettings, action, status, recordKey);
					}

			});
		},

		//-------------------------------------------------------------------------------------
		// Helper that handles create, edit and deletion of records when this form is
		// associated with another form that uses the corresponding CrudHelpers_SelectionGridContainerLoad
		// helper. Should be called from the data entry form's container onLoad event.
		//-------------------------------------------------------------------------------------
		CrudHelpers_DataEntryContainerLoad: function(HelperSettings) {
			this.onEvent(HelperSettings.FormGroupId, (self, action, status, id) => {
				this.ActiveSettings.form.serverApi.recordKey = id;					
				var pendingAction = false;

				// Cancel (when there is no selected record)
				//----------------------------------------------------------------------------
				if (action == "cancel" && status == "success" && id == -1) {
					this.ShowContent(HelperSettings.NoSelectionPlaceholder);
				} 

				// Submit success
				//----------------------------------------------------------------------------
				else if (action == "submit" && status == "success") {
					this.readonly = this.initialReadOnly == null ? true : this.initialReadOnly;
					this.ShowContent(HelperSettings.NoSelectionPlaceholder);						
				} 

				// Create Begin
				//----------------------------------------------------------------------------
				else if (action == "create" && status == "begin") {
					this.ActiveSettings.form.serverApi.allowedActions = "C-R-U-F";
					this.ActiveSettings.form.serverApi.renderAction = "C";
					this.readonly = false;
					this.ShowBlank();
					pendingAction = true;
				}

				// Edit Begin
				//----------------------------------------------------------------------------
				else if (action == "edit" && status == "begin") {
					this.ActiveSettings.form.serverApi.allowedActions = "C-R-U-F";
					this.ActiveSettings.form.serverApi.renderAction = "R";
					this.readonly = false;
					pendingAction = true;
				}

				// Delete Begin
				//----------------------------------------------------------------------------
				else if (action == "delete" && status == "begin") {
					pendingAction = false;
					this.ShowConfirmDialog(
						HelperSettings.DeleteConfirmationDialog.Caption,
						HelperSettings.DeleteConfirmationDialog.Text, 
						//Delete if confirmed
						function() {
							this.ActiveSettings.form.serverApi.allowedActions = "D";
							this.ActiveSettings.form.serverApi.renderAction = "D";							
							this.readonly = true;
							this._CrudHelpers_ShowForm(HelperSettings, action, status, id);
						}.bind(this),
						//Do nothing if cancelled
						function() {
						}.bind(this)
					);
				}

				// Selection changed
				//----------------------------------------------------------------------------
				else if ((action == "selection" && status == "change")) {
					if (this.initialReadOnly == null || this.initialReadOnly == false) {
						this.ActiveSettings.form.serverApi.allowedActions = "R-U-F";
					} else {
						this.ActiveSettings.form.serverApi.allowedActions = "R";
					}
					this.ActiveSettings.form.serverApi.renderAction = "R";
					this.readonly = this.initialReadOnly == null ? true : this.initialReadOnly;
					pendingAction = true;
				}
				
				// Display and render form
				//----------------------------------------------------------------------------
				if (pendingAction == true) {
					this._CrudHelpers_ShowForm(HelperSettings, action, status, id);
				}
			});
		}
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
		//Fire onLoad event
		this.LoadEvent();

		//Render component if auto render is true
		if (this.ActiveSettings.autoLoad != false) {			
			this.SwitchMode();
		} 

		if (this.showInModal) {
			this.onEvent("_ShowModalForm", (self, id) => {
				if ((this.modalId != null && this.modalId != "" && this.modalId == id) 
					 || ((this.modalId == null || this.modalId == "") && this.name == id))	{
					this.$refs.containerModal.show();
				}
			});

			this.onEvent("_HideModalForm", (self, id) => {
				if ((this.modalId != null && this.modalId != "" && this.modalId == id) 
					 || ((this.modalId == null || this.modalId == "") && this.name == id))	{
					this.$refs.containerModal.hide();
				}
			});
		}

		if (this.isWorkflowActivity == true) {
			//Workflow trigger event handler
			this.onFilterEvent("_TriggerWorkflowActivity", 1018, this.containerInstanceId, (self, activity) => {
				this.TriggerWorkflowActivity(activity);
				//this.offEvent("_TriggerWorkflowActivity");
			});
			
				//Workflow finalize event handler
			this.onFilterEvent("_FinalizeWorkflowActivity", 1024, this.containerInstanceId, (self, refreshPage, dialogOptions) => {
				//this.offEvent("_FinalizeWorkflowActivity");
				this.FinalizeWorkflowActivity(refreshPage, dialogOptions);
			});

			//Workflow cancel event handler
			this.onFilterEvent("_CancelWorkflowActivity", 1030, this.containerInstanceId, (self) => {
				this.CancelWorkflowActivity();
				//this.offEvent("_CancelWorkflowActivity");
			});

		}


	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	watch: {
	},	

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	computed: {
	},
	
};
</script>

