/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseMixin from "./BaseMixin.js";

export default {

	props: [
		'placeholder',
		'defaultValue',
		'enableLocalStorage'
	],

	data () {
		return {
			debounceTime: 500,
		}
	},

	mixins: [ baseMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//---------------------------------------------------------------------------------------------------
		clearValue() {
			if (this.defaultValue != null) {
				this.fieldChangeEvent(this.defaultValue);
				if (this.enableLocalStorage) {
					localStorage[this.formType + "__" + this.name] = this.defaultValue ;
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		fieldChangeEvent: function(value, propogate = true) {

		if (propogate == true) {
				this.$emit('change', value);
			}
		},

		//--------------------------------------------------------------------------------------------
		fieldInputEvent: function(value) {
			if (typeof this.onInput != "undefined") {
				var p = this.findParent(); 
				var cancel = this.onInput.call(this,
					value,
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
		getReadOnlyStyle: function() {
			var cssStyle = "";
			if (this.DisplayValues.multiline == true && this.DisplayValues.readonlyShowAll == true) {
				if(this.value == null || this.value == "") {
					cssStyle = "height: calc(2.25rem + 2px); overflow-y: auto;";
				} 
				else {
					cssStyle = "height: inherit";
				}
			} 
			else if (this.DisplayValues.multiline == true && this.DisplayValues.readonlyShowAll == false) {
				var rem = this.DisplayValues.maxRows > 0 ? this.DisplayValues.maxRows*1.95 : 2.25;
				cssStyle = "height: calc(" + rem + "rem + 2px); overflow-y: auto;";
			}

			if (this.DisplayValues.maxWidth > 0) {
				cssStyle = cssStyle + "max-width:" + this.DisplayValues.maxWidth + "px;";
			}
			

			if (this.DisplayValues.color != null) {
				cssStyle =  cssStyle + "; color: " + this.DisplayValues.color;
			}

			if (this.DisplayValues.backgroundColor != null) {
				cssStyle =  cssStyle + "; background-color: " + this.DisplayValues.backgroundColor;
			}

			return cssStyle;
		}


	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	beforeMount () {
		this.fieldInputEvent = this.debounce(this.fieldInputEvent, this.debounceTime);
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {

		//Trigger onLoad event
		this.loadFieldEvent();

		//Perform initial render
		this.renderField();

		//Send bus message that this field has been rendered
		this.emitFilterEvent("_FieldRendered", this.guid + this.formType, this.formName, this.name);

		//Listen for render event
		this.onFilterEvent("_Render", 115, this.guid + this.formType + this.name, (self, watchedField, clearValue = false) => {
			this.renderField(watchedField, clearValue);
		});
		
		//Listen for field change event
		this.onFilterEvent("_FieldChange", 120, this.guid + this.formType + this.name, (self) => {
				this.fieldInputEvent();
		});

		if (this.enableLocalStorage) {
		//Listen for field change event
			this.onEvent("UpdateLocalStorage", (self) => {
				if (this.valueModel != null) {
					localStorage[this.formType + "__" + this.name] = this.valueModel;	
				}
			});
		}
	

	},	

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {
	}
}


