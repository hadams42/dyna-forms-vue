/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import { Workflow } from "../../Workflow.js";
import { Utilities } from "../../Utilities.js";
import { FormActions } from "./FormActions.js";
import { ServerInterface } from "../../ServerInterface.js";
import debounce from 'debounce'

export default {

	props: [
		'adminUnlockable',
		'autoFocusField',
		'containerInstanceId',
		'customClasses',
		'debugMode',
		'enableServerRender',
		'formName',
		'formReadOnly',
		'formReadOnlyLock',
		'formType',
		'guid',
		'helpText',
		'helpUrl',
		'hidden',
		'hideMessageDialog',
		'instanceId',
		'isAdmin',	
		'kpiText',
		'kpiTitle',
		'label',
		'maxWidth',
		'messageDialog',
		'name', 
		'newRow',
		'onAfterRender',
		'onChange',
		'onFormDataChange',
		'onInput',
		'onLoad',
		'onRender',
		'persistSelection',
		'readOnlyLock',
		'readonly',
		'readonlyMessage',
		'rules',
		'showConfirmDialog',
		'showMessageDialog',
		'submitToServer',
		'targets',
		'value',
		'visible',
	],

	data () {
		return {
			Utilities: new Utilities(),
			Workflow: new Workflow(this),
			ServerInterface: new ServerInterface(),
			FormActions: new FormActions(this),

			DisplayValues: {
				readonlyMessage: this.readonlyMessage == null ? "" : this.readonlyMessage,
				readonlyOverride: null,
				hidden: this.hidden == null ? false : this.hidden,
				maxWidth: this.maxWidth == null ? 0 : this.maxWidth,
				showProgressBar: false,
			},

			debounce: debounce,
		}
	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//---------------------------------------------------------------------------------------------------
		onLockToggle: function(readonly=null) {

			if (this.isAdmin != true && this.adminUnlockable == true) {
				return;
			}

			if (!(this.formReadOnlyLock || this.readOnlyLock) && (this.DisplayValues.readonlyMessage == null || this.DisplayValues.readonlyMessage == "")) {

				if (readonly === false) {
					this.DisplayValues.readonlyOverride = false;
					this.DisplayValues.locked = false;
				}
				else {
					if (this.DisplayValues.readonlyOverride == null) {
						this.DisplayValues.readonlyOverride	= !this.computedReadOnly;
					} 
					else {
						this.DisplayValues.readonlyOverride = !this.DisplayValues.readonlyOverride;
					}
				}

				this.$nextTick(() => {
					try{
					this.$refs.textInput.focus(); } catch(e){}
				});
				
			}
		},

		//---------------------------------------------------------------------------------------------------
		//this.instanceId, selectedRecordKey, this.DisplayValues
		performServerAction: function(action, recordKey=null) {
			if (recordKey == null) {
				var p = this.findParent(); 
				recordKey = p.ActiveFormData._Id;
			}

			this.FormActions.ServerAction(this, 
				action,
				this.instanceId, 
				recordKey, 
				this.DisplayValues
			)
		},

		//---------------------------------------------------------------------------------------------------
		performAction: function(action, parameters) {
			var p = this.findParent(); 
			this.FormActions.LocalAction(this, 
				this.formType,
				this.guid, 
				action, 
				parameters
			)
		},

		//--------------------------------------------------------------------------------------------
		makeToast: function(message, title, timeout=5000, hideOpenToasts=false, variant=null, href=null, filename=null) {
			var p = this.findParent(); 			
			p.makeToast(message, title, timeout, hideOpenToasts, variant, href, filename);
		},

		//---------------------------------------------------------------------------------------------------
		submit: function(submitAction="Auto", validate=true) {
			var p = this.findParent(); 			
			p.submit(submitAction, validate);
		},

		//---------------------------------------------------------------------------------------------------
		validate: function() {
			var p = this.findParent(); 			
			p.ValidateForm();
		},

		//--------------------------------------------------------------------------------------------
		loadFieldEvent: function() {
			if (this.onLoad != null && this.onLoad != "") {
				var p = this.findParent(); 
				this.onLoad.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//--------------------------------------------------------------------------------------------
		onAfterRenderEvent: function(optionalData) {
			//Call onAfterRender, passing in relevant data objects
			if (this.onAfterRender != null && this.onAfterRender != "") {
				var p = this.findParent();
				this.onAfterRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					optionalData
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		renderRemoteField: function(fieldName, clearValue = false, focus = false) {
			this.emitFilterEvent("_Render", this.guid + this.formType + fieldName, this.name, clearValue, focus);							
		},

		//--------------------------------------------------------------------------------------------
		formDataChangeEvent: function() {
			//Clear validators if they are defined
			try {
				this.Validation.Status = null;
				this.Validation.MessageList = [];
			} catch(e) {}

			//Call onFormDataChange event if specified
			if (this.onFormDataChange != null && this.onFormDataChange != "") {
				var p = this.findParent(); 
				this.$nextTick(function() {
					this.onFormDataChange.call(this,
						this.DisplayValues,
						p.ActiveFormData
					);
				});

			}			
		},
		
		//--------------------------------------------------------------------------------------------
		findParent: function() {
			//Find parent which contains active form data
			var p = this.$parent;
			while (p)
			{
				if (p.ActiveFormData != null) break;
				p = p.$parent;
			}
			return p;
		},	

		//--------------------------------------------------------------------------------------------
		setFocus: function(el) {
			el.focus(); 
		},


		//---------------------------------------------------------------------------------------------------
		onEvent: function(...args) {
			var p = this.findParent(); 			
			p.onEvent(...args);
		},
		
		//---------------------------------------------------------------------------------------------------
		onFilterEvent: function(...args) {
			var p = this.findParent(); 			
			p.onFilterEvent(...args);
		},
		
		//---------------------------------------------------------------------------------------------------
		offEvent: function(...args) {
			var p = this.findParent(); 			
			p.offEvent(...args);
		},

		//---------------------------------------------------------------------------------------------------
		emitEvent: function(...args) {
			this.emitEvent2(this, ...args);			
		},

		emitEvent2: function(self,...args) {
			var p = this.findParent(); 			
			p.emitEvent2(self, ...args);
		},

		//---------------------------------------------------------------------------------------------------
		emitFilterEvent: function(...args) {
			this.emitFilterEvent2(this, ...args);			
		},

		emitFilterEvent2: function(self, ...args) {
			var p = this.findParent(); 			
			p.emitFilterEvent2(self, ...args);
		},
		
		//---------------------------------------------------------------------------------------------------
		logEvent: function(...args) {
			var p = this.findParent(); 			
			p.logEvent(...args);
		},
		
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted: function() {

	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
		//Listen for form data change event
		this.onFilterEvent("_FormDataChange", 258, this.guid + this.formType, (self) => {
			this.formDataChangeEvent();
		});

	},	

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

		computedReadOnly: {
			get () { 
				
				if (this.readonly == true || this.formReadOnly == true || (this.DisplayValues != null && this.DisplayValues.readonly == true )) {
					return true;
				} 
				else {
					return false;
				}
			}
		},		
	}
}


