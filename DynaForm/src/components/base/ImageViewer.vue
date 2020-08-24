<template>
	<b-form-group 
		class="image-viewer "
		v-show="DisplayValues.visible"
	>
		<component-label
			:forId="name"
			:text="DisplayValues.label"
			:helpText="helpText"
			:helpUrl="helpUrl"
			:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
			:lockMessage="DisplayValues.readonlyMessage"
			:unlockable="!(formReadOnlyLock || readOnlyLock)"
		>
		</component-label>

		<div class="image-container">
			<b-img 
					:id="name"
					:name="name"
					:src="imageSourceUrl"
					block
					center
					fluid
					style="max-height: 200px"
			>
		</div>
	</b-form-group>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";
import validationMixin from "../shared/ValidationMixin.js";
import { IMAGE_PATH } from '../../models/http-common.js';
import ComponentLabel from "../shared/ComponentLabel";

export default {
	name: 'ImageViewer',
		
	components: { ComponentLabel },
	
  props: [
		'urlPrefix'
	],
	
	data () {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				urlPrefix: this.urlPrefix == null ? '/' : this.urlPrefix,
			}
		}
	},

	mixins: [ baseInputMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {
			//watchedField is the field that changed and triggered this render.

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
		imageSourceUrl: {
			get () { 
				return (this.value == null || this.value == "") ? IMAGE_PATH() + "no_image.png" : this.DisplayValues.urlPrefix + this.value; 
				}
			},		
	}

}
</script>