/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import { ValidationRules } from "./ValidationRules.js";
import { Utilities } from "../../Utilities.js";
import { ServerInterface } from "../../ServerInterface.js";

export default {

	props: [
		"validateOnBlur",
		"silentValidation",
		"showValidationCheckmarks",
		"enableServerValidation",
		"autoSaveValidFields"
	],


	data() {
		return {
			Utilities: new Utilities(),
			ServerInterface: new ServerInterface(),
			ValidationRules: new ValidationRules(),
			Validation: {
				Status: null,
				MessageList: [],
				},
		}
	},

	methods: {

		//---------------------------------------------------------------------------------------------------
		serverValidationCallback: function(result, isSubmit, action=null) {
	 		this.Validation = result;
			if (result != null) {
				this.emitFilterEvent("_FieldValidationResult", this.guid + this.formType, this.qualifiedFieldName, {FieldName: result.FieldName, Status: result.Status, MessageList: result.MessageList, Emitter: 1}, isSubmit, action);
			}
		},

		//---------------------------------------------------------------------------------------------------
		validateField: function(isSubmit, action=null) {
			this.Validation.Status = null;
			this.Validation.MessageList = [];

			//Find parent which contains active form data
			var thisParent = this.findParent(); 

			//If server validation is enabled, then send this field to the server for validation
			if (this.enableServerValidation) {
				//Only validate visible fields
				if (this.DisplayValues.visible !== false) {
					//Send field data to server
					this.ServerInterface.ValidateField(this,
						this.instanceId,
						this.name,
						thisParent.ActiveFormData, 
						function(result) {
								//Send response to callback
								this.serverValidationCallback({FieldName: result.FieldName, Status: result.Status, MessageList: result.MessageList, Emitter: 2}, isSubmit, action);
						}.bind(this)
					);
				} 
				//Else, if not visible, then validate as successs
				else {
					this.serverValidationCallback({ FieldName: this.name, Status: 0, MessageList: [], Emitter: 3 }, isSubmit, action);
				}
				return; //Process will be completed in the callback
			}

			//Else, validate locally
			else {

				//If at least one rule is defined
				if (this.rules != null && this.DisplayValues.visible !== false) {

					var isValid = true;

					//Loop through each rule
					for (var thisRule in this.rules) {
						if (this.rules.hasOwnProperty(thisRule)) {
							if (thisRule != null) {
								var thisOnValidate = this.rules[thisRule].onValidate;

								//If custom rule, then call custom function
								var result = {};
								if (thisRule == "customRule") {
									if (thisOnValidate != null) {
										var rawResult = thisOnValidate.call(this, this.DisplayValues, thisParent.ActiveFormData);
										//Handle appropriately, whether result is simple boolean or a full result object
										if (rawResult != null && typeof(rawResult) == "object") {
											result = rawResult;
										} else {
											result.status = rawResult;
										}
									}
								}
								//Else, call the appropriate validation rule
								else {
									var message = null;
									if (this.rules.hasOwnProperty("helpMessage")) {
										message = this.rules.helpMessage;
									}
									result = this.ValidationRules.Validate.call(this, thisRule, this.rules[thisRule], thisParent.ActiveFormData[this.name], message);
								}

								//If failed validation
								if (result.status == false) {
									isValid = false;

									//Read in message and url if not already defined
									var message = {};
	
									message.Text = (this.rules[thisRule].helpMessage != null && result.helpMessage == null) ? this.rules[thisRule].helpMessage : result.helpMessage; 
									message.Label = (this.rules[thisRule].helpLabel != null && result.helpLabel == null) ? result.helpMessage : result.helpLabel;
									message.Url = (this.rules[thisRule].helpUrl != null && result.helpUrl == null) ? this.rules[thisRule].helpUrl : result.helpUrl; 
	
									//Push message to list
									this.Validation.MessageList.push(message);
								}
							}
						}
					}

					this.Validation.Status = isValid ? 0 : 2;


					//Finished local validation. Send results to validation collector
					this.emitFilterEvent("_FieldValidationResult", this.guid + this.formType, this.qualifiedFieldName, {FieldName: this.qualifiedFieldName, Status: this.Validation.Status, MessageList: this.Validation.MessageList, Emitter: 4}, isSubmit, action);

				}	
				//Else if hidden field then don't bother validating
				else if (this.rules != null && this.DisplayValues.visible === false) {
					this.emitFilterEvent("_FieldValidationResult", this.guid + this.formType, this.qualifiedFieldName, {FieldName: this.qualifiedFieldName, Status: 0, Emitter: 5}, isSubmit, action);
				}
			}				
		},

	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	created: function() {

		//Listen to bus for form level-validation events if we aren't validating forms on the server
		if (this.enableServerValidation == false) {
			this.onFilterEvent("_ValidateForm",  this.name, this.guid + this.formType, (self, isSubmit, action=null) => {
				this.validateField(isSubmit, action);
			});
		}

		//Listen to bus for server validation results that apply to this field
		this.onFilterEvent("_BeforeServerFieldValidationResult", 161, this.guid + this.formType + this.qualifiedFieldName, (self, validationObject) => {
			this.Validation = validationObject;
		});

		//Listen to bus for field-level validation events
		this.onFilterEvent("_ValidateField", 166, this.guid + this.formType + this.name, (self) => {
			this.validateField();
		});

		//Listen to bus for reset and clear validation errors
		this.onEvent("_Reset", 171, this.guid, (self) => {
			this.Validation.MessageList = [];
			this.Validation.Status = null;
		});
	},

	computed: {

		validationClass: function() {
			if (this.Validation.Status > 0) {
				return "is-invalid";
			} else {
				return "";
			}
		},

		validationState: function() {
			if (this.Validation.Status > 0) {
				return false;
			} else {
				return null;
			}
		},

		validationIcon: function() {
			if (this.Validation.Status == 0) {
				if (this.showValidationCheckmarks) return "glyphicon-ok";
			} else if (this.Validation.Status == 1) {
				return "glyphicon-warning-sign";
			} else if (this.Validation.Status == 2) {
				return "glyphicon-remove";
			}
		},

		qualifiedFieldName: function() {
			if (this.formName == null) {
				return this.name;
			} else {
				return this.formName + "." + this.name;
			}
		}
	}

}


