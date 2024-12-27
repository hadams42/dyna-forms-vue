<template>
	<b-form-group 
			:class="['kpi-view ', DisplayValues.customClasses]"
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
			:unlockable="!(formReadOnlyLock || readOnlyLock)"
		>
		</component-label>


<div>
  <b-card-group deck class="kpi-list"
	>
		<div v-for="(item, index) in KpiList"
				:key="index"
		>
			<b-card
				:class="['kpi-container',item.onClick != null ? 'has-action' : '', item.variant, DisplayValues.size, item.customClasses]"
				@click="clickEvent(item)"
				v-if="isVisible(item)"
			>

				<div class="kpi"
					v-b-popover="{content: item.helpText == null ? FieldData[item.helpField] : item.helpText, boundaryPadding: 20, placement: 'auto', trigger: 'hover focus click blur' }"
					tabindex="0"
					:disabled="FieldData[item.helpField] == null && item.helpText == null"
				>

					<div class="kpi-header"
						v-if="item.header != null"
						v-html="item.header"
					></div>		

					<div class="kpi-body" 
						v-if="item.body == null"
					>
						{{ FieldData[item.bodyField] != null ? FieldData[item.bodyField] : getFormattedValue(FieldData[item.fieldName], item.format) }}
						{{ item.suffix }}
					</div>

					<div class="kpi-body" 
						v-if="item.body != null && item.body != ''"
						v-html="item.body"
					>
					</div>

					<div class="kpi-indicator"
						v-if="item.type != null && item.type != 'no-indicator'"
						v-html="refreshIndicator(item)"
					>
					</div>

					<div class="kpi-footer"
						v-if="item.footer != null"
						v-html="item.footer"
					></div>
				
				</div>
			
			</b-card>
			
		</b-card-group>
	</div>


	</b-form-group>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'KpiView',
	
	components: { ComponentLabel },

	props: [
		'kpis',
		'size',
		],
	
	data () {
		return {

			KpiList: this.kpis || [],
			FieldData: {},

			DisplayValues: {
				name: this.name,
				label: this.label,
				size: this.size || "sm",
				visible: this.visible || true,
				customClasses: this.customClasses || '',
			}
		}
	},

	mixins: [ baseInputMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		clickEvent: function(item) {
			if (item.onClick != null) {
				var p = this.findParent();
				item.onClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(cmd, parameters) {
						this.FormActions.LocalAction(this, this.formType, this.guid, cmd, parameters);
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		isVisible: function(item) {
			if (item.showIf != null) {
					if (item.showIf == this.FieldData[item.fieldName]) {
						return true;
					}	else {
						return false;
				}
			} else {
				return true;
			}
		},

		//--------------------------------------------------------------------------------------------
		refreshIndicator: function(item) {
			switch(item.type) {
				case "stop-light":
					return this.indicatorStopLight(item);					
				case "stop-light-inverse":
					return this.indicatorStopLightInverse(item);					
				default:
					break;
			}
		},

		//--------------------------------------------------------------------------------------------
		indicatorStopLightInverse: function(item) {
			var value = this.FieldData[item.fieldName];
			var indicatorIcon = "<span style='width: 1rem; height: 1rem; display: inline-block'></span>";
			var indicatorHtml = "";

			if (value <= item.greenMax) {
				indicatorHtml += "<span style='background-color: green;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: green;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: green;'>" + indicatorIcon + "</span>";
			}
			else if (value >= item.redMin) {
				indicatorHtml += "<span style='background-color: red;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: #ccc;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: #ccc;'>" + indicatorIcon + "</span>";
			}
			else {
				indicatorHtml += "<span style='background-color: orange;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: orange;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: #ccc;'>" + indicatorIcon + "</span>";
			}

			return indicatorHtml;
		},

		//--------------------------------------------------------------------------------------------
		indicatorStopLight: function(item) {
			var value = this.FieldData[item.fieldName];
			var indicatorIcon = "<span style='width: 1rem; height: 1rem; display: inline-block'></span>";
			var indicatorHtml = "";

			if (value >= item.greenMin) {
				indicatorHtml += "<span style='background-color: green;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: green;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: green;'>" + indicatorIcon + "</span>";
			}
			else if (value <= item.redMax) {
				indicatorHtml += "<span style='background-color: red;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: #ccc;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: #ccc;'>" + indicatorIcon + "</span>";
			} else {
				indicatorHtml += "<span style='background-color: orange;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: orange;'>" + indicatorIcon + "</span>";
				indicatorHtml += "<span style='background-color: #ccc;'>" + indicatorIcon + "</span>";
			}

			return indicatorHtml;
		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {
			//watchedField is the field that changed and triggered this render.

			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				if (this.onRender != null && this.onRender != "") {
					console.log("WARNING: Local event 'onRender' ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				//Call server render interface
				var p = this.findParent();
				this.ServerInterface.RenderField(this,
					this.instanceId,
					this.name,
					watchedField,
					this.DisplayValues,
					p.ActiveFormData,
					function() {
						this.onAfterRenderEvent();
						var p = this.findParent();
						this.FieldData = p.ActiveFormData;
						this.$forceUpdate();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				return;
			} 

			//Else, call local onRender if specified
			else if (this.onRender != null && this.onRender != "") {
				var p = this.findParent(); 
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function() {
						var p = this.findParent();
						this.FieldData = p.ActiveFormData;
						this.$forceUpdate();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				
				this.onAfterRenderEvent();
			} 
			else {
				this.onAfterRenderEvent();
				var p = this.findParent();
				this.FieldData = p.ActiveFormData;
				this.$forceUpdate();
			}
		},

		//--------------------------------------------------------------------------------------------
		getFormattedValue: function(value, format) {
			
			if (format == null) return value;
			
			var result =  value;

			switch (format.toUpperCase()) {
				case "N":
				case "N0":
				case "C":
					result = this.Utilities.FormatNumber(result);
					break;
				case "N1":
				case "C1":
					result = this.Utilities.FormatFixedNumber(result, 1);
					break;
				case "N2":
				case "C2":
					result = this.Utilities.FormatFixedNumber(result, 2);
					break;
				case "N3":
				case "C3":
					result = this.Utilities.FormatFixedNumber(result, 3);
					break;
				case "N4":
				case "C4":
					result = this.Utilities.FormatFixedNumber(result, 4);
					break;
				case "R-6":
					result = result/1000000;
					result = this.Utilities.RoundNumber(result, 2);
					break;
				case "R-3":
					result = result/1000;
					result = this.Utilities.RoundNumber(result, 1);
					break;
				case "R":
				case "R0":
					result = this.Utilities.RoundNumber(result, 0);
					break;
				case "R1":
					result = this.Utilities.RoundNumber(result, 1);
					break;
				case "R2":
					result = this.Utilities.RoundNumber(result, 2);
					break;
			}

			return result;
		},		
		
		
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted: function() {
		var p = this.findParent();
		this.FieldData = p.ActiveFormData;
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

	}


}
</script>