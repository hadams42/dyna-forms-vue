<template>
	<select-list
			v-bind="$props"
			:multi="false"
			:options="options" 
			:valueField="computedValueField"
			textField="name"			
			@change="updateField($event)"		
			ref="currencyPicker"
		/>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import SelectList from "../base/SelectList"
import derivedComponentMixin from "./DerivedComponentMixin.js";

export default {
  name: 'CurrencyPicker',

	components: { SelectList },

	props: [
		'valueField',
		'showEmptyOption',
		'showAllOption',
		'showEmptyOptionText',
		'showAllOptionText'
	],
	
	data () {
		return {
			options: [],
			errors: []
		}
	},

	mixins: [ derivedComponentMixin ],

	methods: {
		
    updateField(selectedValue) {
      this.$emit('change', selectedValue);
		}
		
	},
	
	computed: {
		computedValueField: function() {
			//default to returning the full name
			if (this.valueField == null || this.valueField == "") {
				return "name";
			} else {
				return this.valueField;
			}
		}
	},
	
	async created() {
    try {
			var list = [];
			const response = await axios.get('/json/currencies.json'); 
      for(var i=0; i<response.data.length; i++) {
				var o = { name: response.data[i].name, code: response.data[i].code };
				list.push(o);			
			}
			this.$refs.currencyPicker.updateOptions(list);
    } catch (e) {
       console.log("ERROR: " + this.name + ": " + e);
	  }

  }
}


</script>