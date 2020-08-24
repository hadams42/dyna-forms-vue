<template>
		<div 
			:class="'form-group ' + this.validationClass"
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
				:requiredField="rules != null && rules.required == true ? true : false"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
			>
			</component-label>
			
			<div id="name">
				<multi-select 
					v-model="valueModel" 
					:options="OptionList" 
					:limit="limit" 
					:id="name"
					block
					@change="fieldInputEvent"
				/>
			</div>
			<ul
				v-if="this.Validation.Status  > 0 && this.Validation.MessageList.length > 0"
				class="help-block list-unstyled" style="padding-left: 4px;"
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

		</div>
</template>
<script>
// /* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
// Licensed under the MIT License | https://opensource.org/licenses/MIT  */

// 
// import { MultiSelect } from 'uiv'
// import validationMixin from "../shared/ValidationMixin.js";
// import selectListMixin from "../shared/SelectListMixin.js";
// import baseInputMixin from "../shared/BaseInputMixin.js";

// export default {
// 	name: 'MultiSelectList',
	
// 	components: { MultiSelect },
	
// 	props: [
// 		'options', 
// 		'limit',
// 		'ajaxUrl',
// 		],
	
// 	data () {
// 		return {
// 			OptionList: [],
// 			DisplayValues: {
// 				label: this.label,
// 				visible: this.visible == null ? true : this.visible,
// 				options: this.options == null ? [] : this.options
// 			}
// 		}
// 	},

// 	mixins:[baseInputMixin, selectListMixin, validationMixin],

// 	methods: {
// 	},

// 	created: function() {
// 	},
	
// 	computed: {
// 		valueModel: {
// 			get () { return (!this.value) ? [] : this.value },
// 			set (v) { this.$emit('change', v) },
// 		},
		
// 	}
// }


</script>
