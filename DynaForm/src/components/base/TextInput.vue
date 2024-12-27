<template>
		<b-form-group 
			:class="['text-input', name, 'is-invalid' ]"
			v-show="DisplayValues.visible"
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:kpiText="kpiText"
				:kpiTitle="kpiTitle"
				:numberLabel="numberLabel"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
				:requiredField="rules != null && rules.required == true ? true : false"
				:isAdmin="this.isAdmin"
				:editIcon="this.editIcon"
				:adminUnlockable="this.adminUnlockable"
				:readonly="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				@locked="onLockToggle()"				
				@editOn="onEditOn()"
				@editOff="onEditOff()"
			>
			</component-label>
			
			<div 
				:class="['form-control readonly','input-' + DisplayValues.size, validationClass, (valueModel == null || valueModel == '' && placeholder != null && placeholder != '') ? 'readonly-placeholder' : ''] "
				v-if="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null) && DisplayValues.nonEditable == false"
				:style="getReadOnlyStyle() + getReadOnlyTextareaStyle()"
				@click="onLockToggle(false)"
				v-html="(valueModel != null && valueModel != '') ? getFormattedValue(valueModel) : getFormattedValue(placeholder)"
			></div>

			<b-textarea
				v-if="DisplayValues.multiline == true && (!(computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)) || DisplayValues.nonEditable == true)"
				:id="name"
				:name="name"
				v-model="valueModel"
				:placeholder="placeholder"
				:rows="DisplayValues.rows"
				:max-rows="DisplayValues.maxRows"
				:state="validationState"
				:class="customClasses"
				:autofocus="autoFocusField==name ? true : false"
				ref="textInput"
				:size="DisplayValues.size"
				:no-resize="noResize"
				@blur.native="onEditOff()"
				@change="fieldChangeEvent($event)"
				:maxLength="DisplayValues.maxLength"
			>
    	</b-textarea>

			<b-form-input 
				v-if="DisplayValues.multiline == false && (!(computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)) || DisplayValues.nonEditable == true)"
				:id="name"
				type="text"
				:state="validationState"
				:size="DisplayValues.size"
				:name="name"
				:readonly="DisplayValues.nonEditable"
				ref="textInput"
				:value="valueModel"
				:autofocus="autoFocusField==name ? true : false"
				@focus.native="$event.target.select()"				
				@blur.native="onEditOff()"
				:class="customClasses"
				:style="{'color': DisplayValues.color, 'background-color': DisplayValues.backgroundColor, 'max-width': DisplayValues.maxWidth > 0 ? DisplayValues.maxWidth + 'px' : 'unset' }"
				@change="fieldChangeEvent($event)"
				@input="fieldInputEvent"
				:placeholder="placeholder"
				v-on:keyup.enter="enterPressed"
				:maxLength="DisplayValues.maxLength"
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
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import textInputMixin from "../shared/TextInputMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'TextInput',
	
	components: { ComponentLabel },
	
	props: [
		'multiline',
		'rows',
		'maxRows',
		'noResize',
		'readonlyShowAll',
		'size',
		'color',
		'backgroundColor',
		'format',
		'onEnterPressed',
		'maxLength',
		'editIcon',
		'nonEditable'
		],
	
	data () {
		return {

			DisplayValues: {
				multiline: this.multiline == null ?  false : this.multiline,
				rows: this.rows == null ? 3 : this.rows,
				maxRows: this.maxRows == null ? "" : this.maxRows,
				readonlyShowAll: this.readonlyShowAll == null ? true : this.readonlyShowAll,
				size: this.size == null ? "sm" : this.size,
				color: this.color == null ? "default" : this.color,
				backgroundColor: this.backgroundColor == null ? "default" : this.backgroundColor,
				readonly: this.readonly == null ? false : this.readonly,
				maxLength: this.maxLength == null ? "4000" : this.maxLength,
				editIcon: this.editIcon == null ? false : this.editIcon,
				nonEditable: this.nonEditable == null ? false : this.nonEditable, 
			},
			//multilineValue: this.value,
		}
	},

	mixins: [baseInputMixin, textInputMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//---------------------------------------------------------------------------------------------------
		onEditOn: function () {
			this.DisplayValues.readonly = false;
			this.DisplayValues.readonlyOverride = false;
			var p = this.findParent(); 
			p.readonly == false 
			this.readonly == false

			this.$nextTick(() => {
				this.$refs.textInput.focus();
			});
		},


		//---------------------------------------------------------------------------------------------------
		onEditOff: function () {
			if (this.DisplayValues.editIcon == true) {
				this.DisplayValues.readonly = true;
				this.DisplayValues.readonlyOverride = true;
				var p = this.findParent(); 
				p.readonly == true 
				this.readonly == true 
			}
		},

		//--------------------------------------------------------------------------------------------
		enterPressed: function() {
				if (this.onEnterPressed != null && this.onEnterPressed != "") {
				var p = this.findParent(); 
				this.onEnterPressed.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//--------------------------------------------------------------------------------------------
		getFormattedValue: function(value) {
			if (value == null) return null;
			var format = this.Utilities.GetStringValue(this.format, "T");
			return this.Utilities.FormatString(value, format);
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
		valueModel: {
			get () { return (!this.value) ? null : this.value },
			set (v) { 
			},
		},

	}
}
</script>