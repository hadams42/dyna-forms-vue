<template>
	<b-form-group class="gallery-view " v-show="DisplayValues.visible">
		<component-label :forId="name" :text="DisplayValues.label" :helpUrl="helpUrl"
			:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
			:lockMessage="DisplayValues.readonlyMessage" :unlockable="!(formReadOnlyLock || readOnlyLock)">
		</component-label>

		<div class="gallery image-thumbnail"
						v-for="(slide, index) in SlideList"
						:key="index"
		>
			<b-button
				@click="buttonClicked(slide)"
				:id="'slide_' + slide.id"
				class="gallery-button"
				>
				<img 
					:src="slide.thumbnailUrl" 
					:alt="slide.title"
				>
			</b-button>
			<div class='desc'>
					<span class="slide-title">{{slide.title}}</span>
					<span v-if="slide.creator != null && slide.creator != ''" class="slide-creator"> by {{slide.creator}}</span>
			</div>

		</div>

	</b-form-group>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";
import validationMixin from "../shared/ValidationMixin.js";
import { IMAGE_PATH } from '../../models/http-common.js';
import ComponentLabel from "../shared/ComponentLabel";
import AsyncLink from "../shared/AsyncLink";

export default {
	name: 'GalleryView',

	components: {
		ComponentLabel,
		AsyncLink
	},

	props: [
		'slides',
		'showSlideTitle',
		'urlPrefix',
		'action'
	],

	data() {
		return {
			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				showSlideTitle: this.showSlideTitle == null ? false : this.showSlideTitle,
				urlPrefix: this.urlPrefix == null ? "" : this.urlPrefix,
				readonly: this.computedReadOnly === true ? true : false,
			},

			SlideList: this.slides == null ? [] : this.slides,

		}
	},

	mixins: [baseInputMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		buttonClicked: function(slide) {
			if (typeof this.action != "undefined" && this.action != null) {
				var p = this.findParent();
				//If local action is defined, then perform it
				if (this.action.onClick != null && this.action.onClick != "") {
					this.action.onClick.call(this,
						this.DisplayValues,
						slide,
						function(cmd, parameters) {
							this.FormActions.LocalAction(this, this.formType, this.guid, cmd, parameters);
						}.bind(this)
						,function(e) {
							console.log("Error: ", e, this.name);
						}.bind(this)
						,this.name //value
					);
				} 
				//Else if server action is defined then perform it
				else {
					this.FormActions.ServerAction(this, 
						this.action, 
						this.instanceId, 
						slide.id, 
						this.DisplayValues,
						null, //Sucess callback. Used by button bar, etc.
						null, //Error callback. Used by button bar, etc.
						)
				}			
			} 
		},

		//--------------------------------------------------------------------------------------------
		refresh: function () {
			this.renderField();
			this.valueModel = this.value;
			this.$forceUpdate();
		},

		//--------------------------------------------------------------------------------------------
		renderField: function (watchedField) {

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
					function (data) {
						this.SlideList = this.DisplayValues.objectFiles;
						if (this.SlideList != null) {
						} else {
							this.SlideList = [];
						}
					}.bind(this)
					, function (e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}

			//Else, call local onRender if specified
			else if (this.onRender != null && this.onRender != "") {
				var p = this.findParent();
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function () {
						//Success code here
						if (this.SlideList != null) {
						} else {
							this.SlideList = [];
						}
					}.bind(this)
					, function (e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} else {
				if (this.SlideList != null) {
				} else {
					this.SlideList = [];
				}
			}
		},
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted() {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function () {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

		//--------------------------------------------------------------------------------------------
		valueModel: {
			get() {
				return (!this.value) ? 0 : this.value
			},
			set(v) {
				this.DisplayValues.rows = v;
				this.$emit('change', v);
			},
		},
	}

}
</script>
