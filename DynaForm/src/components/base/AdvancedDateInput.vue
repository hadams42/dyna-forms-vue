
<template>
		<b-form-group 
			class="advanced-date-input"
			v-show="DisplayValues.visible"
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:requiredField="rules != null && rules.required == true ? true : false"
				@locked="onLockToggle()"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
			>
			</component-label>

			<div 
				class="form-control readonly"
				v-if="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				:style="getReadOnlyStyle()"
				@click="onLockToggle(false)"
			>{{value}}</div>

			<datepicker 
				v-if="!(computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null))"
				:name="name"
				:value="value"
				:bootstrap-styling="true"
				:format="DisplayValues.format"
				:full-month-name="DisplayValues.showFullMonthName"
				:disabled-dates="DisplayValues.disabledDates"
				:placeholder="DisplayValues.placeholder"
				:inline="DisplayValues.inline"
				:clear-button="DisplayValues.showClearButton"
				clear-button-icon="fa fa-times"
				:calendar-button="DisplayValues.showCalendarButton"
				calendar-button-icon="fa fa-calendar"
				:disabled="DisplayValues.disabled"
				:typeable="DisplayValues.typeable"
				:open-date="DisplayValues.openDate"
				:initial-view="DisplayValues.initialView"
				:minimum-view="DisplayValues.minimumView"
				:maximum-view="DisplayValues.maximumView"
				:highlighted="{ dates: [ new Date()  ] }"
				@input="dateChangeEvent"
				:input-class="validationState == false ? 'is-invalid' : ''"
			>
			</datepicker>

			<div
				class="invalid-feedback"
				style="display: inherit"
				v-if="this.Validation.Status  > 0 && this.Validation.MessageList.length > 0"
			>
				<ul
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
		</b-form-group>
</template>

<script>

/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  
Portions of the date picker code is licensed under the MIT open-source license.
Copyright (c) Charlie Kassel <ck@charliekassel.com> */


import Datepicker from 'vuejs-datepicker';
import validationMixin from "../shared/ValidationMixin.js";
import textInputMixin from "../shared/TextInputMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
	name: 'AdvancedDateInput',
	
	components: { ComponentLabel,	Datepicker },
	
  props: [
		'format',
		'showFullMonthName',
		'language',
		'disabledDates',
		'placeholder',
		'inline',
		'showClearButton',
		'showCalendarButton',
		'disabled',
		'typeable',
		'openDate',
		'initialView',
		'minimumView',
		'maximumView'
		],
	
	data () {
		return {
			DisplayValues: {
				format: this.format == null ? 'yyyy/MM/dd' : this.format,
				showFullMonthName: this.showFullMonthName == null ? false : this.showFullMonthName,
				disabledDates: this.disabledDates == null ? {} : this.disabledDates,
				placeholder: this.placeholder == null ? '' : this.placeholder,
				inline: this.inline == null ? false : this.inline,
				showClearButton: this.showClearButton == null ? true : this.showClearButton,
				showCalendarButton: this.showCalendarButton == null ? true : this.showCalendarButton,
				disabled: this.disabled == null ? false : this.disabled,
				typeable: this.typeable == null ? true : this.typeable,
				openDate: this.openDate == null ? null : this.openDate,
				initialView: this.initialView == null ? null : this.initialView,
				minimumView: this.minimumView == null ? 'day' : this.minimumView,
				maximumView: this.maximumView == null ? 'year' : this.maximumView,
			},
		}
	},

	mixins: [baseInputMixin, textInputMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {
		dateChangeEvent: function(e) {
			this.fieldChangeEvent(e, true);
			this.fieldInputEvent(e)
		}

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},

}
</script>