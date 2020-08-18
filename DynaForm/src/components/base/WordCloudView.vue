<template>
		<b-form-group
			:class="['word-cloud-view ', DisplayValues.customClasses]"
			v-show="DisplayValues.visible"			
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
			>
			</component-label>

			<div style="
				width: 100%; 
				border: 1px solid #cccc; 
				border-radius: .5rem; 
				padding: .5rem; 
				margin: 1rem; 
				background-color:white;
				line-height: 1.1;
				letter-spacing: 0.01em;
				font-family: Arial;
				word-spacing: .25rem;
				text-align: center;
			">

			<!-- add on click event to select a word. Update the value of this control to match that word or word id
			
				list: [
					{
						id: 0,
						text: "",
						sizeWeight: 0,
						colorWeight: 0,
					}

				]


			
			
			  -->

			<span style="font-size: 2.1vmax; font-weight: 300; color: #8e7e3ebb"><sup>Polish</sup></span>
			<span style="font-size: 5.0vmax; font-weight: 800; color: #8e7e3eff">Swahili</span>
			<span style="font-size: 4.0vmax; font-weight: 700; color: #8e7e3edd">English</span>
			<span style="font-size: 3.0vmax; font-weight: 600; color: #8e7e3eee"><sub>French</sub></span>
			<span style="font-size: 2.0vmax; font-weight: 100; color: #8e7e3eff">Chinese</span>
			<span style="font-size: 2.1vmax; font-weight: 300; color: #8e7e3eee">Polish</span>
			<span style="font-size: 3.5vmax; font-weight: 500; color: #8e7e3edd">German</span>
			<span style="font-size: 3.0vmax; font-weight: 400; color: #8e7e3ecc">Spanish</span>
			<span style="font-size: 2.0vmax; font-weight: 200; color: #8e7e3ebb">Korean</span>
			<span style="font-size: 2.0vmax; font-weight: 100; color: #8e7e3eaa">Hindi</span>
			<span style="font-size: 2.0vmax; font-weight: 200; color: #8e7e3e99">Korean</span>
			
			</div>

 			<!-- <word-cloud
				:data="OptionList"
				nameKey="text"
				valueKey="value"
			>
      </word-cloud> -->


		</b-form-group>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import selectListMixin from "../shared/SelectListMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
	name: 'WordCloud',
		
	components: { ComponentLabel },
	
  props: [
		],

	data () {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				options: this.options == null ? [] : this.options,
				customClasses: this.customClasses == null ? '' : this.customClasses,
			}
		}
	},

	mixins:  [baseInputMixin, selectListMixin, validationMixin ],
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created() {
	},
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {
	}
}


</script>
