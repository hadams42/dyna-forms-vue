<template>
		<b-form-group 
			class="text-input"
			v-show="DisplayValues.visible"
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				@locked="onLockToggle()"		
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
			>
			</component-label>

			<div 
				:class="['form-control readonly', 'input-' + DisplayValues.size]"
				v-if="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				@click="onLockToggle(false)"
				:style="getReadOnlyStyle()"
			>{{value}}</div>


			<b-form-input 
				v-if="!computedReadOnly || DisplayValues.readonlyOverride == false"
				:id="name"
				type="date"
				:state="validationState"
				:name="name"
				:value="value"
				:size="DisplayValues.size"
				:min="DisplayValues.min"
				:max="DisplayValues.max"
				:style="{'color': DisplayValues.color}"
				@change="fieldChangeEvent"
				@input="fieldInputEvent"
				:placeholder="placeholder"
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
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import textInputMixin from "../shared/TextInputMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'DateInput',
  	
	components: { ComponentLabel },
	
	props: [
			'min',
			'max',
			'size',
			'color'
		],
	
	data () {
		return {
			DisplayValues: {
				multiline: this.multiline == null ?  false: this.multiline,
				rows: this.rows == null ? 3 : this.rows,
				maxRows: this.maxRows == null ? "" : this.maxRows,
				readonlyShowAll: this.readonlyShowAll == null ? true : this.readonlyShowAll,
				size: this.size == null ? "sm" : this.size,
				color: this.color == null ? "#6c757d" : this.color,
				min: this.min,
				max: this.max,
			},
			multilineValue: this.value,
		}
	},

	mixins: [baseInputMixin, textInputMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},

}
</script>