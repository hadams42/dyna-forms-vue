<template>
	<b-form-group 
		class="gallery-view "
		v-show="DisplayValues.visible"
	>
		<component-label
			:forId="name"
			:text="DisplayValues.label"
			:helpUrl="helpUrl"
			:locked="DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
			:lockMessage="DisplayValues.readonlyMessage"
			:unlockable="!(formReadOnlyLock || readOnlyLock)"
		>
		</component-label>

		<div class="add-button-container">
			<b-button class="add-button"
					v-if="showAddSlide == true && !(computedReadOnly || DisplayValues.readonly)"
					@click="addButtonClick"
				>{{DisplayValues.addButtonText}}
			</b-button>
		</div>

		<div class="p-1 gallery-container row"
			fluid 
		>
			<div :class="DisplayValues.previewColumnStyle">
				<div class="d-flex flex-wrap gallery-top-container">

					<div class="gallery-slide preview-image"
						v-if="showPreviewSlide == true && valueModel >= 0 && SlideList.length > 0"
					>

						<div v-if="showSlideTitle == true"
							class="image-caption" 
						>
							<div class="image-caption-middle">
								<div class="image-caption-text">
									{{getSlideProperty(valueModel, 'title')}}
								</div>
								<div class="image-caption-subtext">
									{{getSlideProperty(valueModel, 'altTitle')}}
								</div>
							</div>
						</div>

						<async-link 
							:href="getSlideProperty(valueModel, 'repoUrl')"
							type="callback"
							:filename="getSlideProperty(valueModel, 'filename')"
							:title="getSlideProperty(valueModel, 'title')"
							:enableAsync="DisplayValues.enableAsync"
							:callback="function() { previewButtonClick() }"
							:fileSize="getSlideProperty(valueModel, 'length')"
						>
							<img v-if="getSlideProperty(valueModel, 'filename') != null && getSlideProperty(valueModel, 'filename') != ''"
								:style="{'min-width': DisplayValues.previewMinWidth + 'px', 'max-width': DisplayValues.previewMaxWidth == 0 ? '100%' : DisplayValues.previewMaxWidth + 'px', 'max-height': DisplayValues.previewHeight == 0 ? 'unset' : DisplayValues.previewHeight + 'px'}"
								@error="onImageNotFound($event);"
								v-b-tooltip="{title: getSlideProperty(valueModel, 'helpText') || helpText, triggers: 'hover', placement: 'auto' }"								
								:src="DisplayValues.urlPrefix + getSlideProperty(valueModel, 'url')" 
								:disabled="DisplayValues.hideTooltip"
							>

							<img v-if="getSlideProperty(valueModel, 'filename') == null || getSlideProperty(valueModel, 'filename') == ''"
								:style="{'min-width': DisplayValues.previewMinWidth + 'px', 'max-width': DisplayValues.previewMaxWidth == 0 ? '100%' : DisplayValues.previewMaxWidth + 'px', 'max-height': DisplayValues.previewHeight == 0 ? 'unset' : DisplayValues.previewHeight + 'px'}"
								:src="missingImageUrl" 
							>

						</async-link>

						<div class="button-bar">
							
							<async-link v-if="showDownloadButton == true && getSlideProperty(valueModel, 'filename') != null && getSlideProperty(valueModel, 'filename') != '' && getSlideProperty(valueModel, 'action').indexOf('download') >= 0"
								class="btn btn-secondary btn-sm action-button download-button"
								:href="getSlideProperty(valueModel, 'repoUrl')"
								:filename="getSlideProperty(valueModel, 'filename')"
								:title="getSlideProperty(valueModel, 'title')"
								:enableAsync="DisplayValues.enableAsync"
								type="download"
								:fileSize="getSlideProperty(valueModel, 'length')"
								@click="downloadButtonClick"
								ref="downloadButton"
							><i class="fas fa-file-download"></i>
							</async-link>

							<b-button v-if="showUploadButton == true && !(computedReadOnly || DisplayValues.readonly)" 
								class="btn btn-secondary btn-sm action-button upload-button"
								@click="uploadButtonClick"
								ref="uploadButton"
								href="#"
							><i class="fas fa-file-upload"></i></b-button>

							<b-button v-if="showEditButton == true && !(computedReadOnly || DisplayValues.readonly)"
								class="btn btn-secondary btn-sm action-button edit-button"
								@click="editButtonClick"
								ref="editButton"
								href="#"
							><i class="fas fa-pen"></i></b-button>

							<b-button v-if="showDeleteButton == true && getSlideProperty(valueModel, 'filename') != null && getSlideProperty(valueModel, 'filename') != '' && !(computedReadOnly || DisplayValues.readonly) "
								@click="deleteButtonClick"
								ref="deleteButton"
								href="#"
							>Delete
							</b-button>

						</div>
					</div>

				</div>
			</div>
			<div :class="DisplayValues.thumbnailColumnStyle">			
				<div class="d-flex flex-wrap gallery-bottom-container">

					<div class="gallery-slide image-thumbnail"
						v-for="(slide, index) in SlideList"
						:key="index"
					>
						<div
							:class="['thumbnail-container', slide.id === valueModel ? 'active' : '' ]"
						>

							<async-link 
								:href="slide.repoUrl"
								:filename="slide.filename"
								:title="slide.title"
								type="callback"
								:callback="function() { selectThumbnail(slide.id); }"
								:fileSize="slide.length"
								:enableAsync="DisplayValues.enableAsync"
								style="display: inline-block"
							>
								<img class="image"
									:style="getThumbDimensions()"
									:title="slide.altTitle"
									:src="DisplayValues.urlPrefix + slide.url" 
									@error="onImageNotFound($event, slide);"
								>
								<div v-if="slide.isInCache && DisplayValues.showCacheIndicator == true"
									class="corner-ribbon green">
								</div>
								
								<div v-if="showSlideTitle == true"
									class="image-caption"
								>
									<div class="image-caption-middle">
										<div class="image-caption-text">
											{{slide.title}}
										</div>
										<div class="image-caption-subtext">
											{{slide.altTitle}}
										</div>
									</div>
								</div>

							</async-link>
						</div>
					</div>
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
	name: 'GalleryViewOriginal',
		
	components: { 
		ComponentLabel,
		AsyncLink
	},
	
  props: [
		'slides',
		'showPreviewSlide',
		'showDeleteButton',
		'showEditButton',
		'showUploadButton',
		'showDownloadButton',
		'showSlideTitle',
		'showPreviewButton',
		'onEditButtonClick',
		'onUploadButtonClick',
		'onDeleteButtonClick',
		'onThumbnailClick',
		'onPreviewButtonClick',
		'thumbnailWidth',
		'thumbnailHeight',
		'previewMaxWidth',
		'previewMinWidth',
		'previewHeight',
		'missingImageUrl',
		'urlPrefix',
		'showAddSlide',
		'onAddButtonClick',
		'addButtonText',
		'thumbnailColumnStyle',
		'previewColumnStyle',
		'hideTooltip',
		'enableAsync',
		'showCacheIndicator',
	],
	
	data () {
		return {
			DisplayValues: {				
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				showDeleteButton: this.showDeleteButton == null ? false : this.showDeleteButton,
				showEditButton: this.showEditButton == null ? false : this.showEditButton,
				showUploadButton: this.showUploadButton == null ? false : this.showUploadButton,
				showDownloadButton: this.showDownloadButton == null ? false : this.showDownloadButton,
				showPreviewButton: this.showPreviewButton == null ? false : this.showPreviewButton,
				showSlideTitle: this.showSlideTitle == null ? false : this.showSlideTitle,
				thumbnailWidth: this.thumbnailWidth == null ? 0 : this.thumbnailWidth,
				thumbnailHeight: this.thumbnailHeight == null ? 0 : this.thumbnailHeight,
				previewMaxWidth: this.previewMaxWidth == null ? 0 : this.previewMaxWidth,
				previewMinWidth: this.previewMinWidth == null ? 0 : this.previewMinWidth,
				previewHeight: this.previewHeight == null ? 0 : this.previewHeight,
				urlPrefix: this.urlPrefix == null ? "" : this.urlPrefix,
				thumbnailColumnStyle: this.thumbnailColumnStyle == null ? "col-12" : this.thumbnailColumnStyle,
				previewColumnStyle: this.previewColumnStyle == null ? "col-12" : this.previewColumnStyle,
				hideTooltip: this.hideTooltip == null ? false : this.hideTooltip,
				enableAsync: this.enableAsync == null ? false : this.enableAsync,
				showCacheIndicator: this.showCacheIndicator == null ? false : this.showCacheIndicator,
				addButtonText: this.addButtonText == null ? "Add" : this.addButtonText,
				rows: -1,
			},
			
			SlideList: this.slides == null ? [] : this.slides,

		}
	},

	mixins: [ baseInputMixin, validationMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		onImageNotFound: function(self, o=null) {
			if (o != null && o.fallbackThumbnailUrl != null && o.fallbackThumbnailUrl != '') {
				self.target.src = o.fallbackThumbnailUrl;
			}
			else {
				self.target.src = this.missingImageUrl;
			}
		},

		//--------------------------------------------------------------------------------------------
		getThumbDimensions: function(widthHeightOrBoth) {
			widthHeightOrBoth = widthHeightOrBoth == null ? "both" : widthHeightOrBoth;

			var result = {};
			if (this.DisplayValues.thumbnailWidth != 0) {
				if (widthHeightOrBoth == "width" || widthHeightOrBoth == "both") {
					result["max-width"] = this.DisplayValues.thumbnailWidth + 'px';
				}
				if (widthHeightOrBoth == "height" || widthHeightOrBoth == "both") {
					result["height"] = (this.DisplayValues.thumbnailWidth / .66 - 5) + 'px';
				}
			}
			else if (this.DisplayValues.thumbnailHeight != 0) {
				if (widthHeightOrBoth == "width" || widthHeightOrBoth == "both") {
					result["max-width"] = (this.DisplayValues.thumbnailHeight / .66 - 5) + 'px';
				}
				if (widthHeightOrBoth == "height" || widthHeightOrBoth == "both") {
					result["max-height"] = this.DisplayValues.thumbnailHeight + 'px';
				}
			}

			return result;
		},

		//--------------------------------------------------------------------------------------------
		getSlideProperty: function(id, key) {
			if (this.SlideList != null && this.SlideList.length > 0) {
				for (var i=0; i<this.SlideList.length;i++) {
					if (this.SlideList[i].id == id) {
						return this.SlideList[i][key];
					}
				}
			} else {
				return null;
			}
		},

		//--------------------------------------------------------------------------------------------
		refresh: function() {
			this.renderField();
			this.valueModel = this.value;
			this.$forceUpdate();
		},

		//--------------------------------------------------------------------------------------------
		goToFirstSlide: function() {
			this.$nextTick(function() {
				this.renderField();
				this.$forceUpdate();
			});
		},

		//--------------------------------------------------------------------------------------------
		getIndexById: function(id) {
				for (var i=0; i<this.SlideList.length;i++) {
					if (this.SlideList[i].id == id) {
						return i;
					}
				}
				return -1;
		},

		//--------------------------------------------------------------------------------------------
		previewButtonClick(e) {			
			var index = this.getIndexById(this.valueModel);
			var slide = {};
			if (index > -1) {
				slide = this.SlideList[index];
			} 
			if (this.onPreviewButtonClick != null && this.onPreviewButtonClick != "") {
				var p = this.findParent(); 
				this.onPreviewButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					slide,
					function() {
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		downloadButtonClick(e) {
			var index = this.getIndexById(this.valueModel);
			this.makeToast(this.SlideList[index].title,"Preparing Download", 2000);
		},

		//--------------------------------------------------------------------------------------------
		uploadButtonClick(id, e) {
			var index = this.getIndexById(id);
 			if (this.onUploadButtonClick != null && this.onUploadButtonClick != "") {
				var p = this.findParent(); 
				this.onUploadButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					this.SlideList[index],
					function() {
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		editButtonClick(id, e) {
			if (id == null) id = this.valueModel;
			var index = this.getIndexById(id);
 			if (this.onEditButtonClick != null && this.onEditButtonClick != "") {
				var p = this.findParent(); 
				this.onEditButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					this.SlideList[index],
					function() {
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		deleteButtonClick(id, e) {
			var index = this.getIndexById(id);
 			if (this.onDeleteButtonClick != null && this.onDeleteButtonClick != "") {
				var p = this.findParent(); 
				this.onDeleteButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					this.SlideList[index],
					function() {
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		addButtonClick(e) {
 			if (this.onAddButtonClick != null && this.onAddButtonClick != "") {
				var p = this.findParent(); 
				this.onAddButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function() {
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		selectThumbnail(id) {
			var index = this.getIndexById(id);
			this.SlideList[index].isInCache = true;
			this.valueModel = id;
 			if (this.onThumbnailClick != null && this.onThumbnailClick != "") {
				var p = this.findParent(); 
				this.onThumbnailClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					this.SlideList[index],
					function() {
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {
			//watchedField is the field that changed and triggered this render.
			var index = this.getIndexById(this.valueModel);

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
					function(data) {
						this.SlideList = this.DisplayValues.objectFiles;
						if (this.SlideList != null) {
							this.onAfterRenderEvent(this.SlideList[index]);				
						} else {
							this.SlideList = [];
						}						
					}.bind(this)
					,function(e) {
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
					function() {
						//Success code here
						if (this.SlideList != null) {
							this.onAfterRenderEvent(this.SlideList[index]);				
						} else {
							this.SlideList = [];
						}
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} else {
				if (this.SlideList != null) {
					this.onAfterRenderEvent(this.SlideList[index]);				
				} else {
					this.SlideList = [];
				}
			}
		},
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted () {
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
			
		//--------------------------------------------------------------------------------------------
		valueModel: {
			get () { 
				return (!this.value) ? 0 : this.value 
			},
			set (v) { 
				this.DisplayValues.rows = v;
				this.$emit('change', v);
			},
		},
	}

}
</script>
