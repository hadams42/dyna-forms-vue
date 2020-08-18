<template>
	<div :class="['arrow-bar', name ]"
	>
		<ol :class="[showArrows == true ? 'arrow-progress-bar' : 'list-progress-bar', name]">
			<li 
				v-for="(item, index) in this.DisplayValues.steps"
				:key="index"
				:class="[showArrows == true ? 'arrow-progress-bar__steps' : 'list-progress-bar__steps', item.status]"
				href="#" 
				:disabled="item.helpText == null || item.helpText == ''"
				tabindex="0"
				v-b-popover.hover.click.blur.right="item.helpText"
			>        				
				<div :class="[showArrows == true ? 'arrow-progress-bar__steps--text' : 'list-progress-bar__steps--text']">
						<span v-if="hideNumbers != true"
						:class="[showArrows == true ? 'arrow-progress-bar__steps--numbers' : 'list-progress-bar__steps--numbers']"
					></span>
						<div class="label-text">
							<span v-if="showArrows !== true"
								:class="[item.status, 'icon']">
								<i class="fas fa-check"></i>
							</span>
							<span class="text"
								v-html="item.text">
							</span>
						</div>
					</div>
			</li>
		</ol>
	</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";

export default {

  name: 'ArrowBar',
	
	props: [
		'steps',
		'hideNumbers',
		'showArrows',
		],
	
	data () {
		return {
			key: 0,
			DisplayValues: {
				steps: this.steps == null ? [] : this.steps,
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
		

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},

}
</script>