<template>
	<div>
		<div v-if="(OptionList == null || OptionList.length == 0) && DisplayValues.emptyText != '' && DisplayValues.visible == true"
			v-show="DisplayValues.hidden == false"
			class="empty-text"
		>
			{{DisplayValues.emptyText}}			
		</div>
		<b-form-group
			:class="['button-bar', name]"
			v-show="DisplayValues.visible && (computedReadOnly == false || alwaysShow == true) && OptionList != null && OptionList.length > 0"
			:style="DisplayValues.hidden ? 'visibility: hidden' : ''"
			:label="DisplayValues.label"
		>
			
			<div v-if="(mode == null || mode == 'buttons') && DisplayValues.group == false">
				<b-button-group
					:style="block == true ? {'width': '100%'} : {}"
					:id="name"
					:disabled="computedReadOnly || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
					:multiple="true"
					:size="size"
					:vertical="direction == 'vertical'"
				>
					<b-button
						v-for="option in OptionList"
						:key="option.value"
						:block="block"
						:disabled="option.disabled || DisplayValues.disabled || DisplayValues.loading || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
						:variant="getVariant(option)"
						:class="[option.cssClass, option.value]"						
						@click="buttonClicked($event, option)"
					>
						<i v-if="option.icon != null && option.icon != ''" 
							:class="option.icon"
						></i>
						<span v-html="getTemplate(option.text)"></span>
					</b-button>
				</b-button-group>
			</div>

			<div 
				v-if="(mode == null || mode == 'buttons') && DisplayValues.group == true && DisplayValues.switchGroup == false" 
				class="d-flex flex-wrap"
			>
				<div 
					v-for="group in GroupList"
					:key="group.index == null ? '0' : group.index"
					style="margin-bottom: 5px; padding: 5px; margin-top: 5px;"
				>
					<label for="name"> {{groupLabel}} {{group.label}}</label><br>
					<b-button-group
						:style="block == true ? {'width': '100%'} : {}"
						:disabled="computedReadOnly || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
						:multiple="true"
						:size="size"
						:vertical="direction == 'vertical'"
					>				
						<div
							v-for="option in group.options"
							:key="group.index + ' ' +  option.value"
						>
							<b-button
								:block="block"
								:disabled="option.disabled || DisplayValues.disabled || DisplayValues.loading || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
								:variant="getVariant(option)"
								:class="[option.cssClass, option.value]"								
								@click="buttonClicked($event, option)"
								:size="size"
							>
								<i v-if="option.icon != null && option.icon != ''"
									:class="option.icon"
								></i>
								{{getTemplate(option.text)}}
							</b-button>				
						</div>
					</b-button-group>
				</div>
			</div>

			<div 
				v-if="(mode == null || mode == 'buttons') && DisplayValues.group == true && DisplayValues.switchGroup == true" 
				class=""
			>
				<b-form-select
					v-model="SelectedGroupIndex"
					class="button-bar-group-select"
					v-if="GroupList != null"
					size="sm"
					@input="groupChangeEvent()"
				>
					<option
						v-for="group in GroupList"
						:key="group.index == null ? '0' : group.index"
						style="margin-bottom: 5px; padding: 5px; margin-top: 5px;"
						:value="group.index"
						size="sm"
					>{{groupLabel}} {{group.label}}
					</option>
				</b-form-select>							
				<span v-if="GroupList[SelectedGroupIndex] == null"
					class="ml-2"
				>No Actions Available</span>
				<b-button-group		
						v-if="GroupList[SelectedGroupIndex] != null"				
						:style="block == true ? {'width': '100%'} : {}"
						:disabled="computedReadOnly || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
						:multiple="true"
						size="sm"
						:vertical="direction == 'vertical'"
					>				
						<div
							v-for="option in GroupList[SelectedGroupIndex] != null ? GroupList[SelectedGroupIndex].options : []"
							:key="option.value"
						>
						<b-button
							:block="block"
							:disabled="option.disabled || DisplayValues.disabled || DisplayValues.loading || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
							:variant="option.variant != null ?  option.variant : option.active ? DisplayValues.activeVariant : DisplayValues.inactiveVariant"
							:class="[option.cssClass, option.value]"
							:style="{'margin': margin+'px', 'color': option.textColor || 'default', 'background-color': option.backgroundColor || 'default', 'border-radius': DisplayValues.buttonRadius }"
							@click="buttonClicked($event, option)"
							:size="size"
						>
							<i v-if="option.icon != null && option.icon != ''"
								:class="option.icon"
							></i>
							{{getTemplate(option.text)}}
						</b-button>				
					</div>
				</b-button-group>						
			</div>

			<div v-if="mode == 'dropdown'">
				<b-input-group size="sm">
				<b-form-select 
					:id="name"
					v-model="valueModel"
					:disabled="(computedReadOnly && alwaysShow == false) || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
					:select-size="DisplayValues.selectSize"
					@change="fieldInputEvent"
				>
					<option v-for="option in OptionList"
						:key="option.value"
						:value="option.value"
						:disabled="option.disabled"
					>
						{{getTemplate(option.text)}}
					</option>
				</b-form-select>
				<b-input-group-append>
					<b-button
						size="sm"
						style="margin-top: 2px; max-height: 30px;"
						:disabled="DisplayValues.disabled || DisplayValues.loading || (DisplayValues.disableWhileWaiting && isLocalProgressBarVisible)"
						:variant="DisplayValues.buttonVariant"
						@click="buttonClicked($event)"												
					>
					<span v-html="DisplayValues.buttonText"></span>
				</b-button>
				</b-input-group-append>
				</b-input-group>
			</div>

		</b-form-group>
	</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import selectListMixin from "../shared/SelectListMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";

export default {
	name: 'ButtonBar',
	
  props: [
		'options', 
		'size', 
		'selectSize',
		'direction',
		'margin',
		'block',
		'postCommand',
		'postData',
		'alwaysShow',
		'mode',
		'buttonText',
		'buttonVariant',
		'activeVariant',
		'inactiveVariant',
		'enableActiveVariant',
		'group',
		'switchGroup',
		'groupLabel',
		'buttonRadius',
		'onSelectionChange',
		'emptyText',
		'onGroupChange',
		'disabled',
		'singleClickOnly',
		],

	data () {
		return {
			OptionList: [],
			GroupList: [],
			SelectedGroupIndex: 0,
			DisplayValues: {
				name: this.name,
				label: this.label,
				size: this.size,
				disableWhileWaiting: false,
				selectSize: this.selectSize,
				visible: this.visible == null ? true : this.visible,
				options: this.options == null ? [] : this.options,
				buttonVariant: this.buttonVariant == null ? "secondary" : this.buttonVariant,
				buttonText: this.buttonText == null ? "Go" : this.buttonText,
				activeVariant: this.activeVariant == null ? 'secondary' : this.activeVariant,
				inactiveVariant: this.inactiveVariant == null ? 'light' : this.inactiveVariant,
				group: this.group == null ? false : this.group,
				switchGroup: this.switchGroup == null ? false : this.switchGroup,
				groupLabel: this.groupLabel == null ? "" : this.groupLabel,
				buttonRadius: this.buttonRadius == null ? 0 : this.buttonRadius,
				emptyText: this.emptyText == null ? "" : this.emptyText,
				disabled: this.disabled == null ? false : this.disabled,
			}
		}
	},

	mixins: [ baseInputMixin, selectListMixin, validationMixin ],
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		groupSelectionChanged: function() {
			this.onAfterRenderEvent();				
		},

		//--------------------------------------------------------------------------------------------
		getSelectedGroupIndex: function() {
			return this.SelectedGroupIndex;
		},

		//--------------------------------------------------------------------------------------------
		getSelectedGroupValue: function() {
			try {
				return this.GroupList[this.SelectedGroupIndex].value;
			} catch (e) {
				return null;
			}
		},

		//--------------------------------------------------------------------------------------------
		buttonClicked: function(event, option=null) {
			if (this.readonly == true) {
				return;
			}

			if (option != null) {
				this.updateByOption(option);
			} else {
				this.updateByValue(this.valueModel);
			}
			
		},

		//--------------------------------------------------------------------------------------------
		updateByValue: function(value) {
			for (var i=0; i<this.OptionList.length;i++) {
				if (this.OptionList[i].value == value) {
					this.updateByOption(this.OptionList[i]);
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		updateByOption: function(option=null) {
			//Set all buttons to inactive
			this.OptionList.map(function(o) { o.active=false });

			//Set this button to active
			option.active = true;

			//Trigger field input event (must come before update value model)
			var cancel = this.fieldInputEvent(option.value);
			if (cancel == true) return;

			//Trigger option selection  event
			cancel = this.selectionChangeEvent(option);
			if (cancel == true) return;

			//Update value model
			this.valueModel = option.value;

			//Perform clicked action
			if (cancel != true) {
				this.performButtonAction(option);
			} 
		},		

		//--------------------------------------------------------------------------------------------
		setDisabledWhileWaiting: function(isWaiting) {
			this.$nextTick(function() {
				this.DisplayValues.disableWhileWaiting = isWaiting && this.singleClickOnly;
				this.$forceUpdate();
			});
		},

		//--------------------------------------------------------------------------------------------
		getTemplate: function(s) {
			if (s != null) {
				var p = this.findParent();
				var result = s;

				var re = /\{(.+?)\}/g;
				var match;

				do {
						match = re.exec(s);
						var v = '';
						if (match) {
								if (match[1].includes(".")) {
									var e = match[1].split(".");
									v = p.ActiveFormData[e[0]][e[1]];
								} else {
									v = p.ActiveFormData[match[1]];
								}
								//result = result.replace("{" + match[1] + "}", v);
								if (v == null) v=''
								result = this.Utilities.ReplaceAll(result, "{" + match[1] + "}", v);
						}
				} while (match);
				return result;
			} 
			else {
				return s;
			}
		},	

		//--------------------------------------------------------------------------------------------
		getVariant: function(option) {
			if (option.active == true && this.enableActiveVariant) return this.DisplayValues.activeVariant;
			else if (option.variant != null && option.variant != "") return option.variant;
			else return this.DisplayValues.inactiveVariant;
		},

		//--------------------------------------------------------------------------------------------
		findValueText: function(value) {
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
		findValueAltText: function(value) {
			//Find matching object in array
			let selectedIndex = this.OptionList.findIndex((item) => {
				return item.value == value;
			});
			//If match found, return it
			if (selectedIndex >= 0) {
				return this.OptionList[selectedIndex].altText;
			} 
			//Else, return blank
			else 
			{
				return "";
			}
		},


		//--------------------------------------------------------------------------------------------
		selectionChangeEvent: function(option) {
			var p = this.findParent(); 

			try {
				p.ActiveFormData._Activity = option.activity;
			} catch(e) {}

			if (this.onSelectionChange != null && this.onSelectionChange != "") {
				var cancel = this.onSelectionChange.call(this,
					option,
					this.DisplayValues,
					p.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				return cancel;
			}	
		},

		//--------------------------------------------------------------------------------------------
		groupChangeEvent: function() {
			var p = this.findParent(); 
			if (this.onGroupChange != null && this.onGroupChange != "") {
				this.onGroupChange.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					this.getSelectedGroupValue(),
				);
			}	
		},

		//--------------------------------------------------------------------------------------------
		sortGroups: function() {
			var sortedList = this.OptionList.concat().sort(function(a, b){
					if (a.groupIndex < b.groupIndex) //sort string ascending
							return -1 
					if (a.groupIndex > b.groupIndex)
							return 1
					return 0 //default return value (no sorting)
			});

			this.GroupList = {};
			var lastGroupIndex = -1;
			for (var i=0; i<sortedList.length; i++) {
					if (sortedList[i].groupIndex != lastGroupIndex) {
						lastGroupIndex = sortedList[i].groupIndex;
						var group = {
							label: sortedList[i].groupLabel,
							value: sortedList[i].groupValue,
							index: lastGroupIndex,
							selected: sortedList[i].selected,
							options: []
						};						
						this.GroupList[sortedList[i].groupIndex] = group;
						var selectedIndex = 0;
						for (var z=0; z<sortedList.length; z++) {
							if (sortedList[z].selected == true) {
								selectedIndex = sortedList[z].groupIndex;
							}
						}
						this.SelectedGroupIndex = selectedIndex;
					}
					this.GroupList[sortedList[i].groupIndex].options.push(sortedList[i]);
			}

			//Read persisted value if specified
			if (this.persistSelection == true) {
				var persistedValue = localStorage["___" + this.formType + "_" + this.name];
				if (persistedValue != null && persistedValue > 0 && sortedList[persistedValue] != null) {
					this.SelectedGroupIndex = persistedValue;
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		//Button bars support both onClick, with local actions, and server actions
		performButtonAction: function(option=null) {

			//No value is specified when in dropdown mode
			if (option == null) {
				for (var i=0; i<this.OptionList.length; i++) {
					if (this.OptionList[i].value == this.valueModel) {
						option = this.OptionList[i];
					}
				}
			}

			//Verify a value is selected
			if (option == null || option.value == null) {
				console.log("No value specified for button bar click.");
				return;
			}

			//Persist group selection if appropriate
			if (this.persistSelection) {
				localStorage["___" + this.formType + "_" + this.name] = this.SelectedGroupIndex;
			}

			//Prepare action object
			var action = {};

			//Perform client action if specified
			if (typeof option.onClick != "undefined" && option.onClick != null) {

				//Call option's onClick event 
				if (option.onClick != null && option.onClick != "") {
					this.setDisabledWhileWaiting(true);
					var p = this.findParent();
					option.onClick.call(this,
						this.DisplayValues,
						p.ActiveFormData,
						function(cmd, parameters) {
							this.FormActions.LocalAction(this, this.formType, this.guid, cmd, parameters);
						}.bind(this)
						,function(e) {
							console.log("Error: ", e, this.name);
							this.setDisabledWhileWaiting(false);
						}.bind(this)
					);
				}
				return; 				
			}
			//Else if per-button action is specified
			else if (typeof option.action != undefined && option.action != null) {
				action = option.action;
			}
			//Else if global post command is specified, create action object
			else if (typeof this.postCommand != "undefined" && this.postCommand != null) {
				action = {
					post: {
						command: this.postCommand,
						data: option.value 
					}
				}
			} 
			//Else no valid action is specified...
			else {
				return;
			} 

			//Perform server action
			this.setDisabledWhileWaiting(true);
			var p = this.findParent();
			this.FormActions.ServerAction(this, 
				action, 
				this.instanceId, 
				p.ActiveFormData._Id, 
				this.DisplayValues,
				function(cbAction) { //Success callback
					this.updateOptions(this.DisplayValues.options);
				}.bind(this),
				function(cbAction, e) { //Error callback
					console.log("Error: ", e, this.name);
					this.setDisabledWhileWaiting(false);
				}.bind(this)
			);
			return; 				
		},

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted() {

		//Select first option if we are in dropdown mode and showEmpty is turned off
		if (this.mode == "dropdown" && this.showEmptyOption != true && this.value == null && this.OptionList != null && this.OptionList.length > 0) {
			this.valueModel = this.OptionList[0].value;
		}

	},
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

		//--------------------------------------------------------------------------------------------
		valueModel: {
			get () { 
				if (this.mode == "dropdown" && this.showEmptyOption != true && this.value == null && this.OptionList != null && this.OptionList.length > 0) {
					return this.OptionList[0].value;
				}
				else {
					return (!this.value) ? null : this.value 
				}
			},
			set (v) { 
				this.$emit('change', v) 
			},
		},

	}
}


</script>
