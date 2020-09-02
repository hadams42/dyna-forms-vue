<template>
	<div :class="['label-field component-label', name]"
		v-if="DisplayValues.templateHtml != null && DisplayValues.templateHtml != '' && DisplayValues.visible != false"
		v-show="DisplayValues.hidden == false"
	>
		<a
				:class="['link']"
				v-html="DisplayValues.templateHtml"
				v-if="DisplayValues.type == 'link'"
				href="#"
				@click="labelClick"
		></a>

		<span
			class="label-caption"
			v-html="label"
			v-if="label != null && label != ''"
		></span>


		<span
			class="label-value"
			v-html="DisplayValues.templateHtml"
			v-if="DisplayValues.type == 'label'"
		></span>

		<span
			:class="[DisplayValues.badgeContainer, 'pointer', 'hot-track']"
			v-if="DisplayValues.type == 'badge'"
			@click="labelClick"
		>
			<b-badge
					:class="DisplayValues.customClasses"
					v-html="DisplayValues.templateHtml"
					:variant="DisplayValues.variant"
			></b-badge>	
		</span>		

		<a v-if="helpText != null || helpUrl != null"
				:href="helpUrl" target="blank" 
				:tabindex="-1"
				v-b-popover="{content: helpText, boundaryPadding: 20, placement: 'auto', trigger: 'hover focus click blur'  }"
				class="help"
		><i class="fas fa-info-circle"></i>
		</a>

	</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";

export default {
  name: 'LabelField',
	
	props: [
		'html',
		'template',
		'type',
		'variant',
		'badgeContainer',
		'action',
		'helpText',
		'hideMissingValues',
		'format',
		'commas',
		'hidden',
		'readValuesFromSelf'
		],
	
	data () {
		return {
			DisplayValues: {
				html: this.html != null ? this.html : this.value,
				type: this.type == null ? 'label' : this.type,
				visible: this.visible == null ? true : this.visible,				
				variant: this.variant == null ? 'secondary' : this.variant,
				badgeContainer: this.badgeContainer == null ? 'h4' : this.badgeContainer,
				templateHtml: "",
				customClasses: this.customClasses == null ? '' : this.customClasses,
				hideMissingValues: this.hideMissingValues == null ? false : this.hideMissingValues,
				commas: this.commas == null ? "" : this.commas, 
				hidden: this.hidden == null ? false : this.hidden,
				readValuesFromSelf: this.readValuesFromSelf == null ? false : this.readValuesFromSelf,
			}
		}
	},

	mixins: [ baseInputMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		labelClick: function(e) {
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
						,function(error) {
							console.log("Error: ", error, this.name);
						}.bind(this),
						e //value
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


		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {
			var p = this.findParent(); 

			if (this.enableServerRender == true) {
				//Call server render interface
				this.ServerInterface.RenderField(this,
					this.instanceId,
					this.name,
					watchedField,
					this.DisplayValues,
					p.ActiveFormData,
					function() {
						if (this.DisplayValues.readValuesFromSelf) {
							this.DisplayValues.templateHtml = this.getTemplate.call(this, p.ActiveFormData[this.name]);
						} else {
							this.DisplayValues.templateHtml = p.ActiveFormData[this.name];
						}
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} 

			//Call local onRender if specified
			if (this.onRender != null && this.onRender != "") {
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function() {
						//Success code here
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);

				if (this.DisplayValues.readValuesFromSelf) {
					this.DisplayValues.templateHtml = this.getTemplate.call(this, p.ActiveFormData[this.name]);
				} else {
					this.DisplayValues.templateHtml = p.ActiveFormData[this.name];
					this.DisplayValues.templateHtml = this.getTemplate.call(this, p.ActiveFormData);
				}

			} 

			this.onAfterRenderEvent();
		},
		
		//--------------------------------------------------------------------------------------------
		getTemplate: function(templateValues) {

			var result = null;
			if (this.template != null) {
				result = this.template;
				var re = /\{(.+?)\}/g;
				var match;
				var isFound = false;
				var isTemplate = false;

				while (result.includes("{") && result.includes("}")) {
					match = re.exec(result);
					isTemplate = true;
					var v = '';
					if (match) {
						if (match[1].includes(".")) {
							var e = match[1].split(".");
							v = templateValues[e[0]][e[1]] || '';
						} else {
							v = templateValues[match[1]] || '';
						}
						var replacementValue = null;
						if (v.length == 10) {
							var event = new Date(v);
							if (Boolean(+event)) {
								var options = {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								};
								replacementValue = event.toLocaleDateString(undefined, options);
							}
						}
						if (replacementValue == null) {
							replacementValue = v;
						}
						if (replacementValue != null && replacementValue != '') {
							isFound = true;
						}
						if (this.format != null && isNaN(parseFloat(replacementValue)) == false) {
							replacementValue = this.Utilities.FormatString(replacementValue, this.format);
						}
						result = this.Utilities.ReplaceAll(result, "{" + match[1] + "}", replacementValue);
					}
				}

				if (isFound == false && isTemplate == true && this.DisplayValues.hideMissingValues) {
					result = "";
				}
			} else {
				result = this.DisplayValues.html;
			}

			if (this.DisplayValues.commas.toUpperCase() == 'COLLAPSE') {
				result = this.collapseCommas(result);
			}

			return result;			
		},
		
		//--------------------------------------------------------------------------------------------
		collapseCommas: function(value) {
			value = this.Utilities.ReplaceAll(value, ", ,", ", ");
			value = this.Utilities.ReplaceAll(value, ", ,", ", ");
			value = this.Utilities.ReplaceAll(value, ", ,", ", ");
			return value;
		},
		
	},




	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

	}


}
</script>