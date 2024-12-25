<template>
<div :class="[ActiveFormSettings.customClasses]" > 
	<div class="indeterminate-progress-bar" v-if="IsFormProgressBarVisible"></div>
	FormId: {{ formId }} IsFormProgressBarVisible: {{ IsFormProgressBarVisible }}
	<div 
		:class="['form-title']" 
		v-if="ActiveFormSettings.title != null && ActiveFormSettings.title != ''"
		v-b-toggle="guid + 'Collapse'"
	>{{ActiveFormSettings.title}}</div>
	<b-collapse 
			:id="guid + 'Collapse'" 
			:visible="getLocalStorage(formType + '__' + ActiveFormSettings.title) == 'true' ? false : true"
			v-on:show="setLocalStorage(formType + '__' + ActiveFormSettings.title, false)"
			v-on:hide="setLocalStorage(formType + '__' + ActiveFormSettings.title, true)"
	>
		<b-container fluid 
			:class="['dyna-form', ActiveFormSettings.formType, ActiveFormSettings.isFlashProtected == true ? 'flash-protect' : '', computedReadOnly ? 'form-readonly' : '']"
			v-show="ActiveFormData._Id > -1 || ActiveFormSettings.hideBlankForm == null || ActiveFormSettings.hideBlankForm == false"
		>
			<div v-if="layout==null" >
				<b-form-row>
					<div 
						v-for="(field, index) in ActiveSchema"
						v-show="field.visible != false"
						:class="Utilities.GetColumnClass(typeof field.width == 'undefined' ? '12' : field.width, field.newRow, '')"
						:key="index"
					>
						<div :class="field.customClasses" require="src/components/shared/FormComponentTemplate.html"></div>
					</div>
				</b-form-row>
			</div>

			<div v-if="layout!=null" >
				<div v-for="(level1_row, index1) in layout.rows"
					:key="index1"
				>
					<b-form-row 
						:class="[Utilities.GetRowClass(level1_row.align), level1_row.customClasses]"					
					>
						<div 
							v-for="(level1_column, index2) in filterColumns(level1_row.columns)"
							:key="index2"
							:class="Utilities.GetColumnClass(level1_column.width, false, level1_column.customClasses)"
						>
							<div 
								v-for="(field, index3) in filterFields(ActiveSchema, level1_column)"
								:key="index3"
							>
								<div require="src/components/shared/FormComponentTemplate.html"></div>
							</div>
							<div 				
								v-for="(level2_row, index4) in level1_column.rows"
								:key="index4"
							>
								<b-form-row 
									:class="Utilities.GetRowClass(level2_row.align)"
								>
									<div 
										v-for="(level2_column, index5) in filterColumns(level2_row.columns)"
										:key="index5"
										:class="Utilities.GetColumnClass(level2_column.width, false, level2_column.customClasses)"
									>
										<div 
											v-for="(field, index6) in filterFields(ActiveSchema, level2_column)"
											:key="index6"
										>
											<div require="src/components/shared/FormComponentTemplate.html"></div>
										</div>	
									</div>
								</b-form-row>
							</div>
						</div>
					</b-form-row>
				</div>
			</div>
			<div v-if="secondaryLayout != null" >

				<div 
					v-if="secondaryLayoutTitleCollapsed != null && secondaryLayoutTitleCollapsed != ''"
					class="secondary-layout"
				>
					<div class="secondary-layout-title">
						<b-link
							type="button"
							v-b-toggle="'SecondaryCollapse'" 
						>
							<span
								v-html="this.getSecondaryLayoutTitle()"
							> 
							</span>
						</b-link>					
					</div>

					<b-collapse 
						id="SecondaryCollapse" 
					>				
						<div v-for="(level1_row, index1) in secondaryLayout.rows"
						:key="index1"
						>
							<b-form-row 
									:class="[Utilities.GetRowClass(level1_row.align), level1_row.customClasses]"					
									>
								<div 
										v-for="(level1_column, index2) in filterColumns(level1_row.columns)"
										:key="index2"
										:class="Utilities.GetColumnClass(level1_column.width, false, level1_column.customClasses)"
										>
									<div 
											v-for="(field, index3) in filterFields(ActiveSchema, level1_column)"
											:key="index3"
											>
										<div require="src/components/shared/FormComponentTemplate.html"></div>
									</div>
									<div 				
											v-for="(level2_row, index4) in level1_column.rows"
											:key="index4"
											>
										<b-form-row 
												:class="Utilities.GetRowClass(level2_row.align)"
												>
											<div 
													v-for="(level2_column, index5) in filterColumns(level2_row.columns)"
													:key="index5"
													:class="Utilities.GetColumnClass(level2_column.width, false, level2_column.customClasses)"
													>
												<div 
														v-for="(field, index6) in filterFields(ActiveSchema, level2_column)"
														:key="index6"
														>
													<div require="src/components/shared/FormComponentTemplate.html"></div>
												</div>	
											</div>
										</b-form-row>
									</div>
								</div>
							</b-form-row>
						</div>
					</b-collapse>

				</div>				

			</div>
			

		</b-container>
	</b-collapse>
	<div v-if="this.showValidationSummary() == true && ActiveFormSettings.showValidationSummary === true"
		class="validation-summary text-danger">
		<div class="font-weight-bolder"><i class="fas fa-exclamation-triangle"></i> 
			The following fields have missing or invalid data</div>
		<ul>
			<li v-for="(v, index) in ValidationCollector" 
				:key="index"
				v-html="validationMessage(v)"
			>
			</li>
		</ul>
	</div>

	<div 
		v-if="isSubForm==false && formSettings.debugMode == true"
		style="font-size: 10pt"
	>
		Validation Collector: {{ValidationCollector}}
		Unvalidated Fields: {{UnvalidatedFields}}
		<br/>Form Guid: {{guid}}
		<br/>Form Data: {{ActiveFormData}}
		<br/>FormId at form level: {{formId}}
		<br/>InstanceId: {{instanceId}}
		<br/>Auto Save: {{this.ActiveFormSettings.autoSaveValidFields}}
  </div> 
</div>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import DynaFormMixin from "./shared/DynaFormMixin.js";
import LiteBusMixin from "./shared/LiteBusMixin";

import NumberInput from "./base/NumberInput";
import SelectList from "./base/SelectList";
import CheckboxInput from "./base/CheckboxInput";
import TypeaheadInput from "./base/TypeaheadInput";
import TextInput from "./base/TextInput";
import CommentView from "./base/CommentView";
import HiddenField from "./base/HiddenField";
import LabelField from "./base/LabelField";
import ImageViewer from "./base/ImageViewer";
import AdvancedImageViewer from "./base/AdvancedImageViewer";
import CountryPicker from "./derived/CountryPicker";
import CurrencyPicker from "./derived/CurrencyPicker";
import ButtonInput from "./base/ButtonInput";
import ButtonBar from "./base/ButtonBar";
import GridView from "./base/GridView";
import ListView from "./base/ListView";
import ProgressView from "./base/ProgressView";
import DateInput from "./base/DateInput";
import AdvancedDateInput from "./base/AdvancedDateInput";
import UploadControl from "./base/UploadControl";
import TagInput from "./base/TagInput";
import TagView from "./base/TagView";
import AutoSuggestInput from "./base/AutoSuggestInput";
import MapView from "./base/MapView";
import MapStaticView from "./base/MapStaticView";
import WordCloud from "./base/WordCloudView";
import KpiView from "./base/KpiView";
import GalleryView from "./base/GalleryView";
import CarouselView from "./base/CarouselView";
import PDFTronView from "./base/PDFTronView";
import ArrowBar from "./base/ArrowBar";
import MapPicker from "./base/MapPicker";
import AlertField from "./base/AlertField";
import FundingInput from "./base/FundingInput";
import RichTextInput from "./base/RichTextInput";

export default {
  name: "DynaForm",
	
	components: { 
		NumberInput, 
		SelectList, 
		TextInput,
		CommentView,
		CheckboxInput, 
		CountryPicker, 
		ButtonInput, 
		GridView, 
		ListView, 
		HiddenField, 
		LabelField,
		UploadControl, 
		ImageViewer, 
		AdvancedImageViewer,
		ProgressView,
		ButtonBar ,
		CurrencyPicker,
		TypeaheadInput,
		DateInput,
		AdvancedDateInput,
		TagInput,
		TagView,
		AutoSuggestInput,
		MapView,
		MapStaticView,
		WordCloud,
		KpiView,
		GalleryView,
		PDFTronView,
		ArrowBar,
		MapPicker,
		CarouselView,
		AlertField,
		FundingInput,
		RichTextInput		
	},
	
	props: [
	],

	mixins:[ DynaFormMixin, LiteBusMixin ],

  data() {
    return {
    };
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
  methods: {

		getLocalStorage: function(key) {
			return localStorage[key];
		},

		setLocalStorage: function(key, value) {
			localStorage[key] = value;
		},

		showValidationSummary: function() {
			 if (this.ValidationCollector != null && this.ValidationCollector.length > 0) {
				 for (var i=0; i<this.ValidationCollector.length; i++) {
					 if (this.ValidationCollector[i].Status != 0) return true;
				 }
			 }
			 return false;
		},

		getSecondaryLayoutTitle: function(key) {
			return this.secondaryLayoutTitleCollapsed;
		}
	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	watch: {
	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	computed: {
	},
	
};
</script>

