<template>
	<label
		:for="forId"
		:class="['component-label',readonly ? 'readonly' : '']"
		v-if="text != null && text != ''"				
	>
		<span v-html="getTemplate()"></span>
		
		<a v-if="helpText != null || helpUrl != null"
				class="help"
				:tabindex="-1"
				href="#" 
				:disabled="helpText == null || helpText == ''"
				@click.prevent="() => {}"
				v-b-popover.hover.click.blur.auto="helpText"
		>
			<i class="fas fa-info-circle"></i>
		</a>

		<span v-if="DisplayValues.initialState == true && DisplayValues.unlockable == true"
			>
			<a v-if="DisplayValues.locked == true && (lockMessage == null || lockMessage)"
				:class="['lock-icon']"
				href="#"
				@click="toggleLock()"
				:disabled="lockMessage == null || lockMessage == ''"
				tabindex="0"
				v-b-popover.hover.click.blur.auto="lockMessage"
			>
				<i class="fas fa-lock"></i>				
			</a>
		</span>

		<span v-if="requiredField" 
			class="required-indicator"
			v-b-popover.hover.click.blur.auto="'Required'"
		>*</span>


		<a v-if="kpiText != null || kpiTitle != null"
				class="kpi-icon"
				:tabindex="-1"
				href="#" 				
		>
			<span>
				<img v-b-popover.hover.auto="kpiText" :title="kpiTitle" src="/images/kpi.png">
			</span>

		</a>

		<a v-if="editIcon === true && readonly == true"
				class="edit-icon"
				:tabindex="-1"
				@click="editOn()" 
		>
			<i class="fas fa-pen"></i>
		</a>

		<a v-if="editIcon === true && readonly == false"
				class="save-icon"
				:tabindex="-1"
				onclick="this.editOff(); return false;" 
		>
			<i class="fas fa-check"></i>
		</a>


	</label>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import { Utilities } from "../../Utilities.js";

export default {
	name: 'ComponentLabel',
	
  props: [
		'forId',
		'text',
		'helpText',
		'kpiText',
		'helpUrl',
		'kpiTitle',
		'locked',
		'lockMessage',
		'unlockable',
		'requiredField',
		'adminUnlockable',
		'editIcon',
		'isAdmin',	
		'readonly'
		],
	
	data () {
		return {
			Utilities: new Utilities(),

			DisplayValues: {
				locked: this.locked == null ? false : this.locked,
				initialState: this.locked,
				unlockable: this.unlockable == null ? false : this.unlockable,
			}
		}
	},

	watch: {

		locked: function(val) {
			this.DisplayValues = val == null ? false : val;
		}

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		toggleLock: function() {
			if (this.lockMessage != null && this.lockMessage != "") {
				return;
			}

			if (this.isAdmin != false && this.adminUnlockable == true) {
				return;
			}

			this.DisplayValues.locked = !this.DisplayValues.locked;
			this.$emit("locked", this.DisplayValues.locked);
		},

		//--------------------------------------------------------------------------------------------
		editOn: function() {
			this.$emit("editOn");
			return false;
		},

		//--------------------------------------------------------------------------------------------
		editOff: function(v) {
			this.$emit("editOff");
			return false;
		},

		//--------------------------------------------------------------------------------------------
		findParent: function() {
			//Find parent which contains active form data
			var p = this.$parent;
			while (p)
			{
				if (p.ActiveFormData != null) break;
				p = p.$parent;
			}
			return p;
		},

		//--------------------------------------------------------------------------------------------
		getTemplate: function() {
			if (this.text != null) {
				var p = this.findParent();
				var result = this.text;

				var re = /\{(.+?)\}/g;
				var match;

				while (match = re.exec(result)) {
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

				return result;
			} 
			else {
				return this.text;
			}
		},		



	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},

}
</script>