<template>
		<b-form-group 
			:class="['funding-input', name ]"
			v-show="DisplayValues.visible"
		>
			<b-row>
				<div class="funding-instructions" 
					v-if="DisplayValues.label != '' && DisplayValues.label != null"
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
						:isAdmin="isAdmin"
						:adminUnlockable="adminUnlockable"
						@locked="onLockToggle()"				
					>
					</component-label>
				</div>
			</b-row>

			<b-row>
				<div class="d-flex justify-content-center justify-content-lg-start flex-wrap w-100">
					<div class="funding-spinner"
						v-if="computedReadOnly != true"
					>
						<b-form-spinbutton
							class="bv-no-focus-ring"
							v-model="percent"
							:formatter-fn="formatSpinner"
							min="0"
							:step="percent >= Math.round(getMaxPercent() - .1) ? .01 : percent >= Math.round(getMaxPercent() - .5) ? .1 : percent >= Math.round(getMaxPercent() - 1) ? 1 : 1"
							:max="getMaxPercent() + .1"
							vertical
							@input="percentChange"
						></b-form-spinbutton>
					</div>
					<div class="funding-amount"
						v-if="computedReadOnly != true"
					>

						<div class="funding-currency">
							<label>Select Source Currency</label>

							<b-form-select 
								class="select-currency"
								v-model="selectedCurrencyCode" 
								size="sm"
								@change="currencyChange"
								:options="DisplayValues.currencies"
								value-field="code"
								required
								text-field="name"
							></b-form-select>

							<b-input type="number"
								class="enter-amount"
								@focus.native="$event.target.select()"	
								@input="amountChange"
								v-model="enteredAmount"
								:max="maxAmount + 1"
							></b-input>

							<div class="funding-summary">
								<div class="usd-conversion">
									$ {{Utilities.FormatString(getForexConversion(rawAmount, activeCurrencyCode, "USD"), "C0")}} USD
								</div>
								<div class="local-conversion">
									{{getCurrency(localCurrencyCode).symbol}} 
									{{Utilities.FormatString(getForexConversion(rawAmount, activeCurrencyCode, localCurrencyCode), "C0")}}  
									@{{getCurrency(localCurrencyCode).rate}} 
									{{localCurrencyCode}}/USD
								</div>
							</div>

						</div>
				</div>

				<div class="budget-amount"
						v-if="computedReadOnly != true"
				>
					<div class="title">Total Budget</div>
					<table>
						<tr v-if="localCurrencyCode != 'USD'">
							<!-- <td class="amount">{{Utilities.FormatString(getForexConversion(budgetUsd, "USD", localCurrencyCode), "C0")}}</td> -->
							<td class="amount">{{Utilities.FormatString(budgetLocal, "C0")}}</td>
							<td class="currency">{{localCurrencyCode}}</td>
						</tr>
						<tr>
							<td class="amount">{{Utilities.FormatString(budgetUsd, "C0")}}</td>
							<td class="currency">USD</td>
						</tr>
					</table>
				</div>

				<div class="funding-graph">
					<b-progress 
						class="mb-3"
						show-progress 
						height="4rem" 
						:max="100 + (DisplayValues.bars.length * 2)" 
					>
						<b-progress-bar 
							v-for="(bar, index) in DisplayValues.bars"
							:key="index"
							:class="[bar.class, bar.isActive ? 'active' : ''  ]" 
							:value="(bar.percent) + 2"
							v-b-popover="{
									content:  bar.admFieldName + ': ' + Utilities.FormatString(bar.amount,'C0') + ' ' + bar.currency, 
									boundaryPadding: 20, 
									placement: index % 2 ? 'top' : 'bottom',
									trigger: 'hover focus click blur'  
								}"
						>
							<div :class="index % 2 ? 'progress-value-bottom' : 'progress-value-top'">								
								{{getBarLabel(bar)}}						
							</div>
						</b-progress-bar>
					</b-progress>
					
				</div>
			</b-row>
		</b-form-group>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'FundingInput',
	
	components: { ComponentLabel },
	
	props: [
		'actorName',
		'instructions',
		],
	
	data () {
		return {

			selectedCurrencyCode: null,
			activeCurrencyCode: null,
			percent: 0.0,
			enteredAmount: 0.0,
			rawAmount: 0.0,
			localCurrencyCode: null,
			budgetUsd: 0.00,
			budgetLocal: 0.00,
			maxAmount: 0.0,
			maxUsdAmount: 0.0,
			otherUsdCommitments: 0.0,

			DisplayValues: {
				name: this.name,
				label: this.label,
				currencies: [],
				bars: [],
				activeBarIndex: -1,
				currencyCode: null,
				amount: 0.00,
			},

		}
	},

	mixins: [baseInputMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		amountChange: function(value) {

			if (value > this.maxAmount) {
				this.amountChange(this.maxAmount);
				return;
			}

			this.rawAmount = value;
			this.enteredAmount = Math.round(value);

			var usdAmount = this.getForexConversion(value, this.activeCurrencyCode, "USD");

			this.percent = this.budgetUsd != 0 ? usdAmount / this.budgetUsd * 100 : 0;
			
			if (this.DisplayValues.bars != null && this.DisplayValues.bars.length > 0 && this.activeBarIndex >= 0) {
				this.DisplayValues.bars[this.activeBarIndex].amount = value;
				this.DisplayValues.bars[this.activeBarIndex].percent = this.percent;
				this.DisplayValues.bars[this.activeBarIndex].currency = this.activeCurrencyCode;
			}

			this.update();
		},

		//--------------------------------------------------------------------------------------------
		percentChange: function(value) {
			var usdAmount = this.budgetUsd * value / 100;
			if (usdAmount > this.maxUsdAmount) usdAmount = this.maxUsdAmount;
			var currentAmount = this.getForexConversion(usdAmount, "USD", this.activeCurrencyCode);
			this.amountChange(currentAmount);
		},

		//--------------------------------------------------------------------------------------------
		currencyChange: function(currencyCode) {
			if (this.activeCurrencyCode != currencyCode) {
				var convertedAmount = this.getForexConversion(this.rawAmount, this.activeCurrencyCode, currencyCode);
				this.activeCurrencyCode = currencyCode;
				this.maxAmount = this.getForexConversion(this.maxUsdAmount, "USD", this.activeCurrencyCode)
				this.amountChange(convertedAmount);
			}		
		},

		//--------------------------------------------------------------------------------------------
		getMaxPercent: function() {
			if (this.DisplayValues.bars == null || this.DisplayValues.bars.length == 0) return 100;
			var total = null;
			for (var i=0; i<this.DisplayValues.bars.length; i++) {
				if (this.DisplayValues.bars[i].isActive !== true) {
					total += this.DisplayValues.bars[i].percent;
				}
			}
			return 100 - total;
		},

		//--------------------------------------------------------------------------------------------
		getBarLabel: function(bar) {
			var p = Math.round(bar.percent*10)/10;
			if (p < 1) {
				return '';
			} 
			else if (p < 10) {
				return p + '%';
			}
			else {
				return bar.label + ' ' + p + '%';
			}
			
		},

		//--------------------------------------------------------------------------------------------
		getForexConversion: function(amount, sourceCurrencyCode, destinationCurrencyCode) {
			
			if (sourceCurrencyCode == null || destinationCurrencyCode == null) return;
			
			var result = null;

			if (sourceCurrencyCode == destinationCurrencyCode) {
				result = amount;
			}
			else if (sourceCurrencyCode == "USD") {
				var rate = this.getCurrency(destinationCurrencyCode).rate;
				//console.log(sourceCurrencyCode + ":" + destinationCurrencyCode + "@" + rate)
				result = rate != 0 ? amount * rate : 0;
			}
			else if (destinationCurrencyCode == "USD") {
				var rate = this.getCurrency(sourceCurrencyCode).rate;
				//console.log(sourceCurrencyCode + ":" + destinationCurrencyCode + "@" + rate)
				result = rate != 0 ? amount / rate : 0;
			}
			else {
				var srcRate = this.getCurrency(sourceCurrencyCode).rate;
				var usdAmount =  srcRate != 0 ? amount / srcRate : 0;
				var destRate = this.getCurrency(destinationCurrencyCode).rate;
				result = usdAmount * destRate;
				//console.log(sourceCurrencyCode + ":" + destinationCurrencyCode + "@" + rate)
			}
			return result;
		},
		
		//--------------------------------------------------------------------------------------------
		getCurrency: function(code) {
			for (var i=0; i<this.DisplayValues.currencies.length; i++) {
				if (this.DisplayValues.currencies[i] != null && this.DisplayValues.currencies[i].code == code) {
					return this.DisplayValues.currencies[i];
				}
			}
			return {};
		},
		
		//--------------------------------------------------------------------------------------------
		formatSpinner: function(value, step) {
			var d = this.percent >= Math.round(this.getMaxPercent() - .1) ? 100 : this.percent >= Math.round(this.getMaxPercent() - .5) ? 10 : this.percent >= Math.round(this.getMaxPercent() - 1) ? 1 : 1

			return Math.round(value*d)/d + "%";
		},

		//--------------------------------------------------------------------------------------------
		getFormattedValue: function(value) {
			if (value == null) return null;
			var format = this.Utilities.GetStringValue(this.format);
			var result =  this.Utilities.FormatString(value, this.format);
	 	},		

		//--------------------------------------------------------------------------------------------
		update: function() {
			if (this.computedReadOnly) return;

			var sourceAmount = Math.round(this.rawAmount*100.0)/100;
			var usdAmount = Math.round(this.getForexConversion(this.rawAmount, this.activeCurrencyCode, "USD")*100.0)/100;
			var localAmount = Math.round(this.getForexConversion(usdAmount, "USD", this.localCurrencyCode)*100.0)/100;
			this.fieldChangeEvent({
				currency: this.activeCurrencyCode,
				sourceAmount: sourceAmount,
				localAmount: localAmount,
				usdAmount: usdAmount,
			});
		},

		//--------------------------------------------------------------------------------------------
		init: function() {

			this.percent = this.DisplayValues.data.percent;
			this.budgetUsd = this.DisplayValues.data.budgetUsd;
			this.budgetLocal  = this.DisplayValues.data.budgetLocal;
			this.enteredAmount = this.DisplayValues.data.amount;
			this.rawAmount = this.DisplayValues.data.amount;
			this.DisplayValues.amount = this.DisplayValues.data.amount;

			this.DisplayValues.currencies = this.DisplayValues.data.currencies;
			this.DisplayValues.bars = this.DisplayValues.data.bars;
			

			this.selectedCurrencyCode = this.DisplayValues.data.currencyCode;
			this.activeCurrencyCode = this.DisplayValues.data.currencyCode;
			this.DisplayValues.currencyCode = this.DisplayValues.data.currencyCode;

			this.localCurrencyCode = this.DisplayValues.data.localCurrencyCode;

			this.otherUsdCommitments = 0;
			if (this.DisplayValues.bars != null) {
				for (var i=0; i<this.DisplayValues.bars.length; i++) {
					if (this.DisplayValues.bars[i].isActive) {
						this.activeBarIndex = i;
					} 
					else {
						var usdAmount = this.getForexConversion(this.DisplayValues.bars[i].amount, this.DisplayValues.bars[i].currency, "USD")
						this.otherUsdCommitments += usdAmount
						//console.log("converting " + this.DisplayValues.bars[i].amount + " in " + this.DisplayValues.bars[i].currency + " to usd = " + usdAmount)
					}
				}
			}
			this.maxUsdAmount = this.budgetUsd - this.otherUsdCommitments;

			//console.log("max: " + this.maxUsdAmount)
			//console.log("budget: " + this.budgetUsd)
			//console.log("committed: " + this.otherUsdCommitments)
			
			this.maxAmount = this.getForexConversion(this.maxUsdAmount, "USD", this.activeCurrencyCode)
			this.update();
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
						this.init();
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
						//Success code here
						this.onAfterRenderEvent();
						this.init();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} else {
				this.onAfterRenderEvent();
				this.init();
			}
		},

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted : function() {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

	}
}
</script>