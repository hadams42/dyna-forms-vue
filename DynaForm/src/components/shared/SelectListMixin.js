/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import { Utilities } from "../../Utilities.js";
import { ServerInterface } from "../../ServerInterface.js";

export default {

  props: [
		'valueField',
		'textField',
		'ajaxUrl',
		'showEmptyOption',
		'showEmptyOptionText', 
		'showAllOption', 
		'showAllOptionText',
	],

	data() {
		return {
			Utilities: new Utilities(),
			ServerInterface: new ServerInterface(),
			OptionList: [],			
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		refresh: function() {
			this.renderField();
		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField, clearValue) {
			//watchedField is the field that changed and triggered this render.
			if (clearValue) {
				this.clearValue();
			}

			if (typeof watchedField == "undefined") {
				watchedField = null;
			}

			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				//Warn if both local and server renders are specified
				if ((this.onRender != null && this.onRender != "") || (this.options != null && this.options.length > 0)) {
					console.log("WARNING: Local event 'onRender' and locally specified options are ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				
				//Call server render interface
				var p = this.findParent();
				this.ServerInterface.RenderField(this,
					this.instanceId,
					this.name,
					watchedField,
					this.DisplayValues,
					p.ActiveFormData,
					function(data) {
						this.updateOptions();
						if (this.updateByValue != null) {
							this.updateByValue(data[this.name]);
						} 
						else {
							this.valueModel = data[this.name];
						}
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}

			//Load locally specified options if defined
			else if (this.options != null && this.options.length > 0) {
				this.updateOptions(this.options);
			}

			//Else, if an ajax url source is provided, use it to populate the option list
			else if ((this.DisplayValues.options == null || this.DisplayValues.options.length == 0) && (this.ajaxUrl != null && this.ajaxUrl != "")) {
				this.loadAjax();
				return; //After ajax load, a callback will restart this method from the top
			}

			//Call local onRender if specified
			if ((this.onRender != null && this.onRender != "")) {
				//Call onRender, passing in relevant data objects
				var p = this.findParent();
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function(OptionsUpdated=true) {
						if (OptionsUpdated == null || OptionsUpdated == true) {
							this.updateOptions();
						}
						if (this.updateByValue != null) {
							this.updateByValue(p.ActiveFormData[this.name]);
						}
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} else {
				this.onAfterRenderEvent();
			}
		},

		//--------------------------------------------------------------------------------------------
		onAfterRenderEvent: function() {
			//Call onAfterRender, passing in relevant data objects
			if (this.onAfterRender != null && this.onAfterRender != "") {
				var p = this.findParent();
				this.onAfterRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		loadAjax: function() {
			axios.get(this.ajaxUrl)
							.then(function (r) {
								this.updateOptions(r.data);
								this.renderField();
							}.bind(this))
							.catch(function (e) {
								console.log("Error: ", e, this.name);
							})
		},

		//--------------------------------------------------------------------------------------------
		updateOptions: function(newOptions) {
			var list = [];		
			//If options provided as a parameter, then read them in now
			if (newOptions != null) {
				this.DisplayValues.options = newOptions;
			}
			//If "empty option" is desired
			if (this.showEmptyOption == true) {
				var o = {value: null, text: this.showEmptyOptionText};
				list.push(o);
			}
			//If "all" option is desired
			if (this.showAllOption == true) {
				var o = {value: '*', text: this.showAllOptionText};
				list.push(o);
			}
			//Read in value field names
			var thisTextField;
			if (this.DisplayValues.valueField != null) {
				thisValueField = this.DisplayValues.valueField;
			} else if (this.valueField != null) {
				thisValueField = this.valueField;
			} else {
				thisValueField = "value";
			}

			//Read in text field names
			var thisValueField;
			if (this.DisplayValues.textField != null) {
				thisTextField = this.DisplayValues.textField;
			} else if (this.textField != null) {
				thisTextField = this.textField;
			} else {
				thisTextField = "text";
			}

			//If no value/text fields are specified -- items are just a simple list
			if (this.DisplayValues.options != null && this.DisplayValues.options.length > 0 && this.DisplayValues.options[0][thisValueField] == null) {
				for (var i=0; i<this.DisplayValues.options.length; i++) {
					var o = {
						index: i,
						value: this.DisplayValues.options[i],
						text: this.DisplayValues.options[i],
						disabled: false,
						onClick: null,
						variant: this.DisplayValues.inactiveVariant || "secondary",
						action: null,
						flag: false,
						active: false,
						selected: false,
						groupLabel: null,
						groupIndex: 0,
						groupValue: null,
						icon: null,
						description: null,
						backgroundColor: null,
						textColor: null,
						cssClass: null,
						helpUrl: null,
						activity: {},
						selected: null,
						altText: null,
					};
					list.push(o);
				}
			} 
			//If value/text fields are specified
			else {
				for (var i=0; i<this.DisplayValues.options.length; i++) {
					var o = {
						index: i,
						value: this.DisplayValues.options[i][thisValueField],
						text: this.DisplayValues.options[i][thisTextField],
						disabled: this.DisplayValues.options[i]["disabled"],
						onClick: this.DisplayValues.options[i]["onClick"],
						variant: this.DisplayValues.options[i]["variant"],
						action: this.DisplayValues.options[i]["action"],
						active: this.DisplayValues.options[i]["active"],
						selected: this.DisplayValues.options[i]["selected"],
						flag: this.DisplayValues.options[i]["flag"],
						groupLabel: this.DisplayValues.options[i]["groupLabel"],
						groupIndex: this.DisplayValues.options[i]["groupIndex"],
						groupValue: this.DisplayValues.options[i]["groupValue"],
						icon: this.DisplayValues.options[i]["icon"],
						description: this.DisplayValues.options[i]["description"],
						backgroundColor: this.DisplayValues.options[i]["backgroundColor"],
						textColor: this.DisplayValues.options[i]["textColor"],
						cssClass: this.DisplayValues.options[i]["cssClass"],
						helpUrl: this.DisplayValues.options[i]["helpUrl"],
						activity: this.DisplayValues.options[i]["activity"],
						selected: this.DisplayValues.options[i]["selected"],
						altText: this.DisplayValues.options[i]["altText"],
					};
					list.push(o);
				}
			}
			//Assign list to control
			this.OptionList = list;
			
			//Sort if required
			if (this.DisplayValues.group == true) {
				if (this.sortGroups != null) this.sortGroups();
			}

			//Send bus message that options have been changed
			this.emitFilterEvent("_OptionsUpdated", this.guid + this.formType + this.formName + this.name);
		},
	
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},	
	

}


