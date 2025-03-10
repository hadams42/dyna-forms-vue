<template>
	<div>
		<b-form-group
			:class="['number-input', name]"			
			v-show="DisplayValues.visible"			
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
				:class="['form-control text-input readonly', 'input-' + DisplayValues.size]"
				v-if="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				@click="onLockToggle(false)"
			>{{value}}</div>

			<b-form-input 
				:id="name"
				v-if="!(computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null))"						
				
				:state="validationState"
				:name="name"
				type="number"
				v-model="valueModel"
				:step="DisplayValues.step"
				@focus.native="$event.target.select()"	
				:pattern="DisplayValues.pattern"				
				@change="fieldChangeEvent"
				@input="fieldInputEvent"
				:placeholder="placeholder"
				:style="{'color': DisplayValues.color, 'max-width': DisplayValues.maxWidth > 0 ? DisplayValues.maxWidth + 'px' : 'unset' }"
				:autofocus="autoFocusField==name ? true : false"
				:size="DisplayValues.size"				
				:min="minValue"
				:max="maxValue"
			></b-form-input>
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
	</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import textInputMixin from "../shared/TextInputMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'NumberInput',
	
	components: { ComponentLabel },
	
	props: [
		'minValue', 
		'maxValue', 
		'size',
		'color',
		'pattern',
		'step'
		 ],

	data () {
		return {

			valueModel: this.value == null ? 0 : this.value,

			DisplayValues: {
				size: this.size == null ? "sm" : this.size,
				color: this.color == null ? "#6c757d" : this.color,		
				pattern: this.pattern == null ? "[0-9]*" : this.pattern,
				step: this.step == null ? 1 : this.step,
			}	
		}
	},

	mixins:[baseInputMixin, textInputMixin, validationMixin],

	methods: {

	},

	created: function() {
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
	},

	watch: {
			valueModel: function(newValue, oldValue) {
				let result = Number(newValue.replace(",", "")).toString();
				if (isNaN(result) == true) {
					result = ""
				}
				this.$nextTick(() => this.valueModel = result);
			}
	}

}
</script>