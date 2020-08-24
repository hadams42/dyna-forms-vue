<template>
	<b-form-group 
		:class="['carousel-view', name]"
		v-show="DisplayValues.visible"
	>
		<component-label
			:forId="name"
			:text="DisplayValues.label"
			:helpUrl="helpUrl"
			:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
			:lockMessage="DisplayValues.readonlyMessage"
			:unlockable="!(formReadOnlyLock || readOnlyLock)"
		>
		</component-label>

		<div class="carousel-container row mx-0"
			fluid 
		> 
			<div v-if="SlideList == null || SlideList.length == 0"
			class="empty-results-message"
			>
			{{emptyResultsMessage}}
			</div>

			<div class="carousel-slide image-thumbnail"
				v-for="(slide, index) in SlideList"
				:key="index"
			>
				<div
					:class="['thumbnail-container', slide.id == valueModel ? 'active' : '', LoadingSlides[index] ? 'loading' : '' ]"
				>

						<div class="image-buttons">
							<div class="image-buttons-middle">
									
									<async-link v-if="slide.action.indexOf('view') >= 0 && DisplayValues.showViewButton"
										class="btn btn-secondary btn-sm action-button view-button"
										:href="slide.repoUrl"
										:filename="slide.filename"
										:title="slide.title"
										:enableAsync="false"
										type="callback"
										:callback="function() { viewButtonClick(slide); }"
										:fileSize="slide.length"
										v-html="DisplayValues.viewButtonHtml"
									>
									</async-link>
									
									<async-link v-if="slide.action.indexOf('download') >= 0 && DisplayValues.showDownloadButton"
										class="btn btn-secondary btn-sm action-button download-button"
										:href="slide.repoUrl"
										:filename="slide.filename"
										:title="slide.title"
										:enableAsync="false"
										type="download"
										:fileSize="slide.length"
										v-html="DisplayValues.downloadButtonHtml"
									>
									</async-link>
									
									<b-button v-if="showEditButton"
								 		class="action-button edit-button"
										size="sm"
									 	@click="editButtonClick(slide)"
									>Edit</b-button>	
									
									<b-button v-if="showDeleteButton"
										class="action-button delete-button"
										size="sm"
										@click="deleteButtonClick(slide)"
									>Delete</b-button>	

							</div>
						</div>

					<async-link 
						:href="slide.repoUrl"
						:filename="slide.filename"
						:title="slide.altTitle"
						:class="[DisplayValues.showViewButton ? 'async-view-link' : 'async-download-link']"
						type="callback"
						:callback="function() { selectThumbnail(slide.id); }"
						:onWait="function(tryCount) { beforeThumbnailWait(slide.id, tryCount); }"
						:onAfterWait="function() { afterThumbnailWait(slide.id); }"
						:fileSize="slide.length"
						:enableAsync="DisplayValues.enableAsync"
						:waitMessages="waitMessages"
						:retryMessage="retryMessage"
						ref="ThumbnailAsyncLink"
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

						<div class="image-spinner">
							<div class="image-spinner-middle">
									<b-spinner></b-spinner>
							</div>
						</div>

						<div class="image-caption">
							<div class="image-caption-middle">
								<div class="image-caption-text">
									{{slide.altTitle}}
								</div>
							</div>
						</div>

					</async-link>
				</div>
			</div>
		</div> 

		<b-button class="upload-button"
				v-if="showUploadSlide == true && !(computedReadOnly || DisplayValues.readonly)"
				@click="uploadButtonClick"
			>{{DisplayValues.uploadButtonText}}
		</b-button>

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
	name: 'CarouselView',
		
	components: { 
		ComponentLabel,
		AsyncLink
	},
	
  props: [
		'slides',
		'showDeleteButton',
		'showEditButton',
		'showDownloadButton',
		'showViewButton',
		'showSlideTitle',
		'onEditButtonClick',
		'onDeleteButtonClick',
		'onThumbnailClick',
		'onViewButtonClick',
		'thumbnailWidth',
		'thumbnailHeight',
		'missingImageUrl',
		'urlPrefix',
		'hideTooltip',
		'showCacheIndicator',
		'enableAsync',
		'waitMessages',
		'retryMessage',
		'viewFirstSlide',
		'emptyResultsMessage',
		'downloadButtonHtml',
		'viewButtonHtml',
		'showUploadSlide',
		'onUploadButtonClick',
		'uploadButtonText',
	],
	
	data () {
		return {
			DisplayValues: {				
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				showDeleteButton: this.showDeleteButton == null ? false : this.showDeleteButton,
				showEditButton: this.showEditButton == null ? false : this.showEditButton,
				showDownloadButton: this.showDownloadButton == null ? false : this.showDownloadButton,
				showViewButton: this.showViewButton == null ? false : this.showViewButton,
				showSlideTitle: this.showSlideTitle == null ? false : this.showSlideTitle,
				thumbnailWidth: this.thumbnailWidth == null ? 0 : this.thumbnailWidth,
				thumbnailHeight: this.thumbnailHeight == null ? 0 : this.thumbnailHeight,
				urlPrefix: this.urlPrefix == null ? "" : this.urlPrefix,
				hideTooltip: this.hideTooltip == null ? false : this.hideTooltip,
				enableAsync: this.enableAsync == null ? false : this.enableAsync,
				showCacheIndicator: this.showCacheIndicator == null ? false : this.showCacheIndicator,
				viewFirstSlide: this.viewFirstSlide == null ? false : this.viewFirstSlide,
				downloadButtonHtml: this.downloadButtonHtml == null ? "Download" : this.downloadButtonHtml,
				viewButtonHtml: this.viewButtonHtml == null ? "View" : this.viewButtonHtml,
				uploadButtonText: this.uploadButtonText == null ? "Upload" : this.uploadButtonText,
				rows: -1,
			},
			
			LoadingSlides: [],
			SlideList: this.slides == null ? [] : this.slides,

		}
	},

	mixins: [ baseInputMixin, validationMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {


		//--------------------------------------------------------------------------------------------
		uploadButtonClick(e) {
 			if (this.onUploadButtonClick != null && this.onUploadButtonClick != "") {
				var p = this.findParent(); 
				this.onUploadButtonClick.call(this,
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
		onImageNotFound: function(self, o=null) {
			if (o != null && o.fallbackThumbnailUrl != null && o.fallbackThumbnailUrl != '') {
				self.target.src = o.fallbackThumbnailUrl;
			}
			else {
				self.target.src = this.missingImageUrl;
			}
		},

		//--------------------------------------------------------------------------------------------
		getThumbDimensions: function() {

			if (this.DisplayValues.thumbnailWidth != 0) {
				return { 
					'width': this.DisplayValues.thumbnailWidth + 'px', 
					'max-height': (this.DisplayValues.thumbnailWidth / .66 - 5) + 'px',
				}
			}

			if (this.DisplayValues.thumbnailHeight != 0) {
				return { 
					'height': this.DisplayValues.thumbnailHeight + 'px', 
					'max-width': (this.DisplayValues.thumbnailHeight / .66 - 5) + 'px',
				}
			}

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
		getIndexById: function(id) {
				for (var i=0; i<this.SlideList.length;i++) {
					if (this.SlideList[i].id == id) {
						return i;
					}
				}
		},

		//--------------------------------------------------------------------------------------------
		downloadButtonClick(e) {
			var index = this.getIndexById(this.valueModel);
			this.makeToast(this.SlideList[index].title,"Preparing Download", 2000);
		},

		//--------------------------------------------------------------------------------------------
		editButtonClick(slide) {
 			if (this.onEditButtonClick != null && this.onEditButtonClick != "") {
				var p = this.findParent(); 
				this.onEditButtonClick.call(this,
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
		viewButtonClick(slide) {
			if (this.onViewButtonClick != null && this.onViewButtonClick != "") {
				var p = this.findParent(); 
				this.onViewButtonClick.call(this,
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
		deleteButtonClick(slide) {
 			if (this.onDeleteButtonClick != null && this.onDeleteButtonClick != "") {
				var p = this.findParent(); 
				this.onDeleteButtonClick.call(this,
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
		beforeThumbnailWait(id, tryCount) {
			var index = this.getIndexById(id);
			this.LoadingSlides[index] = true;
			this.$forceUpdate();
		},

		//--------------------------------------------------------------------------------------------
		afterThumbnailWait(id) {
			var index = this.getIndexById(id);
			this.LoadingSlides[index] = false;
			this.$forceUpdate();
		},

		//--------------------------------------------------------------------------------------------
		selectThumbnail(id) {
			this.valueModel = id;
			var index = this.getIndexById(id);
			var slide = this.SlideList[index];
			slide.isInCache = true;
 			if (this.onThumbnailClick != null && this.onThumbnailClick != "") {
				var p = this.findParent(); 
				this.onThumbnailClick.call(this,
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
			//Auto click view if allowed
			if (slide.action.indexOf('view') >= 0) {
			this.viewButtonClick(slide);
			}

		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {
			var index = this.getIndexById(this.valueModel);

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
						}
						else {
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
						} 
						else {
							this.SlideList = [];
						}
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} 
			
			//Else, if no render specified
			else {
				if (this.SlideList != null) {
					this.onAfterRenderEvent(this.SlideList[index]);				
				} 
				else {
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
		if (this.value == null) this.value = -1;
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {		
			
		//--------------------------------------------------------------------------------------------
		valueModel: {
			get () { 
				return this.value;
			},
			set (v) { 
				this.DisplayValues.rows = v;
				this.$emit('change', v);
			},
		},
	}

}
</script>
