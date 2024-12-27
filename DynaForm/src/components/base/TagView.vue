<template>
		<b-form-group 
			:class="['tag-view', name]"
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
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
				:requiredField="rules != null && rules.required == true ? true : false"
				:isAdmin="isAdmin"
				:adminUnlockable="adminUnlockable"
				@locked="onLockToggle()"				
			>
			</component-label>

			<b-form-tags 
				:id="'tags-with-dropdown-' + name" 
				v-model="valueModel" 
				no-outer-focus 
				no-tag-remove
				:disabled="true"
				@click.native="fieldInputEvent()"
			>
        <template v-slot="{ tags }">
          <ul v-if="tags.length > 0" class="list-inline d-inline-block">
            <li v-for="tag in tags" :key="tag" class="list-inline-item">
              <b-form-tag
                :title="tag"
								:style="{ 'color': getColor(tag), 'backgroundColor': getBackgroundColor(tag) }"
              >{{ tag }}</b-form-tag>
            </li>
          </ul>
        </template>
      </b-form-tags>

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
  name: 'TagView',
	
	components: { ComponentLabel },
	
	props: [
		"limit",
		'options', 
		'onlyExistingTags',
		'defaultColor',
		'defaultBackgroundColor',
		],
	
	data () {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				options: this.options == null ? [] : this.options,
				customClasses: this.customClasses == null ? '' : this.customClasses,
				limit: this.limit == null ? 0 : this.limit,
				onlyExistingTags: this.onlyExistingTags == null ? false : this.onlyExistingTags,
				defaultColor: this.defaultColor == null ? 'white' : this.defaultColor,
				defaultBackgroundColor: this.defaultBackgroundColor == null ? '#346392' : this.defaultBackgroundColor,
			},
		}
	},

	mixins: [baseInputMixin, selectListMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		getColor: function(tag) {
			var c = this.DisplayValues.defaultColor;
			for (var i = 0; i<this.OptionList.length; i++) {
				if (this.OptionList[i].value == tag && this.OptionList[i].color) {
					c = this.OptionList[i].color;
				}
			}
			return c;
		},

		//--------------------------------------------------------------------------------------------
		getBackgroundColor: function(tag) {
			var c = this.DisplayValues.defaultBackgroundColor;
			for (var i = 0; i<this.OptionList.length; i++) {
				if (this.OptionList[i].value == tag && this.OptionList[i].backgroundColor) {
					c = this.OptionList[i].backgroundColor;
				}
			}
			return c;
		}

	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
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

		//--------------------------------------------------------------------------------------------
		valueModel: {
			get () { 
				if (Array.isArray(this.value) ) {
					return this.value;
				} else if (this.value == null) {
					return [];
				} else {
					var v = "" + this.value;
					return v.split(",");
				}
			},
			set (v) { this.$emit('change', v) },
		},

		//--------------------------------------------------------------------------------------------
		AvailableOptions: {
			get () {
				return this.OptionList.filter(o => this.valueModel.includes(o.value) == false);
			}
		},

	}

}
</script>