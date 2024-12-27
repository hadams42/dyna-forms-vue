<template>
		<b-form-group
			:class="[select-list, this.name ]"
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
				:requiredField="rules != null && rules.required == true ? true : false"
				:isAdmin="this.isAdmin"
				:adminUnlockable="this.adminUnlockable"
				@locked="onLockToggle()"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
			>
			</component-label>

			<div 
				class="read-only-placeholder"
				v-if="readonly_placeholder != null && valueModel == null && (DisplayValues.disabled || busy || OptionList.length == 0 || (computedReadOnly == true && DisplayValues.readonlyOverride == null) || (DisplayValues.readonlyOverride == true))"
				>{{readonly_placeholder}}</div>

			<!-- <div 
				:class="['form-control readonly', 'input-' + DisplayValues.size]"
				v-if="(valueModel != null && valueModel != '') || !(DisplayValues.disabled || busy || OptionList.length == 0 || (computedReadOnly == true && DisplayValues.readonlyOverride == null) || (DisplayValues.readonlyOverride == true))"
				:style="getReadOnlyStyle()"
				@click="onLockToggle(false)"
			>{{findValueText(valueModel)}}</div> -->

			<base-typeahead
				v-if="!(computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)) && !DisplayValues.disabled && !busy && OptionList.length != 0"
				:id="name"
				:name="name"
				:state="validationState"
				:Validation="Validation"
				:typeaheadQuery="typeaheadQuery"
				:selectedText="findValueText(valueModel)"
				v-model="typeaheadQuery"
				:placeholder="placeholder"
				:options="typeaheadOptions"
				:onInputChange="onInputChange"
				:onItemSelected="onSearchItemSelected"
				:includeValues="includeValues"
				:fieldName="name"
				:allowShowAll="allowShowAll"
				:maxHeight="maxHeight"
				:size="DisplayValues.size"
				@change="fieldChangeEvent($event, false)"
				@input="fieldInputEvent"				
			></base-typeahead>

		</b-form-group>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import selectListMixin from "../shared/SelectListMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import BaseTypeahead from "../shared/BaseTypeahead";
import ComponentLabel from "../shared/ComponentLabel";

export default {
	name: 'TypeaheadInput',

	components: { BaseTypeahead, ComponentLabel },
	
	props: [
		'options', 
		'size', 
		'rows',
		'maxHeight',
		'text',
		'includeValues',
		'allowShowAll',
		'disabled',
		'renderOnChange',
		'readonly_placeholder'
		],

	data () {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				size: this.size == null ? "sm" : this.size,
				visible: this.visible == null ? true : this.visible,
				options: this.options == null ? [] : this.options,
				debounceTime: this.debounceTime == null ? 0 : this.debounceTime,
				disabled: this.disabled != true ? false : this.disabled,
				rows: this.rows == null ? 10 : this.rows,
				includeValues: this.includeValues == null ? false : this.includeValues,
				renderOnChange: this.renderOnChange == null ? false : this.renderOnChange,
				readonly_placeholder: this.readonly_placeholder == null ? "" : this.readonly_placeholder,
			},
			busy: false,
 			typeaheadQuery: '',
      typeaheadOptions: {
				debounceTime: this.debounceTime,
				placeholder: this.placeholder,
				inputClass: "input",
			}

		}
	},

	mixins: [ baseInputMixin, selectListMixin, validationMixin ],
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		onInputChange: function(q, forceAll=false) {
			//Return all if requested
			if (forceAll) {
				return this.OptionList;
			}
			//Convert the incoming value to a string
			var query = this.Utilities.GetStringValue(q);
			//If query is empty, then stop here
			if (query.trim().length === 0) {
        return null
			}


			//If render on change is set, send query to server
			if (this.DisplayValues.renderOnChange) {
				this.valueModel = query;
				this.renderField();
			}

			//Else, render locally from static list of options
			else {
				//Filter and show the matching options
				return this.OptionList.filter((o) => {
					return (o.text.toLowerCase().includes(query.toLowerCase())
						|| (this.DisplayValues.includeValues && o.value.toLowerCase().includes(query.toLowerCase())));
				}).splice(0, this.DisplayValues.rows);
			}
		},
		
		//--------------------------------------------------------------------------------------------
    onSearchItemSelected: function(item) {
			this.valueModel = item.value;
		},
		
		//--------------------------------------------------------------------------------------------
		findValueText: function(value) {
			if (value == null || value == "") {
				return "";
			}

			//Find matching object in array
			let selectedIndex = this.OptionList.findIndex((item) => {
				return item.value == value;
			});

			//If match found, return it
			if (selectedIndex >= 0) {
				return this.OptionList[selectedIndex].text;
			} 
 			//Else, return blank
 			else 
 			{
 				return "";
			}
		},

		//--------------------------------------------------------------------------------------------
		updateQuery: function(v) {
			this.typeaheadQuery = this.findValueText(v);
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created() {

		//Set initial state to disabled
		this.busy = true;

		if (this.DisplayValues.disabled != true) {
			//Listen for options updated event
			this.onFilterEvent("_OptionsUpdated", 182, this.guid + this.formType + this.formName + this.name, (self) => {
				this.busy = false;
				this.updateQuery(self.valueModel);
			});

		}
	},
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {
		
		//--------------------------------------------------------------------------------------------
		valueModel: {
			get () { 
				return (!this.value) ? null : this.value 
			},
			set (v) { 
				this.$emit('change', v);
				this.updateQuery(v);
			},
		},

	}
}


</script>
