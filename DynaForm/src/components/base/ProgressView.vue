<template>
<div :class="['progress-view', name]" >
	<component-label
		:forId="name"
		:text="DisplayValues.label"
		:helpText="helpText"
		:helpUrl="helpUrl"
		:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
		:lockMessage="DisplayValues.readonlyMessage"
		:unlockable="!(formReadOnlyLock || readOnlyLock)"
		@locked="onLockToggle()"				
	>
	</component-label>

	<arrow-bar
		:steps="DisplayValues.steps != null ? DisplayValues.steps : getSegmentLabels(DisplayValues.segments)"
		:key="key"
		:style="'no-arrows'"
		:hideNumbers="true"
	>
	</arrow-bar>
</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";
import ArrowBar from "./ArrowBar";
import ComponentLabel from "../shared/ComponentLabel";


export default {
  name: 'ProgressView',
	
	components: { ArrowBar, ComponentLabel },

	props: [
		'segments',
		'progressVariant',
		'remainingVariant',
		'onClick',
		'completedText',
		'notStartedText',
		'placeholderWidth',
		'steps',
		],
	
	data () {
		return {
			DataSegments: [],
			DisplayValues: {
				name: this.name,
				label: this.label,
				steps: this.steps,
				visible: this.visible == null ? true : this.visible,
				segments: this.segments == null ? [] : this.segments,
				progressVariant: this.progressVariant == null ? 'success' : this.progressVariant,
				remainingVariant: this.remainingVariant == null ? 'secondary' : this.remainingVariant,
				completedText: this.completedText == null ? 'Completed' : this.completedText,
				notStartedText: this.notStartedText == null ? 'Not Started' : this.notStartedText,
				customClasses: this.customClasses == null ? '' : this.customClasses,
				placeholderWidth: this.placeholderWidth == null ? 0 : this.placeholderWidth,
			},
			key: 0,
		}
	},

	mixins: [ baseInputMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		getSummary: function(segment) {
			if (segment != null && segment.summary != null && segment.summary != "") {
				return {
					content: this.formatSummary(segment.summary),
					html: true
				};	
			} else {
				if (segment.value == 100) return this.DisplayValues.completedText;
				else if (segment.value == 0) return this.DisplayValues.notStartedText;
				else return '';
			}
		},

		//--------------------------------------------------------------------------------------------
		formatSummary: function(summary) {
			if (summary != null && summary != '') {
				summary =  this.Utilities.ReplaceAll(summary, "|", "</li><li>");
				var result = "<ul><li>" + summary + "</li></ul>";
				return result;
			}
		},

		//--------------------------------------------------------------------------------------------
		getSegmentLabels: function(segments) {
			if (segments == null || segments.length == 0) return [];
			var labelSegments = [];
			var prevStatus = null;
			for (var i=0; i<segments.length; i++) {
				var status = null;
				if (segments[i].value == segments[i].width) {
					status = "past";
				}
				else if (prevStatus == null) {
					status = "past"
				}
				else if (i > 0 && segments[i-1].value == segments[i-1].width && prevStatus == "past" && segments[i].value == 0) {
					status = "current"
				}
				else if (segments[i].value != 0) {
					status = "current"
				}
				else {
					status = "not-current"
				}
				prevStatus = status;

				var label = {
					text: segments[i].label.replace(" &", "&nbsp;&amp;"),
					status: status,
					helpText: this.getSummary(segments[i]),
				}
				labelSegments.push(label);
			}

			return labelSegments;
		},



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
						try {
							this.DisplayValues.segments = p.ActiveFormData[this.name] == null ? [] : JSON.parse(p.ActiveFormData[this.name]);
							this.key++;
						} catch(e) {
							console.log("ERROR: " + e)
						}
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
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
  			this.key++;
				this.onAfterRenderEvent();
			} 
			else {
				this.key++;
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

	}


}
</script>