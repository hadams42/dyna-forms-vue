<template>
		<b-form-group 
			:class="['tag-input', name]"
			v-show="DisplayValues.visible"
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
				:requiredField="rules != null && rules.required == true ? true : false"
				@locked="onLockToggle()"				
			>
			</component-label>

			<b-form-tags 
				:id="'tags-with-dropdown-' + name" 
				v-model="valueModel" 
				no-outer-focus 
				separator=",;"
				class="mb-2"
			>
        <template v-slot="{ tags, inputAttrs, inputHandlers, addTag, removeTag }">
          <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-2">
            <li v-for="tag in tags" :key="tag" class="list-inline-item">
              <b-form-tag
                @remove="removeTag(tag)"
                :title="tag"
								separator=","
								:state="validationState"
								:style="{ 'color': getColor(tag), 'backgroundColor': getBackgroundColor(tag) }"
              >{{ tag }}</b-form-tag>
            </li>
          </ul>
					<b-dropdown-item-button
						v-for="option in AvailableOptions"
						:key="option.value"
						:value="option.value"
						@click="onOptionClick({ option, addTag })"
					>
						<span class="option-icon" :style="{ 'color': option.backgroundColor == null ? DisplayValues.defaultBackgroundColor : option.backgroundColor }"
						><i class="fas fa-plus"></i></span>
						<span class="option-text"
						:style="{ 'color': option.backgroundColor == null ? DisplayValues.defaultBackgroundColor : option.backgroundColor }"
						>{{ option.text }} </span>
					</b-dropdown-item-button>
					<b-input-group aria-controls="my-custom-tags-list">
          	<input
							v-bind="inputAttrs"
							v-on="inputHandlers"
							:placeholder="DisplayValues.placeholder"
							class="form-control">
	        </b-input-group>

        </template>
      </b-form-tags>

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
  name: 'TagInput',
	
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
				placeholder: this.placeholder == null ? "New Tag" : this.placeholder,
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
		onOptionClick({ option, addTag }) {
				addTag(option.value)
			},

		//--------------------------------------------------------------------------------------------
		getColor: function(tag) {
			var c = this.DisplayValues.defaultColor;
			for (var i = 0; i<this.OptionList.length; i++) {
				if (this.OptionList[i].value == tag && this.OptionList[i].color != null) {
					c = this.OptionList[i].color;
				}
			}
			console.log("fore",c);
			return c;
		},

		//--------------------------------------------------------------------------------------------
		getBackgroundColor: function(tag) {
			var c = this.DisplayValues.defaultBackgroundColor;
			for (var i = 0; i<this.OptionList.length; i++) {
				if (this.OptionList[i].value == tag && this.OptionList[i].backgroundColor != null) {
					c = this.OptionList[i].backgroundColor;
				}
			}
			console.log("bacl",c);
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