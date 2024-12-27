<template>
	<b-form-group class="gallery-view " v-show="DisplayValues.visible">
		<component-label :forId="name" :text="DisplayValues.label" :helpUrl="helpUrl"
			:locked="DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
			:lockMessage="DisplayValues.readonlyMessage" :unlockable="!(formReadOnlyLock || readOnlyLock)">
		</component-label>

		<div v-if="SlideList == null || SlideList.length == 0">
			<span class="empty-list">No files</span>
		</div>

		<div v-for="(slide, index) in SlideList" :key="index" class="image-gallery">
			<div class="image-container" @click="buttonClicked(slide)" :id="'slide_' + slide.id">
				<div 
					class="caption" 
					:title="slide.filename"
				><em v-if="slide.title != null && slide.title != ''" class="title">
						{{slide.title}}
					</em>
					<em v-if="slide.title == null || slide.title == ''" class="title">
						{{getSlideFilename(slide.filename)}}
					</em>
					<span v-if="slide.creator != null && slide.creator != ''" class="photographer">by {{ slide.creator }}
					</span>
				</div>
				<img :src="slide.thumbnailUrl">
				<div class="icons">
					<span class="download-icon" @click.stop="downloadClicked(slide)">
						<a 
							:href="slide.url" 
							:download="slide.filename" 
							target="_blank">
							<i class='fas fa-file-download'></i>
						</a>
					</span>
					<span class="delete-icon" @click.stop="deleteClicked(slide)">
						<i class="icon small-size far fa-trash-alt"></i>
					</span>
				</div>
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
		'action',
		'onDelete',
		, 'hideDeleteIcon'
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
				hideDeleteIcon: this.hideDeleteIcon === true ? true : false,
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
		buttonClicked: function (slide) {
			if (this.computedReadOnly) return;

			if (typeof this.action != "undefined" && this.action != null) {
				var p = this.findParent();
				//If local action is defined, then perform it
				if (this.action.onClick != null && this.action.onClick != "") {
					this.action.onClick.call(this,
						this.DisplayValues,
						slide,
						function (cmd, parameters) {
							this.FormActions.LocalAction(this, this.formType, this.guid, cmd, parameters);
						}.bind(this)
						, function (e) {
							console.log("Error: ", e, this.name);
						}.bind(this)
						, this.name //value
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
		deleteClicked: function (slide) {
			var id = slide.id;
			var index = this.getIndexById(id);
			if (this.onDelete != null && this.onDelete != "") {
				var p = this.findParent();
				this.onDelete.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					this.SlideList[index],
					function () {
					}.bind(this)
					, function (e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		getSlideFilename: function(filename) {
			if (filename.includes("__")) {
				filename = filename.substring(filename.indexOf("__") + 2);

				if (filename.includes("__")) {
					filename = filename.substring(filename.indexOf("__") + 2);
				}
			}

			return filename;
		},

		//--------------------------------------------------------------------------------------------
		downloadClicked: function (slide) {
			var id = slide.id;
			var index = this.getIndexById(id);
			if (this.onDownload != null && this.onDownload != "") {
				var p = this.findParent();
				this.onDownload.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					this.SlideList[index],
					function () {
					}.bind(this)
					, function (e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		getIndexById: function (id) {
			for (var i = 0; i < this.SlideList.length; i++) {
				if (this.SlideList[i].id == id) {
					return i;
				}
			}
			return -1;
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
