<template>
		<b-form-group 
			:class="['tag-input view', name]"
			v-show="DisplayValues.visible"
			@click.native="containerClickEvent" 
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
				:requiredField="rules != null && rules.required == true ? true : false"
				@locked="onLockToggle()"				
			>
			</component-label>

			<base-tag-input
				:element-id="name + '_TagInput'"
    		:value="DisplayValues.selectedTags"
				:add-tags-on-comma="true"
				:limit="DisplayValues.limit"
				:typeahead-activation-threshold="0"
				:placeholder="placeholder"
				@container-click="dfdfgd()"
				:viewOnly="true"
				:typeahead-style="DisplayValues.typeaheadStyle"
    		:existing-tags-concat="DisplayValues.existingTagsConcat"
    		:existing-colors-concat="DisplayValues.existingTagColors"
    		:existing-background-colors-concat="DisplayValues.existingTagBackgroundColors"
				:only-existing-tags="DisplayValues.onlyExistingTags"
				:default-color = "defaultColor"
				:default-background-color = "defaultBackgroundColor"
    		:typeahead="true"
			>
			</base-tag-input >

		</b-form-group>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import baseTagInput  from '../shared/BaseTagInput';
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'TagView',
	
	components: { baseTagInput, ComponentLabel },
	
	props: [
		"limit",
		"tags",
		"tagField",
		"tagColors",
		"tagColorField",
		"tagBackgroundColors",
		"tagBackgroundColorField",
		"typeaheadStyle",
		"placeholder",
		"onlyExistingTags",
		"defaultColor",
		"defaultBackgroundColor"
		],
	
	data () {
		return {
			DisplayValues: {
				selectedTags: this.value,
				existingTags: {},
				existingTagColors: {},
				existingTagBackgroundColors: {},
				existingTagsConcat: "",
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				limit: this.limit == null ? 0 : this.limit,
				add: this.typeaheadStyle == null ? "badges" : this.typeaheadStyle,
				onlyExistingTags: this.onlyExistingTags == null ? false : this.onlyExistingTags,
			},
		}
	},

	mixins: [baseInputMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

	//--------------------------------------------------------------------------------------------
	containerClickEvent() {
		this.fieldInputEvent();
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
		if (this.tags != null) {
			this.DisplayValues.existingTags = this.tags;
			this.DisplayValues.existingTagColors = this.tagColors == null ? [] : this.tagColors;
			this.DisplayValues.existingTagBackgroundColors = this.tagBackgroundColors == null ? [] : this.tagBackgroundColors;
		} 
		else if (this.tagField != null) {
			var p = this.findParent(); 
			this.DisplayValues.existingTags = p.ActiveFormData[this.tagField].split(',');
			this.DisplayValues.existingTagsConcat = this.DisplayValues.existingTags.join("|");
			this.DisplayValues.existingTagColors = this.tagColorField == null ? [] : p.ActiveFormData[this.tagColorField].split(',');
			this.DisplayValues.existingTagBackgroundColors = this.tagBackgroundColorField == null ? [] : p.ActiveFormData[this.tagBackgroundColorField].split(',');
		}
	},

}
</script>