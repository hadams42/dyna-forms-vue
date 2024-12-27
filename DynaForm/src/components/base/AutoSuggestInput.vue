<template>
		<b-form-group
			:class="['auto-suggest-input', DisplayValues.customClasses]"
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

			<div>
				<vue-autosuggest
					ref="autocomplete"
					:id="this.name"
					:suggestions="suggestions"
					:inputProps="inputProps"
					:sectionConfigs="sectionConfigs"
					:getSuggestionValue="getSuggestionValue"
					@click="clickHandler"
					@focus="focusHandler"
				>
					<template slot-scope="{suggestion}">
						<div 
							:class="[suggestion.item.index % 2 == 0 ? 'alternate-row' : '' ,'suggestion-row']"
						>
							<span class="suggestion-text">
								{{suggestion.item[DisplayValues.textField]}}
							</span> 
							<span class="suggestion-suffix" v-if="DisplayValues.textField != null && suggestion.item[DisplayValues.suffixField] != ''">
								{{suggestion.item[DisplayValues.suffixField]}}
							</span> 
							<span class="suggestion-label" v-if="DisplayValues.labelField != null && suggestion.item[DisplayValues.labelField] != ''">
								{{suggestion.item[DisplayValues.labelField]}}
							</span> 
						</div>
					</template>
				</vue-autosuggest>
			</div>	
			<b-form-input 
				:state="validationState"
				:style="{'display': 'none'}"
			></b-form-input>
			<b-form-invalid-feedback >
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


import { VueAutosuggest } from "vue-autosuggest";
import axios from "axios";
import validationMixin from "../shared/ValidationMixin.js";
import selectListMixin from "../shared/SelectListMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
	name: 'AutoSuggestInput',
	
	components: { VueAutosuggest,	ComponentLabel	},
	
  props: [
		//'limitToList'
		'valueField',
		'textField',
		'labelField',
		'suffixField',
		'optionsUrl',
		'postCommand',
		'filterOnClient',
		'rows'
		],

	data () {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				customClasses: this.customClasses == null ? '' : this.customClasses,
				visible: this.visible == null ? true : this.visible,
				textField: this.textField,
				valueField: this.valueField == null ? this.textField : this.valueField,
				labelField: this.labelField,
				suffixField: this.suffixField,
				filterOnClient: this.filterOnClient == null && this.postCommand  != null ? false : this.filterOnClient == null ? true : this.filterOnClient,				
			},


			results: [],
      timeout: null,
      selected: null,
      debounceMilliseconds: 500,
      inputProps: {
        id: "autosuggest__input",
        onInputChange: this.fetchResults,
        placeholder: this.placeholder == null ? null : this.placeholder,
        class: "form-control",
				name: this.name,
				size: this.size == null ? 'sm' : this.size,
				initialValue: this.value || '',
      },
      suggestions: [],
      sectionConfigs: {
        mainSection: {
          limit: this.rows == null ? 13 : this.rows,
          onSelected: selected => {
						this.selected = selected.item;
						this.valueModel = selected.item[this.DisplayValues.valueField];
          }
        },
      }			
		}
	},

	mixins:[baseInputMixin, selectListMixin, validationMixin],
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		// //--------------------------------------------------------------------------------------------
		// //For use with @select="selectHandler"
		// selectHandler: function(val, oldVal) {
		// },

		//--------------------------------------------------------------------------------------------
		focusHandler() {
				// items are selected by default on click, but you can add some more behavior here!
		},		


		//--------------------------------------------------------------------------------------------
		clickHandler(item) {
				// items are selected by default on click, but you can add some more behavior here!
		},		

		//--------------------------------------------------------------------------------------------
  	fetchResults: function(val, oldVal) {
			if (val != oldVal) {
				this.valueModel = val;
			} else return;

			//If an AJAX URL is specified
			if (this.optionsUrl != null) {
				clearTimeout(this.timeout);
				this.timeout = setTimeout(() => {
				const optionsPromise = axios.get(this.optionsUrl, {params: {query: this.valueModel}});

				Promise.all([optionsPromise]).then(values => {
					this.suggestions = [];
					this.selected = null;
					const options = this.filterResults(values[0].data, val, this.DisplayValues.textField);
						if (options && options.length) {
							this.suggestions.push({ name: "mainSection", data: options });
						}
					});
				}, this.debounceMilliseconds);
			}
			//Else, if we are using ServerInterface
			else if (this.postCommand != null) {
				clearTimeout(this.timeout);	
				this.timeout = setTimeout(() => {
					var p = this.findParent();
					var postCommand = {
						command: {
							recordKey: -1,
							instanceId: this.instanceId,
							command: this.postCommand,
							data: { query: this.valueModel}
						}
					}

					this.ServerInterface.PostForm(this, 
						this.instanceId, 
						p.ActiveFormData,
						postCommand,
						this.DisplayValues,
						function(cbAction) {
							this.suggestions = [];
							this.selected = null;
							const options = this.filterResults(this.DisplayValues.options, val, this.DisplayValues.textField);
							if (options && options.length) {
								this.suggestions.push({ name: "mainSection", data: options });
							}
						}.bind(this),
						function(cbAction, e) {
							console.log("POST ERROR:", e);
						}.bind(this),
						false,
						true
					);
				}, this.debounceMilliseconds);
			} 
			else {
				console.log("No optionsUrl or postCommand specified.")
			}
    },

		//--------------------------------------------------------------------------------------------
		filterResults: function(data, text, field) {
			if (this.DisplayValues.filterOnClient == true) {
				 return data
        .filter(item => {
          if (item[field].toLowerCase().indexOf(text.toLowerCase()) > -1) {
            return item[field];
          }
        })
        .sort();
			}
			else {
				return data
			}
		},
		
		//--------------------------------------------------------------------------------------------
    renderSuggestion: function(suggestion) {
      return suggestion.item[this.DisplayValues.textField];
		},
		
		//--------------------------------------------------------------------------------------------
    getSuggestionValue: function(suggestion) {
			let { name, item } = suggestion;
			return item[this.DisplayValues.textField];
    }		
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
		valueModel: {
			get () { 
					if (! this.value) {
						return null;
					}
					else {
						return this.value;
					}
			},
			set (v) { 
				this.$emit('change', v) 
			},
		},

	}
}


</script>

