<template>
		<b-form-group
			:class="['select-list ', DisplayValues.customClasses]"
			v-show="DisplayValues.visible"			
			v-on:click.native="onLockToggle(false)"
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:kpiText="kpiText"
				:kpiTitle="kpiTitle"
				:numberLabel="DisplayValues.numberLabel"
				:locked="DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:requiredField="rules != null && rules.required == true ? true : false"
				:isAdmin="isAdmin"
				:adminUnlockable="adminUnlockable"
				@locked="onLockToggle()"				
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
			>
			</component-label>

			<div 
			  class="read-only-placeholder"
				v-if="readonly_placeholder != null && valueModel == null && DisplayValues.disabled || busy || OptionList.length == 0 || (computedReadOnly == true && DisplayValues.readonlyOverride == null) || (DisplayValues.readonlyOverride == true)"
			>{{readonly_placeholder}}</div>

			<b-form-select 
				:id="name"
				v-if="(valueModel != null && valueModel != '') || !(DisplayValues.disabled || busy || OptionList.length == 0 || (computedReadOnly == true && DisplayValues.readonlyOverride == null) || (DisplayValues.readonlyOverride == true))"
				v-model="valueModel"
				:state="validationState"
				:autofocus="autoFocusField==name ? true : false"
				:disabled="DisplayValues.disabled || busy || OptionList.length == 0 || (computedReadOnly == true && DisplayValues.readonlyOverride == null) || (DisplayValues.readonlyOverride == true)"
				:multiple="multi"
				:dir="DisplayValues.align"
				:class="[ validationClass, DisplayValues.disabled || busy || OptionList.length == 0 || (computedReadOnly == true && DisplayValues.readonlyOverride == null) || (DisplayValues.readonlyOverride == true) ? 'readonly' : '', DisplayValues.customClasses, 'form-control']"
				:select-size="DisplayValues.rows"
				:size="DisplayValues.size"
				:style="{'color': DisplayValues.color }"
				@change="fieldChangeEvent($event, false); fieldInputEvent($event);" 
			>
				<option v-for="option in OptionList"
					:key="option.value"
					:value="option.value"
				>
					{{option.text}}
				</option>
			</b-form-select>
			<!-- <span 
				:class="'glyphicon ' + validationIcon + ' form-control-feedback'"
			></span>			 -->
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
	name: 'SelectList',
		
	components: { ComponentLabel },
	
  props: [
		'multi',
		'options', 
		'rows', 
		'size',
		'color',
		'align',
		],

	data () {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				rows: this.rows == null ? 0 : this.rows,
				size: this.size == null ? 'sm' : this.size,
				visible: this.visible == null ? true : this.visible,
				options: this.options == null ? [] : this.options,
				color: this.color == null ? "#6c757d" : this.color,
				align: this.align == null ? "ltr" : this.align,
				customClasses: this.customClasses == null ? '' : this.customClasses,
				placeholder: this.placeholder == null ? null : this.placeholder,
				readonly_placeholder: this.readonly_placeholder == null ? false : this.readonly_placeholder,
				numberLabel: this.numberLabel,
			}
		}
	},

	mixins: [baseInputMixin, selectListMixin, validationMixin ],
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created() {
		var p = this.findParent(); 
		if (p.ActiveFormSettings.showQuestionNumbers == true) {
			if (this.numberLabel && this.numberLabel > 0) {
				p.inputIndex = this.numberLabel - 1;
			}
			p.inputIndex = p.inputIndex != null ? p.inputIndex + 1 : 1;
			this.DisplayValues.numberLabel = p.inputIndex;
		}
		else {
			this.DisplayValues.numberLabel = null;
		}
		
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
			get () { return (!this.value) ? [] : this.value },
			set (v) { this.$emit('change', v) },
		},

	}
}


</script>
