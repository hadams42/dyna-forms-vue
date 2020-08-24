<template>
	<div class="v-suggestions" 
		v-on:mouseleave="hideItems(300)"
		tabindex="9999"
 >
 		<b-input-group>
			<b-form-input  
				type="text" 
				@keydown.native="keyDownEvent($event)"
				@blur.native="blurFocusEvent($event)"
				@focus.native="gotFocusEvent($event)"
				@click="secondaryButtonClick"
				v-model="query"
				:disabled="disabled"
				:autocomplete="Math.random().toString()"
				:placeholder="extendedOptions.placeholder"
				:state="state"
				:size="size"
			></b-form-input>
			<b-input-group-append>
				<b-btn 
					variant="light"
					:size="size"
					v-on:mousedown="secondaryButtonClick"
				>
				<i class="fas fa-caret-down"></i>
				</b-btn>
			</b-input-group-append>		
		</b-input-group>		
		<div 
			class="suggestions"			
		>
			<ul 
				class="typeahead-items"
				v-show="items.length > 0 && showItems === true"
				ref="suggestionBlock"
				:id="fieldName + '_items'"
				:style="{'max-height':200+'px', 'overflow-y':'auto'}"				
			>
				<li 
						:class="['typeahead-item', index === activeItemIndex ? 'is-active': '' ]"
						:key="index" 
						:id="fieldName + '_item_' + index.toString()"
						v-for="(item, index) in items"
						v-on:mousedown.prevent="clickItemEvent(index)"
				>
					<slot 
						name="item"
						:item="item"
					>
						<span v-html="getTextHighlight(item.text)"></span>
						<span v-if="includeValues" v-html="' (' + getTextHighlight(item.value) + ')'"></span>
					</slot>
				</li>
			</ul>
		</div>
		<!-- <span 
			:class="'glyphicon ' + validationIcon + ' form-control-feedback'"
		></span>			 -->
			<div
				class="invalid-feedback"
				style="display: inherit"
				v-if="this.Validation.Status  > 0 && this.Validation.MessageList.length > 0"
			>
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
		</div>		
	</div>
</template>
<script>

/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  
Portions of the typeahead code is licensed under the MIT open-source license. 2020.
Author: Alex Urquhart. Email: alexurquhart@gmail.com. Web: https://alexurquhart.com */

import { Utilities } from "../../Utilities.js";

export default {
	name: 'BaseTypeahead',
	
	props: {
		options: {
			type: Object,
			default: {}
		},
		onInputChange: {
			type: Function,
			required: true
		},
		onItemSelected: {
			type: Function
		},
		typeaheadQuery: {
			type: String,
			required: true
		},
		size: {
			type: String,
			required: false
		},
		selectedText: {
			type: String,
			required: false
		},
		fieldName: {
			type: String,
			required: true,
		},
		includeValues: {
			type: Boolean,
			default: false,
			required: false
		},
		disabled: {
			type: Boolean,
			default: false,
			required: false
		},
		state: {
			type: Boolean,
			required: false
		},
		Validation: {
			type: Object,
			required: true
		},
		maxHeight: {
			type: Number,
			default: 300,
			required: false,
		},
		allowShowAll: {
			type: Boolean,
			default: false,
			required: false,
		}
	},

	data () {
		const defaultOptions = {
			debounce: 0,
			placeholder: '',
			inputClass: 'input'
		}
		
		const extendedOptions = Object.assign({}, defaultOptions, this.options)

		return {
			Utilities: new Utilities(),

			extendedOptions,
			query: this.typeaheadQuery,
			lastSetQuery: null,
			items: [],
			activeItemIndex: -1,
			showItems: false,
			storedPlaceholder: extendedOptions.placeholder,
			isClicked: false,
			forceAll: false,
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	beforeMount () {
		if (this.extendedOptions.debounce !== 0) {
			this.onQueryChanged = this.debounce(this.onQueryChanged, this.extendedOptions.debounce);
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	watch: {
		//--------------------------------------------------------------------------------------------
		'query': function (newValue, oldValue) {
			if (newValue === this.lastSetQuery) {
				this.lastSetQuery = null
				return
			}

			//Propogate update
			this.onQueryChanged(newValue, false)
			this.$emit('input', newValue)
		},

		//--------------------------------------------------------------------------------------------
		'typeaheadQuery': function (newValue, oldValue) {
			this.setInputQuery(newValue);
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {
		d: function(e) {
			console.log("Error: ", e, this.name);
		},

		//--------------------------------------------------------------------------------------------
		// Events
		//--------------------------------------------------------------------------------------------

		//--------------------------------------------------------------------------------------------
		secondaryButtonClick: function() {
			if (this.showItems == true) {
				this.hideItems(30);
			} else {
				this.activeItemIndex = -1;
				this.isClicked=true;
				this.onQueryChanged("", true)
				this.isClicked=false;

				this.$nextTick(function() {
					this.$refs.suggestionBlock.focus();
				});
			}
		},


		//--------------------------------------------------------------------------------------------
		clickItemEvent: function(index) {
			this.isClicked = true;
			this.selectItem(index);
			this.isClicked = false;
			this.hideItems(30);
		},

		//--------------------------------------------------------------------------------------------
		gotFocusEvent: function(e) {
			e.target.select()
			//this.showResults();
		},

		//--------------------------------------------------------------------------------------------
		blurFocusEvent: function(e, targetIsList=false) {
 			if (this.isClicked==false) {
				if (this.selectedText != this.typeaheadQuery) {
					this.onItemSelected("");
				}
			}

		},

		//--------------------------------------------------------------------------------------------
		keyDownEvent: function(e, targetIsList=false) {
			switch (e.keyCode) {
				case 40:
					this.highlightItem('down');
					e.preventDefault();
					break;
				case 38:
					this.highlightItem('up');
					e.preventDefault();
					break;
				case 13:
					this.selectItem();
					e.preventDefault();
					break;
				 case 9:
					if (this.selectedText != this.typeaheadQuery) {
				 		if (this.selectItem()) e.preventDefault();
					}
				 	break;
				case 27:
					this.showItems = false;
					e.preventDefault();
					break;
				default:
					return true;
			}
		},


		//--------------------------------------------------------------------------------------------
		// General Methods
		//--------------------------------------------------------------------------------------------
		
		//--------------------------------------------------------------------------------------------
		getTextHighlight: function(t) {
			let text = t.toLowerCase();
			let pat = this.query.toLowerCase()
			let start = text.indexOf(pat);
			if (start != -1) {
				let match = t.substring(start, start + this.query.length);
				//return t.replace(match,"<b>" + match + "</b>");
				return this.Utilities.ReplaceAll(t, match, "<b>" + match + "</b>");
			} else {
				return t;
			}
		},


		//--------------------------------------------------------------------------------------------
		hideItems: function(timeout) {
			setTimeout(() => { this.showItems = false }, timeout);
		},

		//--------------------------------------------------------------------------------------------
		showResults: function() {
			this.activeItemIndex = -1;
			this.showItems = true;

			setTimeout(() => { 
				var x = document.getElementById(this.fieldName + '_items')
				x.scrollBy(0,-10000); 
			}, 30);
		},

		//--------------------------------------------------------------------------------------------
		setInputQuery: function(value) {
			this.lastSetQuery = value
			this.query = value

			//Restore placeholder if new value is empty
			if (value == null || value == "") {
				this.extendedOptions.placeholder = this.storedPlaceholder;
			}

		},

		//--------------------------------------------------------------------------------------------
		selectItem: function(index) {
			let item = null

			//Blank out placeholder once we have started using the control
			this.extendedOptions.placeholder = "";

			//If we are selecting without specifying an index (by hitting enter)
			if (typeof index === 'undefined') {
				//If we are not scrolled down with the keyboard to a suggestion, then try to take what is typed
				if (this.activeItemIndex === -1) {
					//Try to find an exact match with what has been typed so far
					for (var i=0; i<this.items.length; i++) {
						if (this.items[i].text.toLowerCase() == this.query.toLowerCase()
								|| (this.includeValues && this.items[i].value.toLowerCase() == this.query.toLowerCase())) {
							item = this.items[i];	
							break;
						}
					}
					//If no exact match found, and only one item is in the list, take that item
					if (!item && this.items.length == 1) {				
						item = this.items[0];
					}
				}
				//Else, select the highlighted suggestion
				else {
					item = this.items[this.activeItemIndex]
				}				
			} 
			//Else, if an index is specified, then read that item from the array
			else {
				item = this.items[index]
			}

			//If no item was found, just stop here
			if (!item) {				
				return false; 
			}
			//Else, call onItemSelected function and pass this item to it
			else {
				if (this.onItemSelected) {
					this.onItemSelected(item);
				} 
				else {
					console.log("No onItemSelected(item) func property specified.");
				}
			}

			//this.$emit('change', item.value)

			//Hide the suggestion list
			this.hideItems(30)

			return true;
		},

		//--------------------------------------------------------------------------------------------
		highlightItem: function(direction) {
			//Scroll list
			if (this.activeItemIndex > 0) {
				var util = new Utilities();
				var scrollDimension = util.ConvertRemToPixels(2.20);
				scrollDimension = (direction == "up") ? scrollDimension * -1 : scrollDimension;
				var x = document.getElementById(this.fieldName + '_items')
				x.scrollBy(0,scrollDimension); 
			}

			if (direction=="up") {
			}

			if (this.items.length === 0) {
				return;
			}

			let selectedIndex = this.activeItemIndex;

			if (selectedIndex === -1) {
				// nothing selected
				if (direction === 'down') {
					selectedIndex = 0;
				} else {
					selectedIndex = 0;
				}
			} else {
				this.activeItemIndex = 0;
				if (direction === 'down') {
					selectedIndex++;
					if (selectedIndex === this.items.length) {
						selectedIndex = selectedIndex - 1;
					}
				} else {
					selectedIndex--;
					if (selectedIndex < 0) {
						selectedIndex = 0;
					}
				}
			}
			this.activeItemIndex = selectedIndex;
		},

		//--------------------------------------------------------------------------------------------
		setItems: function(items) {
			this.items = items
			this.activeItemIndex = -1
			this.showResults();
		},

		//--------------------------------------------------------------------------------------------
		onQueryChanged: function(value, forceAll=false) {
			const result = this.onInputChange(value, forceAll);
			this.items = [];
			if (typeof result === 'undefined' || typeof result === 'boolean' || result === null) {
				return;
			}
			if (result instanceof Array) {
				this.setItems(result);
			} else if (typeof result.then === 'function') {
				result.then(items => {
					this.setItems(items);
				})
			}
		}
	}
}
</script>

