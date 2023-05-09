<template>
		<b-form-group
			:class="['checkbox-input', DisplayValues.mode, DisplayValues.customClasses, name]"
			v-show="DisplayValues.visible"					
		>
		<div
			@click="onLockToggle(false)"
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:kpiText="kpiText"
				:kpiTitle="kpiTitle"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
				:requiredField="rules != null && rules.required == true ? true : false"
				:isAdmin="this.isAdmin"
				:adminUnlockable="this.adminUnlockable"
				@locked="onLockToggle()"
			>
			</component-label>

			<b-form-radio-group
				v-if="DisplayValues.switch == false && OptionList != null && OptionList.length > 1 && DisplayValues.mode == 'radio'"
				v-model="valueModel"
				:state="validationState"
				:options="OptionList"
				:disabled="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				value-field="value"
				text-field="text"
				@change="fieldChangeEvent($event); fieldInputEvent($event)"				
			></b-form-radio-group>

			<b-form-checkbox 
				v-if="DisplayValues.mode == 'radio' && (DisplayValues.switch == true || OptionList == null || OptionList.length <= 1)"
				:id="name"
				v-model="valueModel"
				:state="validationState"
				:disabled="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				:switch="DisplayValues.switch"
				@change="fieldChangeEvent($event); fieldInputEvent($event)"
			>
				<div :class="[ valueModel == true ? 'checked' : 'unchecked']"
				> 
					{{OptionList != null && OptionList.length > 1 ? valueModel == true ? OptionList[0].text : OptionList[1].text : ''}}
				</div>
			</b-form-checkbox>

			<b-form-checkbox-group 
				v-if="DisplayValues.mode == 'buttons'"
				:id="name"
				v-model="valueModel"
				:options="OptionList"
				html-field="text"
				value-field="value"
				:state="validationState"
				size="sm"
				:class="[DisplayValues.block ? 'block' : '']"
				buttons
				:disabled="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				@change="fieldChangeEvent($event); fieldInputEvent($event)"
				@input="buttonInputEvent($event)"
			>
			</b-form-checkbox-group>
			<b-form-invalid-feedback>
				<ul
					v-if="this.Validation.Status  > 0 && this.Validation.MessageList.length > 0"
					class="help-block list-unstyled" 
					style="padding-left: 4px; margin-bottom: 0"
				>
					<li v-for="(msg, index) in this.Validation.MessageList"
						:key="index"
					>
					{{msg.Label}}
						<a 
							:href="msg.Url"
							v-if="msg.Url != null"
						><span class="glyphicon glyphicon-question-sign"></span></a>
					</li>
				</ul>
			</b-form-invalid-feedback>
		</div>
	</b-form-group>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import selectListMixin from "../shared/SelectListMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
	name: 'CheckboxInput',
		
	components: { ComponentLabel },
	
  props: [
		'options', 
		'switch', 
		'mode',
		'block',
		],

	data () {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				options: this.options == null ? [] : this.options,
				switch: this.switch == null ? true : this.switch,
				mode: this.mode == null ? 'radio' : this.mode,
				block: this.block == null ? false : this.block,
				customClasses: this.customClasses == null ? '' : this.customClasses,
			}
		}
	},

	mixins:[baseInputMixin, selectListMixin, validationMixin],
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		buttonInputEvent: function(value) {
			if (value != null && value.length > 0) {
				for (var z=0; z<value.length;z++) {
					for (var i=0; i<this.OptionList.length;i++) {
						if (this.OptionList[i].value == value[z] && this.OptionList[i].selected == false) {
							var confirmText = this.OptionList[i].altText;
							if (confirmText != null && confirmText != "") {
								this.showMessageDialog(
									"Notice",
									confirmText
								);
								this.OptionList[i].selected = true;
							}
						}
					}
				}
			}
		},
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created() {
			for (var i=0; i<this.OptionList.length;i++) {
				if (this.OptionList[i].selected == true) {
					this.valueModel = this.OptionList[i].value;
				}
			}

	},
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {
		valueModel: {
			get () { return (!this.value) ? false : this.value },
			set (v) { 
				//this.value = v
				this.$emit('change', v) 
			},
		},

	}
}


</script>
