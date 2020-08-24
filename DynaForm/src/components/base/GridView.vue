<template>
		<div 
			class="grid-view"
			v-show="DisplayValues.visible"
		>
			<b-container fluid class="px-0">
				<b-row :class="[DisplayValues.block == false ? 'justify-content-center' : '']">
					<div v-if="label!=null && label!=''"
						:class="[DisplayValues.block == false ? '' : 'col']"
					>
						<h2>{{label}}</h2>
					</div>
					<div 
						:class="['pt-3','mb-2', DisplayValues.block == false ? '' : 'col']"
						v-if="DisplayValues.buttons.showRefreshButton || DisplayValues.buttons.showDeleteButton || DisplayValues.buttons.showNewButton"
					>
						<b-button
							v-if="DisplayValues.buttons.showRefreshButton"							
							@click="refreshButtonClick"
							size="sm"
							variant="light"
							:class="['icon-button button-input ml-0 rounded-0', DisplayValues.buttonAlignment == 'left' ? 'float-left' : 'float-right' ]"
							type="button"
						>
							<i class="icon small-size fas fa-sync-alt"></i>
							<span class="icon-label small-size">Refresh</span>
						</b-button>

						<b-button
							v-if="DisplayValues.buttons.showDeleteButton"
							@click="deleteButtonClick"
							size="sm"
							variant="light"
							:class="['icon-button button-input ml-0 rounded-0', DisplayValues.buttonAlignment == 'left' ? 'float-left' : 'float-right' ]"
							type="button"
						>
							<i class="icon small-size far fa-trash-alt"></i>
							<span class="icon-label small-size">Delete</span>
						</b-button>

						<b-button
							v-if="DisplayValues.buttons.showNewButton"
							@click="newButtonClick"
							variant="light"
							size="sm"
							:class="['icon-button button-input ml-0 rounded-0', DisplayValues.buttonAlignment == 'left' ? 'float-left' : 'float-right' ]"
							type="button"
						>
							<i class="icon small-size far fa-plus-square"></i>
							<span class="icon-label small-size">New</span>
						</b-button>
					</div>

				</b-row>
				<b-row :class="[DisplayValues.block == false ? 'justify-content-center' : '']">
					<div :class="[DisplayValues.block == false ? '' : 'col']">
						<div 
							:style="'min-height: ' + DisplayValues.tableMinHeight + 'px'" 
							ref="vueTableContainer">
							<b-table
								ref="GridView"
								:key="DisplayValues.key"
								:busy="DisplayValues.busy"
								:stacked="DisplayValues.stackedWidth"
								:items="items"
								:fields="fields"
								:current-page.sync="currentPage"
								:per-page.sync="this.dataProvider.rowsPerPage"
								:sort-by.sync="sortBy"
								:sort-desc.sync="sortDescending"
								:no-local-sorting="true"
								responsive
								:empty-text="DisplayValues.emptyText"
								:show-empty="DisplayValues.emptyText != null && DisplayValues.emptyText != '' ? true : false"
								:fixed="DisplayValues.fixedColumns"
								small
								thead-class="grid-thead"
								thead-tr-class="grid-thead-tr"
								tbody-class="grid-tbody"
								tbody-tr-class="grid-tbody-tr"
								tfoot-class="grid-tfoot"
								tfoot-tr-class="grid-tfoot-tr"
								:hover="true"
								@row-clicked="rowClicked"
								@refreshed="gridRenderedEvent"
							>
								<template slot="head(isSelected)"> <!--slot-scope="data"-->
									<b-form-checkbox 
										v-if="showSelectAll"
										:plain="true"
										@click.native="headerCheckboxChanged()"
										:checked="DisplayValues.headerCheckboxState"
									></b-form-checkbox>
								</template>

								<template 
									v-for="(field, index) in fields || []"
									:slot="field == null ? 'cell(DefaultField)' : 'cell(' + field.key + ')'" 
									slot-scope="data" 
								>
									<b-input-group
										:key="'editable-' + index"
										v-if="field.editable == 'true' && data.item['_IsLocked'] != 1 && computedReadOnly == false "
										:class="['input-container', field.class, getFormattedClass(data.item[field.key],field.key,data.item), DisplayValues.dirtyIndicators['input_' + field.key + '_' + data.item[keyField]] != null && DisplayValues.dirtyIndicators['input_' + field.key + '_' + data.item[keyField]].isDirty == true ? 'dirty': '']"
										size="sm"
									 >					
										<b-input
											:class="['editable-text-input', field.format.startsWith('N') || field.format.startsWith('C') ? 'numeric' : 'text' ]"
											:type="getInputType(field.format)"
											:dir="field.format.startsWith('N') ? 'rtl' : 'ltr'"
											:value="getFormattedValue(data.item[field.key], field.key)"
											:step="getStep(field.format)"
											size="sm"
											:placeholder="data.item[field.key+'_Placeholder']"
											no-wheel
											:ref="'input_' + field.key"
											@focus.native="onFocusEvent($event, data.item[keyField], field.key, data.item[field.key])"										
											@keydown.native="keyDownEvent($event, index)"
											@blur.native="inputChangeEvent($event, field.LayoutId, field.key, data.item[keyField], data.item)"
										></b-input>
										<b-input-group-append
										v-if="DisplayValues.dirtyIndicators['input_' + field.key + '_' + data.item[keyField]] != null && DisplayValues.dirtyIndicators['input_' + field.key + '_' + data.item[keyField]].isDirty == true"
										>
											<span												
												title="Click to retry saving this value" 
												@click="updateDirtyFields()"
											>
												<i class="fas fa-exclamation fa-sm" 
													v-if="DisplayValues.inProcessSave == false"
												></i>
												<div class="spinner-border" role="status"
													v-if="DisplayValues.inProcessSave == true"
													title="Saving..."
												>
												</div>
											</span>
										</b-input-group-append>
							 		</b-input-group>

									<span 
										:key="'data-' + index"
										v-if="field.editable != 'true' || data.item['_IsLocked'] == 1 || computedReadOnly == true"
										:class="['non-editable-text', field.class, getFormattedClass(data.item[field.key],field.key,data.item)]"
										v-b-popover="{content: field.helpText == null || field.helpText == '' ? data.item[field.helpTextKey] : field.helpText, boundaryPadding: 20, placement: 'auto', trigger: 'hover focus click blur'  }"
										tabindex="0"
										:disabled="(data.item[field.helpTextKey] == null || data.item[field.helpTextKey] == '' ||  data.item[field.helpTextKey].length <= data.item[field.key].length) && (field.helpText == null || field.helpText == '')"
									>
										<span v-html="getFormattedValue(data.item[field.key], field.key)"></span>
									</span>

									<b-form-checkbox 
										v-if="field.key == 'isSelected'"
										:class="[field.class, getFormattedClass(data.item[field.key],field.key,data.item)]"
										:key="'checkbox-' + index"
										:data-value="data.item[keyField]"
										:checked="isRowSelected(data.item)"
										:plain="true"
										@change="checkboxChanged(data.item[keyField])"
									></b-form-checkbox> 
								</template>

								<template slot="empty">  <!--slot-scope="row"-->
									{{emptyText}}
								</template>

								<template 
									slot="bottom-row" 
									slot-scope="columns" 
									v-if="DisplayValues.showFooter"
								>
									<td v-for="(field, index) in columns.fields"
										:key="index"
										:class="['footer-td',field.class]"
									 >
										<span v-if="field.showFooter == 'true'"
										> 
											<span v-if="DisplayValues.isFooterExpired == true"
												@click="refreshGrid()"
												style="cursor:pointer"
											>
												<span class="text-muted">
													{{getFooterValue(field.key)}}
												</span>

												<i class="icon small-size fas fa-sync-alt"></i>
											</span>
											<span v-if="DisplayValues.isFooterExpired == false">
												{{getFooterValue(field.key)}}
											</span>
										</span>
									 </td>
								</template>

							</b-table>

							<div class="summary-line"
								v-if="summaryLine != null && summaryLine != ''"
								v-html="summaryLine"
							>
							</div>
						</div>
					</div>
				</b-row>
				<b-row :class="DisplayValues.block == false ? 'justify-content-center' : ''"
					v-if="DisplayValues.paginate"
				>
					<b-col md="6" class="pt-2" >

					</b-col>
					<b-col md="6" class="my-1">
						<b-form-group 
							style="float: left; width: auto;"
							v-if="pageSizeOptions != null "
							horizontal 
							label="Per page" 
							label-cols="6" 
							label-size="sm" 
							class="mb-0"
						>
		          <b-form-select  
								size="sm"
								:options="pageSizeOptions" 
								v-model="dataProvider.rowsPerPage" 
							/>
        		</b-form-group>
						<b-pagination 
							:total-rows="totalRows" 
							:per-page="getRowsPerPage" 
							v-model="currentPage" 
							size="sm"
							align="right"
							class="my-0" 
							prev-text="Prev"
							next-text="Next"
							@change="pageChangeEvent"
						/>
					</b-col>
				</b-row>
				<!-- Info modal -->
				<!-- <b-modal id="modalInfo" @hide="resetModal" :title="modalInfo.title" ok-only>
					<pre>{{ modalInfo.content }}</pre>

				</b-modal> -->
			</b-container>
			<input type="hidden" :value="DisplayValues.activeRecordKey">
			<div v-if="debugMode == true">
				Selected Ids: {{DisplayValues.selectedRecordKeys}}
				| Active Id: {{DisplayValues.activeRecordKey}}
				| Page #: {{DisplayValues.activeRecordKey}}
				| Current Page: {{currentPage}}
				| Per Page: {{getRowsPerPage}}
				| Busy: {{DisplayValues.busy}}
				| Total Rows: {{totalRows}}
				| Params: {{DisplayValues.parameters}}
				| Sort Descending: {{sortDescending}}
				| InstanceId: {{instanceId}}
				{{fields}}
			</div>
		</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import { ServerInterface } from "../../ServerInterface.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import { VMoney } from '../../lib/v-money/index.js'
import { Utilities } from '../../Utilities';
import validationMixin from "../shared/ValidationMixin.js";

export default {
  name: 'GridView',
  props: [
		'busy',
		'keyField',
		'stackedWidth',
		'emptyText',
		'block',
		'multiSelect',
		'fixedColumns',
		'showNewButton',
		'showDeleteButton',
		'showRefreshButton',
		'showConfirmDialog',
		'showMessageDialog',
		'dataProvider',
		'debugMode',
		'selectedRecordKeys',
		'showSelectAll',
		'initialParameters',
		'instanceId',
		'enablePagination',
		'showFooter',
		'autoRender',
		'onNewButtonClick',
		'buttonAlignment',
		'minWidth',
		'isStacked',
		'onUpdateSummary'
	],
		
	data () {
		return {

			ServerInterface: new ServerInterface(),
			DisplayValues: {
				key: 1,
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,				
				busy: this.busy == null ? true : this.busy,
				activeRecordKey: this.value == null ? -1 : this.value,
				parameters: this.initialParameters == null ? null : this.initialParameters,
				paginate: typeof this.enablePagination == 'undefined' || this.enablePagination == null ? false : this.enablePagination,
				block: this.block == null ? false : this.block,
				selectedRecordKeys: [],
				activeItemObject: null,
				stackedWidth: this.isStacked != null ? this.isStacked : this.stackedWidth || false,
				currentRows: [],
				dirtyIndicators: {},
				inProcessSave: false,
				headerCheckboxState: false,
				tableMinHeight: 0,
				isInitialRender: true,
				isFlashProtected: true,
				fixedColumns: this.fixedColumns == null ? false : this.fixedColumns,
				isFooterExpired: false,
				emptyText: this.emptyText,
				showFooter: this.showFooter == null ? false : this.showFooter,
				buttonAlignment: this.buttonAlignment == null ? 'right' : this.buttonAlignment,
				buttons: {
					showNewButton: this.showNewButton == null ? true : this.showNewButton,
					showDeleteButton: this.showDeleteButton == null ? true : this.showDeleteButton,
					showRefreshButton: this.showRefreshButton == null ? true : this.showRefreshButton,
				},
			},

			dataItems: [],
			originalValues: {},
      totalRows: (this.dataProvider == null || this.dataProvider.data == null) ? 0 : this.dataProvider.data.length,
			providerType: (this.dataProvider == null || this.dataProvider.providerType == null) ? 'static' : this.dataProvider.providerType,
			fields: this.autoRender != true ? [] : (this.dataProvider == null || this.dataProvider.fieldDefinition == null) ? [] : this.dataProvider.fieldDefinition,
 			items: this.autoRender != true ? [] : this.dataProvider == null ? [] : this.dataProvider.providerType == "api" ? this.dataApi : this.dataProvider.providerType == "static" && this.dataProvider.data != null ? this.dataProvider.data : [],
			footerValues: (this.dataProvider == null || this.dataProvider.footerValues == null) ? {} : this.dataProvider.footerValues,
			footerTotals: {},
			currentPage: (this.dataProvider == null || this.dataProvider.initialPage == null) ? 1 : this.dataProvider.initialPage,
      sortBy: (this.dataProvider == null || this.dataProvider.initialSort == null) ? null : this.dataProvider.initialSort,
      sortDescending: (this.dataProvider == null || this.dataProvider.initialSortDescending == null) ? false : this.dataProvider.initialSortDescending,
			pageSizeOptions: (this.dataProvider == null || this.dataProvider.pageSizeOptions == null) ? null : this.dataProvider.pageSizeOptions,
			formats: {},
			renderDebouncer: 0,
			isRendered: false,
			modelValue: null,
			summaryLine: null,


		}
	},

	directives: {
		money: VMoney,
	},

	mixins: [ baseInputMixin, validationMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		// Grid Methods
		//--------------------------------------------------------------------------------------------
		refresh: function() {
			this.refreshGrid();
		},
		
		//--------------------------------------------------------------------------------------------
		refreshGrid: function() {
			if (this.$refs.vueTableContainer == null) return;

			if (this.isRendered == false) 
			{
				this.renderGrid();
				this.isRendered = true;
			} else {
				var currentTableHeight = this.$refs.vueTableContainer.clientHeight - 16;
				this.DisplayValues.tableMinHeight = currentTableHeight;
				this.$nextTick(function() {
					this.DisplayValues.key++;					
				});
			}
			this.DisplayValues.isFooterExpired = false;
		},


		//--------------------------------------------------------------------------------------------
		updateSummaryEvent: function(item=null, fieldName=null, recordKey=null, layoutId=null) {
				if (typeof this.onUpdateSummary != "undefined") {
				var p = this.findParent(); 
				this.summaryLine = this.onUpdateSummary.call(this,
					this.footerTotals == null ? {} : this.footerTotals,
					p.ActiveFormData,
					item,
					fieldName,
					recordKey,
					layoutId,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}	
		},


		//--------------------------------------------------------------------------------------------
		isDirty: function() {
			const keys = Object.keys(this.DisplayValues.dirtyIndicators)
			for (const key of keys) {
				if (this.DisplayValues.dirtyIndicators[key].isDirty == true) {
					return true;
				}
			}
			return false;
		},


		//--------------------------------------------------------------------------------------------
		getPrecision: function(format) {
			if (format.startsWith('N') || format.startsWith('C') ) {
				let stepValue = null;
				if (format.length > 1) {
					stepValue = format.substring(1,2);
				} 
				if (stepValue == '0') return 0;
				if (stepValue == '1') return 1;
				if (stepValue == '2') return 2;
				if (stepValue == '3') return 3;
				if (stepValue == '4') return 4;
				else return 0;
			} 
			else {
				return 0;
			}
		},

		//--------------------------------------------------------------------------------------------
		getStep: function(format) {
			if (format.startsWith('N')) {
				let stepValue = null;
				if (format.length > 1) {
					stepValue = format.substring(1,2);
				} 
				if (stepValue == '0') return 1;
				if (stepValue == '1') return .1;
				if (stepValue == '2') return .01;
				if (stepValue == '3') return .001;
				if (stepValue == '4') return .0001;
			} 
			else {
				return 1;
			}
		},

		//--------------------------------------------------------------------------------------------
		getInputType: function(format) {
			if (format.startsWith('N'))  return 'number';
			else if (format.startsWith('C'))  return 'tel';
			else if (format.toUpperCase().startsWith('DATE')) return 'date';
			else return 'text'
		},

		//--------------------------------------------------------------------------------------------
		getMoneyMask: function(format) {
			if (format.startsWith('C')) {
				return {
						decimal: ".",
						thousands: ",",
						precision: this.getPrecision(format),
						prefix: "",
						suffix: "",
						masked: false
					};
			}
			else {
				return null;
			}

		},

		//--------------------------------------------------------------------------------------------
		getFormattedClass: function(value, key, item) {
			var result =  [];
			var format = this.formats[key]
			if (this.Utilities.GetStringValue(format).toUpperCase() == "GROUP") {
				if (item != null) {
					if (item.__group_repeater == true) {
						result.push("group-repeater-td");
					} else {
						result.push("group-header-td");
					}
				}
			}
			var result;
			if (item != null) {
				if (item.__group_repeater == true || item.__first_row == true) {
					result.push("group-repeater");
				} else {
					result.push("group-header");
				}
			}
			return result;
		},

		//--------------------------------------------------------------------------------------------
		getFormattedValue: function(value, key) {
			if (this.formats[key] == null || this.formats[key] == "") return value;
			var format = this.Utilities.GetStringValue(this.formats[key]);
			return this.Utilities.FormatString(value, format);
		},

		//--------------------------------------------------------------------------------------------
		getFooterValue: function(fieldKey) {
			//If footer value is already specified
			if (this.footerValues != null && this.footerValues.length > 0 && this.footerValues[fieldKey] != null) {
				return this.getFormattedValue(this.footerValues[fieldKey], fieldKey);
			}
			//Calculate totals locally
			else {
				if (this.dataItems != null && this.dataItems.length > 0) {
					var total = 0;
					for (var i=0; i<this.dataItems.length; i++) {
						var valueString = "" + this.dataItems[i][fieldKey];
						var valueFloat = valueString == "" ? 0 : parseFloat(valueString.replace(/,/g, ''));
						if (!isNaN(valueFloat)) {
							total = total + valueFloat; 

						}
					}
					this.footerTotals[fieldKey] = total;

					return this.getFormattedValue(total, fieldKey);
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		dataApi: function(ctx, callback) {
			//Silly logic to stop calling api twice for every refresh
			// this.renderDebouncer++;
			// if (this.renderDebouncer > 1) 
			// {
			// 	this.renderDebouncer = 0;
			// 	if (this.debugMode) console.log("GridView dataApi call ignored.")
			// 	return;
			// }

			//Set rendered flag
			this.isRendered = true;

			//Retrieve data
			var currentTableHeight = this.$refs.vueTableContainer.clientHeight + 16;
			this.DisplayValues.tableMinHeight = currentTableHeight;
			this.ServerInterface.RenderPage(
				this, //sender
				function(responseJson, callback) { //render callback
					if (responseJson.items.length > 0 && responseJson.items[0]["_TotalCount"] > 0) {
						this.totalRows = responseJson.items[0]["_TotalCount"];
					} else {
						this.totalRows = 0;
					}
					//read in fields
					if (this.dataProvider == null || this.dataProvider.fieldDefinition == null) this.fields = responseJson.fields;
					//parse formats out of fields
					for (var i=0; i<this.fields.length; i++) {
						this.formats[this.fields[i].key] = this.fields[i].format;
						
						if (this.fields[i].label != null) {
							var p = this.findParent();
							var result = this.fields[i].label;

							var re = /\{(.+?)\}/g;
							var match;

							while (result.includes("{") && result.includes("}")) {
								match = re.exec(result);
								var v = '';
								if (match) {
									if (match[1].includes(".")) {
										var e = match[1].split(".");
										v = p.ActiveFormData[e[0]][e[1]] || '';
									} else {
										v = p.ActiveFormData[match[1]] || '';
									}
									var replacementValue = null;
									if (v.length == 10) {
										var event = new Date(v);
										if(Boolean(+event)) {
											var options = { year: 'numeric', month: 'long', day: 'numeric' };
											replacementValue = event.toLocaleDateString(undefined,options);
										}
									} 
									if (replacementValue == null) {
										replacementValue = v;
									}
									result = this.Utilities.ReplaceAll(result, "{" + match[1] + "}", replacementValue);
								}
							}
							this.fields[i].label = result;
						}
					}
					//read footer (totals, etc)
					this.footerValues = responseJson.footer;
					//read in items
					this.dataItems = responseJson.items;
					var previousItem = {};
					this.DisplayValues.currentRows = [];
					for (var y=0; y<this.dataItems.length; y++) {	
						this.DisplayValues.currentRows.push(this.dataItems[y]);
						Object.entries(this.dataItems[y]).forEach(entry => {
							let key = entry[0];
							let value = entry[1];
							if (this.Utilities.GetStringValue(this.formats[key]).toUpperCase() == "GROUP") {
								this.dataItems[y].__group_repeater = (previousItem[key] == this.dataItems[y][key]);
							} else if (y == 0) {
								this.dataItems[y].__first_row = true;
							}
						});						
						previousItem = this.dataItems[y];
					}
					//return via callback
					callback(this.dataItems);
					this.DisplayValues.tableMinHeight = 0;
					setTimeout(function(){ this.updateSummaryEvent(); }.bind(this), 300);
				}.bind(this),
				callback, //result callback
				this.instanceId,
				this.currentPage, 
				this.getRowsPerPage, 
				this.sortBy, 
				this.sortDescending ? 'desc' : 'asc',
				this.DisplayValues.parameters
			);
		},

		//--------------------------------------------------------------------------------------------
		deleteBulkSelections: function() {
			if (this.DisplayValues.selectedRecordKeys != null && this.DisplayValues.selectedRecordKeys.length > 0) {
				this.showConfirmDialog(
					"Delete record batch?", //Caption
					"Delete these records?", //Message Text
					//Dialog box "Ok" action
					function() {
						this.ServerInterface.DeleteBatch(
							this,
							this.instanceId, 
							this.DisplayValues.selectedRecordKeys, 
							//Delete batch success
							function() {},
							//Delete batch error action
							function(e) {
								console.log("Error deleting batch: " + e);
							},
						);
					}.bind(this),
					//Dialog box cancel action. Do nothing.
					function() {}
				);
			} else {
				this.showMessageDialog(
					"Error", 
					"No records selected.",
					function() {

					}
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		updateDirtyFields: function() {

			const keys = Object.keys(this.DisplayValues.dirtyIndicators)
			for (const key of keys) {
				if (this.DisplayValues.dirtyIndicators[key].isDirty == true) {
					if (this.footerValues != null && this.footerValues.length > 0) {
						this.DisplayValues.isFooterExpired = true;
					}
//this.DisplayValues.isFooterExpired = true;
					let fieldUpdateModel = this.DisplayValues.dirtyIndicators[key];
					if (this.DisplayValues.dirtyIndicators[key].retryCount++ > 3) return;
					 
					this.DisplayValues.inProcessSave = true;

					this.ServerInterface.UpdateField(this, 
						this.instanceId,
						fieldUpdateModel.layoutId,
						fieldUpdateModel.fieldName,
						fieldUpdateModel.recordKey,
						fieldUpdateModel.newValue,
						function() { //success
							fieldUpdateModel.isDirty = false;
							fieldUpdateModel.retryCount = 0;
							this.DisplayValues.inProcessSave = false;
							this.$forceUpdate();
						}.bind(this),
						function() { //error
							fieldUpdateModel.isDirty = true;
							this.DisplayValues.inProcessSave = false;
							this.$forceUpdate();
						}.bind(this)
					);
				}
			}

		},

		//--------------------------------------------------------------------------------------------
		deleteSingleSelection: function() {
			console.log("Delete single selection not implemented");
		},

		//--------------------------------------------------------------------------------------------
		// Event Handlers
		//--------------------------------------------------------------------------------------------

		//--------------------------------------------------------------------------------------------
		inputChangeEvent(e, layoutId, fieldName, recordKey, item) {
			var value = e.target.value;
			this.changeValue(value, layoutId, fieldName, recordKey, item);
		},

		//--------------------------------------------------------------------------------------------
		changeValue(value, layoutId, fieldName, recordKey, item, noBubble=false) {
			
			var newValue;
			var currentString;
			var currentValue;

			if (this.formats[fieldName] == null || this.formats[fieldName] == "") {
				newValue = value;
				currentString = item[fieldName];
				if (newValue == currentString) return;
			} 
			else {
				newValue = value == "" || value == null ? 0 : parseFloat(("" + value).replace(/,/g, ''));
				currentString = "" + item[fieldName];
				currentValue = item[fieldName] == "" || item[fieldName] == null ? 0 : parseFloat(currentString.replace(/,/g, ''));
				if (newValue == currentValue) return;
			}

			var id = 'input_' + fieldName + "_" + recordKey;
			for (var i=0; i<this.DisplayValues.currentRows.length;i++) {
				if (this.DisplayValues.currentRows[i][this.keyField] == recordKey) {
					var fieldUpdateModel = { 
						isDirty:  true,
						newValue: newValue,
						layoutId: layoutId,
						fieldName: fieldName,
						recordKey: recordKey
					};

					this.DisplayValues.dirtyIndicators[id] = fieldUpdateModel;
					this.updateDirtyFields();
					break;
				}
			}

			item[fieldName] = this.getFormattedValue(newValue, fieldName);
			if (noBubble == false) this.updateSummaryEvent(item, fieldName, recordKey, layoutId);

		},

		//--------------------------------------------------------------------------------------------
		onFocusEvent: function(e, recordKey, fieldName, value) {
			e.target.select(); 
			if (this.DisplayValues.activeItemObject != null) {
				this.DisplayValues.activeItemObject["_rowVariant"] = "";
			}

			for (var i=0; i<this.DisplayValues.currentRows.length;i++) {
				if (this.DisplayValues.currentRows[i][this.keyField] == this.DisplayValues.activeRecordKey) {
					this.DisplayValues.currentRows[i]["_rowVariant"] = "";
				}
				if (this.DisplayValues.currentRows[i][this.keyField] == recordKey) {
					this.DisplayValues.currentRows[i]["_rowVariant"] = "success";
					this.DisplayValues.activeRecordKey = recordKey;
					this.DisplayValues.activeItemObject = this.DisplayValues.currentRows[i];
				}
			}

			this.originalValues[fieldName] = value;
		},

		//--------------------------------------------------------------------------------------------
		keyDownEvent: function(e, index) {

			var direction = 0;
			var start = 0;
			var end = 0;

			switch (e.keyCode) {
				case 38:
					direction = -1;
					start = 1;
					end = this.DisplayValues.currentRows.length;
					e.preventDefault();
					break;
				case 40:
				case 13:
					direction = 1;
					start = 0;
					end = this.DisplayValues.currentRows.length-direction;
					e.preventDefault();
					break;
			}

			for (var i=start; i<end;i++) {
				if (this.DisplayValues.currentRows[i][this.keyField] == this.DisplayValues.activeRecordKey) {
					this.DisplayValues.currentRows[i]["_rowVariant"] = "";
					this.DisplayValues.currentRows[i+direction]["_rowVariant"] = "success";
					this.DisplayValues.activeRecordKey = this.DisplayValues.currentRows[i+direction][this.keyField];
					var newCellId = 'input_' + this.fields[index].key;
					this.$refs[newCellId][i+direction].focus();
					break;
				}
			}

			return true;
		},

		//--------------------------------------------------------------------------------------------
		gridRenderedEvent: function() {
			if (this.DisplayValues.isInitialRender == false) {
				if (this.DisplayValues.isFlashProtected) {
					this.Utilities.FlashProtect();
					this.DisplayValues.isFlashProtected = false;
				}
			} else {
				this.DisplayValues.isInitialRender = false;
			}
		},

		//--------------------------------------------------------------------------------------------
		headerCheckboxChanged: function() {
			this.DisplayValues.headerCheckboxState = !this.DisplayValues.headerCheckboxState;
			this.DisplayValues.selectedRecordKeys = [];
			if (this.DisplayValues.headerCheckboxState && this.items.length > 0) {
				var startIndex = (this.currentPage * this.getRowsPerPage) - this.getRowsPerPage;
				var endIndex = (this.currentPage * this.getRowsPerPage); 
				if (endIndex > this.items.length) endIndex = this.items.length;
				for (var i = startIndex; i<endIndex; i++) 
				{
					this.DisplayValues.selectedRecordKeys.push(this.items[i][this.keyField]);
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		pageChangeEvent: function(e) {
			this.renderDebouncer = 0;
			this.DisplayValues.headerCheckboxState = false;
			if (this.clearSelectionOnPageChange == true) {
				this.DisplayValues.selectedRecordKeys = [];
			}
		},

		//--------------------------------------------------------------------------------------------
		checkboxChanged: function(newKey) {
	 		//If single select mode
			if (this.multiSelect != true) {
				this.DisplayValues.selectedRecordKeys = [ newKey ];
			}
			//If multi select mode
			else {
				if (this.DisplayValues.selectedRecordKeys.includes(newKey)) {
					this.DisplayValues.selectedRecordKeys.splice(this.DisplayValues.selectedRecordKeys.indexOf(newKey),1);
				}	else {
					this.DisplayValues.selectedRecordKeys.push(newKey)
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		rowClicked: function(item, index, event) {
			if (this.DisplayValues.activeItemObject != null) {
				this.DisplayValues.activeItemObject["_rowVariant"] = "";
			}
			let newKey = item[this.keyField];
			this.DisplayValues.activeRecordKey = newKey;
			this.DisplayValues.activeItemObject = item;
			item["_rowVariant"] = "success";
			this.$emit('change', this.DisplayValues.activeRecordKey);
			//this.fieldInputEvent(newKey);
			//this.$forceUpdate();
		},

		//--------------------------------------------------------------------------------------------
		newButtonClick: function() {
			if (this.onNewButtonClick != null && this.onNewButtonClick != "") {
				var p = this.findParent(); 
				this.onNewButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		deleteButtonClick: function() {
			var isCancelled = false;
			if (this.onDeleteButtonClick != null && this.onDeleteButtonClick != "") {
				var p = this.findParent(); 
				isCancelled = this.onDeleteButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
				);
			}

			//If not cancelled, then delete records
			if (isCancelled != true) {
				//If this is a multiselection grid, then delete using bulk batch delete
				if (this.multiSelect) {
					this.deleteBulkSelections();
				}
				//If this is single select, then delete using form render
				else {
					this.deleteSingleSelection();
				}				
			}
		},

		//--------------------------------------------------------------------------------------------
		refreshButtonClick: function() {
			var isCancelled = false;
			if (this.onRefreshButtonClick != null && this.onRefreshButtonClick != "") {
				var p = this.findParent(); 
				isCancelled = this.onRefreshButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
				);
			}

			//If not cancelled, then refresh grid
			if (isCancelled != true) {
				this.refreshGrid();
			}

		},

		// //--------------------------------------------------------------------------------------------
		// loadFieldEvent: function() {
		// 	if (this.onLoad != null && this.onLoad != "") {
		// 		var p = this.findParent(); 
		// 		this.onLoad.call(this,
		// 			this.DisplayValues,
		// 			p.ActiveFormData,
		// 			function(e) {
		// 				console.log("Error: ", e, this.name);
		// 			}.bind(this)
		// 		);
		// 	}			
		// },

		//--------------------------------------------------------------------------------------------
		// Render and Grid Maintenance Methods
		//--------------------------------------------------------------------------------------------

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {

			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				if (this.onRender != null && this.onRender != "") {
					console.log("WARNING: Local event 'onRender' ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				console.log("enableServerRender not implemented for GridView");
				return;
			} 

			//Else, call local onRender if specified
			else if (this.onRender != null && this.onRender != "") {
				var p = this.findParent();
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function(cancel=false) {
						if (cancel==false) {
							//Success code here
							this.refreshGrid();
						}
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						//Error code here
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} else {
				this.refreshGrid();
				this.onAfterRenderEvent();				
			}

		},

		//--------------------------------------------------------------------------------------------
		renderGrid: function() {
			if (this.isRendered == false) {
				this.fields = (this.dataProvider == null || this.dataProvider.fieldDefinition == null) ? null : this.dataProvider.fieldDefinition;
			 	this.items = this.dataProvider == null ? [] : this.dataProvider.providerType == "api" ? this.dataApi : this.dataProvider.providerType == "static" && this.dataProvider.data != null ? this.dataProvider.data : [];
			}
			this.DisplayValues.isFooterExpired = false;
		},

		//--------------------------------------------------------------------------------------------
		isRowSelected: function(data) {
			return this.DisplayValues.selectedRecordKeys.includes(data[this.keyField]);
		},

		//--------------------------------------------------------------------------------------------
		isRowActive: function(data) {
			return this.DisplayValues.activeRecordKey == data[this.keyField];
		},

	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {

		//Trigger onLoad event
		this.loadFieldEvent();

		//Perform initial render
		this.renderField();

		//Listen for render event
		this.onFilterEvent("_Render", 1042, this.guid + this.formType + this.name, (self, watchedField, clearValue = false) => {
				this.renderField(watchedField, clearValue);
		});
		


	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

		//--------------------------------------------------------------------------------------------
		getRowsPerPage: {
			get () { 
				if (this.DisplayValues.paginate) {
					return (this.dataProvider == null || this.dataProvider.rowsPerPage == null) ? 10 : this.dataProvider.rowsPerPage;
				} else {
					return 99999;
				}
			}
		},
		
	}
}



</script>


