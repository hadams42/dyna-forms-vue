<template>
		<div 
			:id="name"
			class="list-view"
			v-if="DisplayValues.visible"
			v-show="DisplayValues.hidden == false"
		>
			<b-container fluid>
				<b-row v-if="label != '' && label != null" >
					<b-col md="12">
						<h2>{{label}}</h2>
					</b-col>
				</b-row>
				<b-row v-if="itemArray != null && itemArray.length != 0 && DisplayValues.showButtonBar" 
					class="icon-button-row"
				>
					<b-col md="12" class="mb-1" >
						<b-link
							v-if="DisplayValues.buttons.showRefreshButton"
							@click="refreshButtonClick"
							class="icon-button button-input ml-3"
							type="button"
						>
							<i class="refresh-button icon small-size fas fa-sync-alt"></i>
							<span class="icon-label small-size"></span>
						</b-link>

						<b-link
							v-if="DisplayValues.buttons.showDeleteButton"
							@click="deleteButtonClick"
							class="icon-button button-input ml-3"
							type="button"
						>
							<i class="delete-button icon small-size far fa-trash-alt"></i>
							<span class="icon-label small-size"></span>
						</b-link>

						<b-link
							v-if="DisplayValues.buttons.showNewButton"
							@click="newButtonClick"
							class="new-button icon-button button-input ml-3"
							type="button"
						>
							<i class="icon small-size far fa-plus-square"></i>
							<span class="icon-label small-size"></span>
						</b-link>

						<b-link
							v-if="DisplayValues.buttons.showTemplateButton"
							@click="templateButtonClick"
							class="template-button icon-button button-input ml-3"
							type="button"
						>
							<i v-if="DisplayValues.activeTemplate == 'list'" :class="['icon','small-size', DisplayValues.listTemplateIcon ]"></i>
							<i v-if="DisplayValues.activeTemplate == 'grid'" :class="['icon','small-size', DisplayValues.gridTemplateIcon ]"></i>
							<i v-if="DisplayValues.activeTemplate == 'report'" :class="['icon','small-size', DisplayValues.reportTemplateIcon ]"></i>
							<span class="icon-label small-size"></span>
						</b-link>
						<div class="total-count">Count: {{Utilities.FormatString(totalRows, "N0")}}</div>

					</b-col>
				</b-row>
				<b-row>
					<b-col xs="12" class="pl-0" >
						<div :style="'min-height: ' + DisplayValues.tableMinHeight + 'px'" ref="listGroupContainer">
							<div 
								:class="[ itemArray == null || itemArray.length == 0 ? 'empty' :'' ]"
							>
								
								<div v-if="itemArray == null || itemArray.length == 0" 
									:class="[ layoutClasses.empty ]"
								>
									<div>
										{{emptyText}}
									</div>
									<div>
									<b-link
										v-if="DisplayValues.buttons.showRefreshButton"
										@click="refreshButtonClick"
										class="icon-button button-input ml-2"
										type="button"
									>
										<i class="icon small-size fas fa-sync-alt"></i>
										<span class="icon-label small-size"></span>
									</b-link>
									</div>
								</div>

								<div v-if="DisplayValues.activeTemplate !== 'report'"
									:class="['list-wrapper', layoutClasses.list]"
								>
									<div
										v-for="(item, index) in itemArray"
										:active="item[keyField] == DisplayValues.activeRecordKey"
										:key="index"
										:class="[layoutClasses.item, isRowSelected(item) ? 'selected' : '']"
									>
										<div 
											:class="['','justify-content-start', DisplayValues.activeTemplate == 'grid' ? '' : 'align-items-center']">
											<b-form-checkbox  v-if="showItemCheckbox != false"
													class="list-view-checkbox"
													:checked="isRowSelected(item)"
													@change="checkboxChanged(item[keyField])"
											></b-form-checkbox>

											<div class="star"
												v-b-popover.hover.click.blur.top="item._Flag"
												tabindex="0"
												v-if="item._Flag != null"
											>
												<i class="fas fa-star"></i>
											</div>
											
											<div 
												class="list-view-template"
												v-html="fillListItemTemplate(item)"
												@click="rowClicked(item, index)"									
											></div>

										</div>
										<div 
											v-if="actionButtonSettings.visible && getOptions(item) != null && getOptions(item).length > 0"
											:class="['action-button', layoutClasses.actionButton]"
											>
											<b-dropdown 
												size="sm" 
												split 
												right
												:variant="DisplayValues.buttonVariant"
												:text="getOptions(item)[0].caption" 
												class="m-2"
												@click.stop="actionClick(getOptions(item)[0].action, item[keyField])"
											>
												<b-dropdown-item 
													v-for="(option, optionIndex) in getOptions(item)"
													:key="optionIndex"
													@click.stop="actionClick(option.action, item[keyField])"
													>{{option.caption}}
												</b-dropdown-item>
											</b-dropdown>
										</div>
									</div>
								</div>

								<b-table
									v-show="DisplayValues.activeTemplate == 'report'"
									:key="DisplayValues.key"
									:busy="DisplayValues.busy"
									:stacked="stackedWidth"
									:items="items"
									:fields="fields"
									:current-page.sync="DisplayValues.currentPage"
									:per-page.sync="dataProvider.rowsPerPage"
									:sort-by.sync="sortBy"
									:sort-desc.sync="sortDescending"
									:responsive="true"
									:empty-text="emptyText"
									:fixed="fixedColumns"
									:selectable="selectable"
									:select-mode="selectMode"
									:selected-variant="selectedVariant"
									class="report-group"
									small
									thead-class="grid-thead"
									thead-tr-class="grid-thead-tr"
									tbody-class="grid-tbody"
									tbody-tr-class="grid-tbody-tr"
									tfoot-class="grid-tfoot"
									tfoot-tr-class="grid-tfoot-tr"
									:hover="true"
									@row-clicked="rowClicked"
									@refreshed="gridRendered"
								>

									<template slot="head(isSelected)"> 
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
										<div 
											:key="'data-' + index"
											v-if="field.key !== 'isSelected'"
											
											:class="['non-editable-text', field.class]"
											v-b-popover="{content: field.helpText == null || field.helpText == '' ? data.item[field.helpTextKey] : field.helpText, boundaryPadding: 20, placement: 'auto',  html: true, trigger: 'hover focus click blur'  }"
											tabindex="0"
											:disabled="(data.item[field.helpTextKey] == null || data.item[field.helpTextKey] == '' ||  data.item[field.helpTextKey].length == data.item[field.key].length) && (field.helpText == null || field.helpText == '')"
										>
											<span v-html="getFormattedValue(data.item[field.key], field.key)"></span>
										</div>

										<b-form-checkbox 
											v-if="field.key == 'isSelected'"
											:style="{display: showItemCheckbox == false ? 'none' : '' } "
											:class="[field.class]"
											:key="'checkbox-' + index"
											:data-value="data.item[keyField]"
											:checked="isRowSelected(data.item)"
											:plain="true"
											@change="checkboxChanged(data.item[keyField])"
										></b-form-checkbox> 

										<div 
											v-if="field.key == 'actionButtons' && actionButtonSettings.visible && getOptions(item) != null && getOptions(item).length > 1"
											:class="['action-button', layoutClasses.actionButton, field.class]"
											:key="'action-button-' + index"
											>
											<b-dropdown 
												size="sm" 
												split 
												right
												:variant="DisplayValues.buttonVariant"
												:text="getOptions(data.item)[0].text" 
												class="m-2"
												@click.stop="actionClick(getOptions(data.item)[0].action, data.item[keyField])"
											>
												<b-dropdown-item 
													v-for="(option, optionIndex) in getOptions(data.item)"
													:key="optionIndex"
													@click.stop="actionClick(option.action, data.item[keyField])"
													>{{option.text}}
												</b-dropdown-item>
											</b-dropdown>
										</div>

										<div 
											v-if="field.key == 'actionButtons' && actionButtonSettings.visible && getOptions(item) != null && getOptions(item).length == 1"
											:class="['action-button', layoutClasses.actionButton, field.class]"
											:key="'action-button-' + index"
											>
											<b-button 
												size="sm" 
												:variant="DisplayValues.buttonVariant"
												v-html="getOptions(data.item)[0].text" 
												:class="['m-2', 'key-' + data.item[keyField]]"
												@click.stop="actionClick(getOptions(data.item)[0].action, data.item[keyField])"
											>
											</b-button>
										</div>


									</template>
								</b-table>	
							</div>
						</div>						
					</b-col>
				</b-row>
				<b-row v-if="itemArray != null && itemArray.length > 0 && DisplayValues.paginate == true">
					<b-col sm="12" class="my-1 pagination-container">
						<b-form-group 
							style="width: auto;"
							v-if="pageSizeOptions != null"
							horizontal 
							label="Per page" 
							label-cols="6" 
							label-size="sm" 
							class="mb-0 mr-3 page-size-options"
						>
		          <b-form-select  
								size="sm"
								style="width: 70px"
								:options="pageSizeOptions" 
								v-model="computedRowsPerPage" 
							/>
        		</b-form-group>						
						<b-pagination 
							:total-rows="totalRows" 
							:per-page="computedRowsPerPage" 
							v-model="DisplayValues.currentPage" 
							size="sm"
							align="right"
							class="my-0" 
							prev-text="Prev"
							next-text="Next"
							@change="pageChangeEvent"
						/>
					</b-col>
				</b-row>
			</b-container>
		
			<input type="hidden" :value="DisplayValues.activeRecordKey">
			<div v-if="debugMode == true">
				Selected Ids: {{DisplayValues.selectedRecordKeys}}
				| Active Id: {{DisplayValues.activeRecordKey}}
				| Page #: {{DisplayValues.activeRecordKey}}
				| Current Page: {{DisplayValues.currentPage}}
				| Per Page: {{computedRowsPerPage}}
				| Busy: {{DisplayValues.busy}}
				| Total Rows: {{totalRows}}
				| Params: {{DisplayValues.parameters}}
				| Sort By: {{sortBy}}
				| Sort Descending: {{sortDescending}}
				| InstanceId: {{instanceId}}
			</div>
		</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import { ServerInterface } from "../../ServerInterface.js";
import baseInputMixin from "../shared/BaseInputMixin.js";

export default {
  name: 'ListView',
  props: [
		'onNewButtonClick',
		'onDeleteButtonClick',
		'busy',
		'keyField',
		'stackedWidth',
		'emptyText',
		'multiSelect',
		'fixedColumns',
		'showNewButton',
		'showDeleteButton',
		'showRefreshButton',
		'showConfirmDialog',
		'showItemCheckbox',
		'showTemplateButton',
		'showConfirmDialog',
		'showMessageDialog',
		'showHeader',
		'dataProvider',
		'debugMode',
		'autoRender',
		'selectedRecordKeys',
		'selectable',
		'selectMode',
		'selectedVariant',
		'initialParameters',
		'instanceId',
		'enablePagination',
		'actionButton',
		'listTemplate',
		'listTemplateIcon',
		'gridTemplate',
		'gridTemplateIcon',
		'reportTemplate',
		'reportTemplateIcon',
		'activeTemplate',
		'buttonVariant',
		'onRenderRow',
		'showButtonBar'
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
				selectedRecordKeys: [],
				headerCheckboxState: false,
				tableMinHeight: 0,
				isInitialRender: true,
				isFlashProtected: true,
	      currentPage: (this.dataProvider == null || this.dataProvider.initialPage == null) ? 1 : this.dataProvider.initialPage,
				buttonVariant: this.buttonVariant || "secondary",
				activeTemplate: this.getLocalStorage(this.name+'_activeTemplate') != null ?  this.getLocalStorage(this.name+'_activeTemplate') : this.activeTemplate || "list",
				listTemplateIcon: this.listTemplateIcon == null ? 'fas fa-th-large' : this.listTemplateIcon,
				gridTemplateIcon: this.gridTemplateIcon == null ? 'fa fa-bars' : this.gridTemplateIcon,
				reportTemplateIcon: this.reportTemplateIcon == null ? 'fas fa-table' : this.reportTemplateIcon,
				showButtonBar: this.showButtonBar == null ? true : this.showButtonBar,
				showHeader: this.showHeader == null ? false : this.showHeader,
				buttons: {
					showNewButton: this.showNewButton == null ? true : this.showNewButton,
					showDeleteButton: this.showDeleteButton == null ? true : this.showDeleteButton,
					showRefreshButton: this.showRefreshButton == null ? true : this.showRefreshButton,
					showTemplateButton: this.showTemplateButton == null ? false : this.showTemplateButton,
				},
			},

			layoutClasses: {
				list: null,
				empty: null,
				item: null,
				actionButton: null,
				data: null,
			},
			formats: {},
      totalRows: (this.dataProvider == null || this.dataProvider.data == null) ? 0 : this.dataProvider.data.length,
			providerType: (this.dataProvider == null || this.dataProvider.providerType == null) ? 'static' : this.dataProvider.providerType,
			fields: this.autoRender === false ? [] : (this.dataProvider == null || this.dataProvider.fieldDefinition == null) ? null : this.dataProvider.fieldDefinition,
			fieldDict: {}, 
			items: this.autoRender === false ? [] : this.dataProvider == null ? null : this.dataProvider.providerType == "api" ? this.dataApi : this.dataProvider.providerType == "static" && this.dataProvider.data != null ? this.dataProvider.data : null,
			itemArray: [],
      sortBy: (this.dataProvider == null || this.dataProvider.initialSort == null) ? this.getLocalStorage(this.name+'_initialSortBy') : this.dataProvider.initialSort,
      sortDescending: this.getLocalStorage(this.name+'_initialSortDescending') == null ? this.dataProvider == null ? false : this.dataProvider.initialSortDescending : this.getLocalStorage(this.name+'_initialSortDescending') === 'true',
			pageSizeOptions: (this.dataProvider == null || this.dataProvider.pageSizeOptions == null) ? null : this.dataProvider.pageSizeOptions,
			actionButtonSettings: {
				visible: (this.actionButton == null || this.actionButton.visible == null) ? false : this.actionButton.visible,
				options: (this.actionButton == null || this.actionButton.options == null) ? [] : this.actionButton.options,
				optionsFunc: (this.actionButton == null || typeof this.actionButton.optionsFunc == "undefined") ? null : this.actionButton.optionsFunc,
			}

		}
	},

	mixins: [ baseInputMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		// List Methods
		//--------------------------------------------------------------------------------------------

		getLocalStorage: function(key) {
			if (this.enableLocalStorage) {
				return localStorage[key];
			}
			else  {
				return null;
			}
		},

		fillListItemTemplate: function(item) {
			var result = "";
			switch (this.DisplayValues.activeTemplate) {
				case "grid":
					result = this.Utilities.FillHtmlTemplate(this.gridTemplate, item);				
					break;
				case "report":
					result = this.Utilities.FillHtmlTemplate(this.reportTemplate, item);				
					break;
				case "list": 
				default:
					result = this.Utilities.FillHtmlTemplate(this.listTemplate, item);				
					break;
			}

			//Fill mustache templates
			var re = /\{(.+?)\}/g;
			var match;
			var isFound = false;
			var isTemplate = false;

			while (result.includes("{") && result.includes("}")) {
				match = re.exec(result);
				isTemplate = true;
				var v = '';
				if (match) {
					v = item[match[1]] || '';
					var replacementValue = null;
					if (v.length == 10) {
						var event = new Date(v);
						if (Boolean(+event)) {
							var options = {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							};
							replacementValue = event.toLocaleDateString(undefined, options);
						}
					}
					if (replacementValue == null) {
						replacementValue = v;
					}
					if (replacementValue != null && replacementValue != '') {
						isFound = true;
					}
					result = this.Utilities.ReplaceAll(result, "{" + match[1] + "}", replacementValue);
				}
			}


			//Call on row render event handler if defined
			if (this.onRenderRow != null && this.onRenderRow != "") {
				var p = this.findParent(); 
				result = this.onRenderRow.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					item,
					result
				);
			}

			return result;
		},

		//--------------------------------------------------------------------------------------------
		getFormattedValue: function(value, key) {
			var format = this.Utilities.GetStringValue(this.formats[key]);
			return this.Utilities.FormatString(value, format);
		},


		//--------------------------------------------------------------
		initializeLayoutClasses: function() {
			switch (this.DisplayValues.activeTemplate) {
				case "grid":
					this.layoutClasses.list = "list-group list-group-horizontal";
					this.layoutClasses.empty = "list-group-item empty-text d-flex pr-2 justify-content-between";
					this.layoutClasses.item = "list-group-item horiz-item";
					this.layoutClasses.actionButton = "";
					this.layoutClasses.data = "";
					break;
				case "list": 
					this.layoutClasses.list = "list-group";
					this.layoutClasses.empty = "empty-text";
					this.layoutClasses.item = "list-group-item";
					this.layoutClasses.actionButton = "";
					this.layoutClasses.data = "";
					break;
				case "report": 
					this.layoutClasses.list = "report-group";
					this.layoutClasses.empty = "report-group-item empty-text d-flex justify-content-between";
					this.layoutClasses.item = "report-item-template resp-table-row";
					this.layoutClasses.actionButton = "d-flex justify-content-start align-items-start";
					this.layoutClasses.data = "";
					break;
			}

		},

		//--------------------------------------------------------------------------------------------
		// Grid Methods
		//--------------------------------------------------------------------------------------------
		refresh: function() {
			this.DisplayValues.currentPage = 1;
			this.refreshGrid();
		},
		
		//--------------------------------------------------------------------------------------------
		refreshGrid: function() {
			//this.DisplayValues.currentPage = 1;
			this.debounce(this.updateGridKey(), 200);
		},

		//--------------------------------------------------------------------------------------------
		selectAll: function(isChecked=true) {
			if (isChecked) {
				this.DisplayValues.selectedRecordKeys = [];
				if (this.itemArray.length > 0) {
					var startIndex = (this.DisplayValues.currentPage * this.computedRowsPerPage) - this.computedRowsPerPage;
					var endIndex = (this.DisplayValues.currentPage * this.computedRowsPerPage); 
					if (endIndex > this.itemArray.length) endIndex = this.itemArray.length;
					for (var i = startIndex; i<endIndex; i++) 
					{
						this.DisplayValues.selectedRecordKeys.push(this.itemArray[i][this.keyField]);
					}
				}
			} else {
				this.DisplayValues.selectedRecordKeys = [];
			}
		},		

		//--------------------------------------------------------------------------------------------
		getOptions: function(item) {
			if (this.actionButtonSettings.optionsFunc != null )  {
				return this.actionButtonSettings.optionsFunc(item);
			}
			else {
				return this.actionButtonSettings.options;
			}
		},

		//--------------------------------------------------------------------------------------------
		updateGridKey: function() {
			var currentTableHeight = this.$refs.listGroupContainer.clientHeight - 0;
			this.DisplayValues.tableMinHeight = currentTableHeight;
			this.$nextTick(function() {
				this.DisplayValues.key++;
			});
		},

		//--------------------------------------------------------------------------------------------
		getFormattedClass: function(value, key, item) {
			if (this.fieldDict[key] != null) {

				return item[this.fieldDict[key].classKey];
			}
			
		},

		//--------------------------------------------------------------------------------------------
		dataApi: function(ctx, callback) {
			localStorage[this.name + "__CurrentPage"] = this.DisplayValues.currentPage; 
 			var currentTableHeight = this.$refs.listGroupContainer.clientHeight + 0;
			this.DisplayValues.tableMinHeight = currentTableHeight;
			this.ServerInterface.RenderPage(
				this, 
				function(responseJson, callback) {
					if (responseJson.items.length > 0 && responseJson.items[0]["_TotalCount"] > 0) {
						this.totalRows = responseJson.items[0]["_TotalCount"];
					} else {
						this.totalRows = 0;
					}
					if (this.dataProvider == null || this.dataProvider.fieldDefinition == null) this.fields = responseJson.fields;
					this.itemArray = responseJson.items;

					//loop through field list
					for (var i=0; i<this.fields.length; i++) {

						this.fieldDict[this.fields[i].key] = this.fields[i];
						
						//parse out tdClass
						//if (this.fields[i].key == 'tdClass') {
						this.fields[i].tdClass = this.getFormattedClass;
						//}
						//parse formats out of fields	
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
				}.bind(this),
				callback,
				this.instanceId,
				this.DisplayValues.currentPage, 
				this.computedRowsPerPage, 
				this.sortBy, 
				this.sortDescending ? 'desc' : 'asc',
				this.DisplayValues.parameters
			);
		},

		//--------------------------------------------------------------------------------------------
		deleteBulkSelections: function(selection, caption="Confirm Delete", message="Delete these records?") {

			var selectedRecords;
			if (selection != null && selection.length > 0) {
				selectedRecords = selection;
			}
			else {
				selectedRecords = this.DisplayValues.selectedRecordKeys;
			}

			if (selectedRecords != null && selectedRecords.length > 0) {
				this.showConfirmDialog(
					caption, //Caption
					message, //Message Text
					//Dialog box "Ok" action
					function() {
						this.ServerInterface.DeleteBatch(
							this,
							this.instanceId, 
							selectedRecords, 
							//Delete batch success
							function() {
								this.DisplayValues.selectedRecordKeys = [];
								this.refreshGrid();
							}.bind(this),
							//Delete batch error action
							function(e) {
								console.log("Error deleting batch: " + e);
								this.showMessageDialog("Error", e);
							}.bind(this),
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
		deleteSingleSelection: function(selection) {
			console.log("Delete single selection not implemented");
		},

		//--------------------------------------------------------------------------------------------
		// Event Handlers
		//--------------------------------------------------------------------------------------------
		
		//--------------------------------------------------------------------------------------------
		gridRendered: function() {
			//if (this.DisplayValues.isInitialRender == false) {
				if (this.DisplayValues.isFlashProtected) {
					this.Utilities.FlashProtect();
					this.DisplayValues.isFlashProtected = false;
				}
			//} else {
			//	this.DisplayValues.isInitialRender = false;
			//}
		},

		//--------------------------------------------------------------------------------------------
		actionClick: function(action, selectedRecordKey) {
			//Perform local onclick if defined
			if (action.onClick != null && typeof action.onClick != "object") {
				var p = this.findParent();
				action.onClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(cmd, parameters) {
						this.FormActions.LocalAction(cmd, parameters);
					}.bind(this),
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this),
					selectedRecordKey
				);
			} 
			//Else perform server actioon
			else {
				this.FormActions.ServerAction(this, action, this.instanceId, selectedRecordKey, this.DisplayValues);
			}
		},

		//--------------------------------------------------------------
		// headerCheckboxChanged: function() {
		// 	this.DisplayValues.headerCheckboxState = !this.DisplayValues.headerCheckboxState;
		// 	this.DisplayValues.selectedRecordKeys = [];
		// 	if (this.DisplayValues.headerCheckboxState && this.items.length > 0) {
		// 		var startIndex = (this.DisplayValues.currentPage * this.computedRowsPerPage) - this.computedRowsPerPage;
		// 		var endIndex = (this.DisplayValues.currentPage * this.computedRowsPerPage); 
		// 		if (endIndex > this.items.length) endIndex = this.items.length;
		// 		for (var i = startIndex; i<endIndex; i++) 
		// 		{
		// 			this.DisplayValues.selectedRecordKeys.push(this.items[i][this.keyField]);
		// 		}
		// 	}
		// },

		//--------------------------------------------------------------------------------------------
		pageChangeEvent: function(e) {
			this.DisplayValues.headerCheckboxState = false;
			if (this.clearSelectionOnPageChange == true) {
				this.DisplayValues.selectedRecordKeys = [];
			}
		},

		//--------------------------------------------------------------
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

		//--------------------------------------------------------------
		rowClicked: function(item, index, event) {
			let newKey = item[this.keyField];
			this.DisplayValues.activeRecordKey = newKey;
			this.$emit('change', this.DisplayValues.activeRecordKey);
			this.fieldInputEvent(newKey, item);
		},

		//--------------------------------------------------------------
		newButtonClick: function() {
			if (this.onNewButtonClick != null && this.onNewButtonClick != "") {
				var p = this.findParent(); 
				this.onNewButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(action) {
						this.FormActions.ServerAction(this, action, this.instanceId, p.ActiveFormData._Id, this.DisplayValues)
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------
		templateButtonClick: function() {
			switch (this.DisplayValues.activeTemplate) {
				case "list":
					this.DisplayValues.activeTemplate = "grid";
					break;
				case "grid":
					this.DisplayValues.activeTemplate = "report";
					break;
				case "report":
					this.DisplayValues.activeTemplate = "list";
					break;
			}

			//Save preference
			localStorage[this.name+'_activeTemplate'] = this.DisplayValues.activeTemplate;

			//Initialize layout classes
			this.initializeLayoutClasses();

		},

		//--------------------------------------------------------------
		deleteButtonClick: function(selection) {
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
					this.deleteBulkSelections(selection);
				}
				//If this is single select, then delete using form render
				else {
					this.deleteSingleSelection(selection);
				}				
			}
		},

		//--------------------------------------------------------------
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

		//--------------------------------------------------------------------------------------------
		// Render and Grid Maintenance Methods
		//--------------------------------------------------------------------------------------------

		renderField: function(watchedField) {
			//watchedField is the field that changed and triggered this render.

			//Initialize layout classes
			this.initializeLayoutClasses();

			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				if (this.onRender != null && this.onRender != "") {
					console.log("WARNING: Local event 'onRender' ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				console.log("enableServerRender not implemented for ListView");
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
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} else {
				this.onAfterRenderEvent();
			}
		},

		//--------------------------------------------------------------------------------------------
		isRowSelected: function(item) {
			return this.DisplayValues.selectedRecordKeys.includes(item[this.keyField]);
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
		this.onFilterEvent("_Render", 884, this.guid + this.formType + this.name, (self, watchedField, clearValue = false) => {
				this.renderField(watchedField, clearValue);
		});
		


	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

		//--------------------------------------------------------------------------------------------
		computedRowsPerPage: {
			get () { 
				if (this.DisplayValues.paginate) {
					return (this.dataProvider == null || this.dataProvider.rowsPerPage == null) ? this.getLocalStorage(this.name+'_rowsPerPage') || 10 : this.getLocalStorage(this.name+'_rowsPerPage') || this.dataProvider.rowsPerPage;
				} else {
					return 99999;
				}
			},

			set (v) {
				this.dataProvider.rowsPerPage = v;
				localStorage[this.name+'_rowsPerPage'] = v;
			}

		},
		
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
  watch: {
    sortBy: function(val) {
			localStorage[this.name+'_initialSortBy'] = val;
    },
    sortDescending: function(val) {
			localStorage[this.name+'_initialSortDescending']	= val;
    }
  },
}

</script>

