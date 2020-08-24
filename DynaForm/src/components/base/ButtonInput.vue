<template>
	<b-form-group 
		:class="['button-input', name]"
		v-show="DisplayValues.visible && (computedReadOnly == false || alwaysShow == true)"
		:style="DisplayValues.hidden ? 'visibility: hidden' : ''"
	>
		<b-link
			v-if="icon != null && icon != ''"
			@click="buttonClicked"
			class="icon-button"
			:id="name"
			:disabled="DisplayValues.disabled"
			type="button"
		>
			<i
				:class="['icon far',icon,DisplayValues.customButtonClass,getClasses()]"
			></i>
			<span 
				v-html="getTemplate()"
				:class="['icon-label',DisplayValues.customButtonClass,getClasses()]"
			>
			</span>
		</b-link>


		<b-button
			v-if="icon == null || icon == ''"
			:name="name"
			@click="buttonClicked"
			:class="[getClasses(), DisplayValues.customButtonClass]"
			:id="name"
			:size="size"
			:block="DisplayValues.block"
			:variant="DisplayValues.variant"
			:disabled="DisplayValues.disabled"
			:type="DisplayValues.type"
			v-html="getTemplate()"
			>
		</b-button>
	</b-form-group>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import { ServerInterface } from "../../ServerInterface.js";
import baseMixin from "../shared/BaseMixin.js";
import { FormModel } from '../../models/form.model.js';

export default {
	name: 'ButtonInput',
	
  props: [
		'placeholder', 
		'icon',
		'size',
		'action',
		'template',
		'block',
		'verticalAlignment',
		'alwaysShow',
		'disabled',
		'customButtonClass',
		'variant',
		'type'
		],

	data () {
		return {

			ServerInterface: new ServerInterface(),

			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				hidden: this.hidden == null ? false : this.hidden,
				disabled: this.disabled == null ? false : this.disabled,
				block: this.block == null ? true : this.block,
				variant: this.variant == null ? "secondary" : this.variant,
				customButtonClass: this.customButtonClass == null ? "" : this.customButtonClass,
				size: this.size == null ? "sm" : this.size,
				type: this.type == null ? "button" : this.type,
				template: this.template,
			}

		}
	},

	mixins: [ baseMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		getTemplate: function() {
			if (this.DisplayValues.template != null) {
				var p = this.findParent();
				var result = this.DisplayValues.template;

				var re = /\{(.+?)\}/g;
				var match;

				do {
						match = re.exec(this.DisplayValues.template);
						var v = '';
						if (match) {
								if (match[1].includes(".")) {
									var e = match[1].split(".");
									v = p.ActiveFormData[e[0]][e[1]] || '';
								} else {
									v = p.ActiveFormData[match[1]] || '';
								}
								//result = result.replace("{" + match[1] + "}", v);
								result = this.Utilities.ReplaceAll(result, "{" + match[1] + "}", v);
						}
				} while (match);
				return result;
			} 
			else {
				return this.DisplayValues.label;
			}
		},		

		//--------------------------------------------------------------------------------------------
		buttonClicked: function() {
			if (typeof this.action != "undefined" && this.action != null) {
				var p = this.findParent();
				//If local action is defined, then perform it
				if (this.action.onClick != null && this.action.onClick != "") {
					this.action.onClick.call(this,
						this.DisplayValues,
						p.ActiveFormData,
						function(cmd, parameters) {
							this.FormActions.LocalAction(this, this.formType, this.guid, cmd, parameters);
						}.bind(this)
						,function(e) {
							console.log("Error: ", e, this.name);
						}.bind(this)
						,this.name //value
					);
				} 
				//Else if server action is defined then perform it
				else {
					this.FormActions.ServerAction(this, 
						this.action, 
						this.instanceId, 
						p.ActiveFormData._Id, 
						this.DisplayValues,
						null, //Sucess callback. Used by button bar, etc.
						null, //Error callback. Used by button bar, etc.
						)
				}			
			} 
		},

		// //--------------------------------------------------------------------------------------------
		// loadFieldEvent: function() {
		// 	if (this.onLoad != null && this.onLoad != "") {
		// 		var p = this.findParent(); 
		// 		this.onLoad.call(this,
		// 			this.DisplayValues,
		// 			p.ActiveFormData,
		// 			function(e) {
		// 				console.log("Error: ", e, this.name);
		// 			}.bind(this)
		// 		);
		// 	}			
		// },

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {

			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				if (this.onRender != null && this.onRender != "") {
					console.log("WARNING: Local event 'onRender' ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				//Call server render interface
				var p = this.findParent();
				this.ServerInterface.RenderField(this,
					this.instanceId,
					this.name,
					watchedField,
					this.DisplayValues,
					p.ActiveFormData,
					function() {
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				return;
			} 

			//Else, call local onRender if specified
			else if (this.onRender != null && this.onRender != "") {
				var p = this.findParent(); 
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function() {
						//Success code here
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
		getClasses: function() {
			//Get classes for buttons
			if (this.icon == null || this.icon == "") {
				if (this.verticalAlignment == "grid") {
					return "button-grid-align";
				} else return "";
			}
			//Else, get classes for icons
			else {
				var c = "";
				switch(this.DisplayValues.size) {
					case "small":
					case "sm":
						c = "small-size";
						break;
					case "default":
						c = "default-size";
						break;
					case "medium":
					case "med":
					case "md":
						c = "default-size";
						break;
					case "large":
					case "lg":
						c = "large-size";
						break;
					case "extra-large":
					case "xl":
						c = "extra-large-size";
						break;
					default:
						c = "default-size";
						break;
				}

				return c;
			}
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {

		//Trigger onLoad event
		this.loadFieldEvent();

		//Perform initial render
		this.renderField();

		//Listen for render event
		this.onFilterEvent("_Render", 274, this.guid + this.formType + this.name, (self, watchedField, clearValue = false) => {
				this.renderField(watchedField, clearValue);
		});
	},

}
</script>

