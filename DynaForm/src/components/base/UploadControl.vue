<template>
  <b-form-group
		v-if="DisplayValues.visible && computedReadOnly == false"
	>
		<component-label
			:forId="name"
			:text="DisplayValues.label"
			:helpText="helpText"
			:helpUrl="helpUrl"
			:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
			:lockMessage="DisplayValues.readonlyMessage"
			:isAdmin="this.isAdmin"
			:adminUnlockable="this.adminUnlockable"
			@locked="onLockToggle()"
			:unlockable="!(formReadOnlyLock || readOnlyLock)"
		>
		</component-label>

		<div 		
			class="upload-control"
			:style="Validation.Status > 0 ? 'border-color: red' : ''"
		>
			<form 
				ref="fileform" 
				class="drag-drop-target" 				
				style="text-align: center; margin: auto"
			>

				<label 
					class="drop-files-label h4 mt-3"
					v-show="computedReadOnly == false"
				>
					{{getDropZoneLabel()}}
					<p>
					<div v-if="allowMultiple" class="mt-2 btn btn-light btn-sm">Click to Browse</div>
					<div v-if="!allowMultiple" class="mt-2 btn btn-light btn-sm">Click to Browse</div>
					<input 
						type="file" 
						accept="image/*"
						style="display: none"
						:multiple="allowMultiple"
						class="input-file"
						@change="fileChangeEvent"
					>
				</label>

				<b-button 
					type="button" 
					variant="primary"
					size="sm"
					class="submit-button float-right mr-2" 
					style="margin-top: .75rem"
					v-on:click="submitFiles()" 
					v-show="files.length > 0 && DisplayValues.autoUpload == false"
				>Upload
				</b-button>
				<b-list-group>

					<b-list-group-item 
						v-for="(file, key) in files" 
						class="file-listing"
						:key="key"
					>

						<img 
							class="float-left pr-2" 
							style="height: 25px" 
							v-bind:ref="'preview'+parseInt( key )"
							v-if="isFileImage(file.name)"
						/>
						<i
							v-if="!isFileImage(file.name)"
							class="far fa-file float-left pr-2"
							v-bind:ref="'preview'+parseInt( key )"
							style="font-size: 25px"
						></i>
						{{ file.name }}

						<b-link 
							class="remove float-right" 
							v-on:click="removeFile( key )"
						>Remove</b-link>

						<b-badge 
							class="mx-2"
							:variant="getFileStatusVariant(file)"
							style="font-size: 9pt; font-weight: normal; letter-spacing: 0.5px "
						>{{ formatWithCommas(Math.round(file.size/1024)) }}k</b-badge>
					</b-list-group-item>

				</b-list-group> 

			</form>

			<b-progress 
				:max="100" 
				:value="ProgressIndicators.UploadPercentage"
				striped
				style="border-radius: 0;"
			>
			</b-progress>
		</div>
		<b-form-input 
				:id="name+'_validator'"
				type="text"
				:state="validationState"
				:name="name+'_validator'"
				:value="value"
				style="display: none"
		></b-form-input>
		<b-form-invalid-feedback>
			<ul
				v-if="this.Validation.Status  > 0 && this.Validation.MessageList.length > 0"
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
		</b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */
import axios from 'axios'
import baseInputMixin from "../shared/BaseInputMixin.js";
import validationMixin from "../shared/ValidationMixin.js";

import { ServerInterface } from "../../ServerInterface.js";
import { HTTP_CONFIG, BASE_API_SERVER } from '../../models/http-common.js';
import ComponentLabel from "../shared/ComponentLabel";

export default {
	name: 'UploadControl',
	
	components: { ComponentLabel },
	
	props: [
		'allowMultiple',
		'dropZoneLabel',
		'clearUploadQueue',
		'onFileUpload',
		'onFileUploadError',
		'showSuccessMessage',
		'accept',
		'autoUpload'
	],

	data() {
		return {

			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				disabled: this.disabled == null ? false : this.disabled,				
				autoUpload: this.autoUpload == null ? false : this.autoUpload,
				accept: this.accept == null ? null : this.accept,
			},

			ProgressIndicators: {
				UploadPercentage: 0,
				Size: 0,
				Loaded: 0

			},

			dragAndDropCapable: false,
			files: [],
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mixins: [ baseInputMixin, validationMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		fileUploadEvent: function() {
			if (this.onFileUpload != null && this.onFileUpload != "") {
				var p = this.findParent(); 
				this.onFileUpload.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//--------------------------------------------------------------------------------------------
		fileUploadErrorEvent: function() {
			if (this.onFileUploadError != null && this.onFileUploadError != "") {
				var p = this.findParent(); 
				this.onFileUploadError.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//--------------------------------------------------------------------------------------------
		fileChangeEvent: function(e) {
			this.files = e.target.files;
			if (this.DisplayValues.autoUpload) this.submitFiles();
		},

		//--------------------------------------------------------------------------------------------
		clearFileList: function() {
			this.files = [];
			this.ProgressIndicators.UploadPercentage = 0;
		},

		//--------------------------------------------------------------------------------------------
		getDropZoneLabel: function() {
			if (this.allowMultiple) {
				return this.dropZoneLabel == null ? "Drag and drop files here" : this.dropZoneLabel;
			} 
			else {
				return this.dropZoneLabel == null ? "Click to Browse" : this.dropZoneLabel;
			}
		},

		//--------------------------------------------------------------------------------------------
		getFileStatusVariant: function(file) {
			if (file.status == 'success') {
				return 'success';
			}
			else if (file.status == 'error') {
				return 'warning';
			}
			else {
				return 'secondary';
			}
		},

		//--------------------------------------------------------------------------------------------
		formatWithCommas: function(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		//--------------------------------------------------------------------------------------------
		isFileImage: function(fileName) {
			return ( /\.(jpe?g|png|gif)$/i.test( fileName ) ) ? true : false;
		},

		//--------------------------------------------------------------------------------------------
		determineDragAndDropCapable: function() {
			var div = document.createElement('div');
			return ( ( 'draggable' in div )
							|| ( 'ondragstart' in div && 'ondrop' in div ) )
							&& 'FormData' in window
							&& 'FileReader' in window;
		},

		//--------------------------------------------------------------------------------------------
		getImagePreviews: function() {
			for( let i = 0; i < this.files.length; i++ ) {
				//If this is an image file, show a preview image
				if ( /\.(jpe?g|png|gif)$/i.test( this.files[i].name ) ) {
					let reader = new FileReader();
					reader.addEventListener("load", function() {
						this.$refs['preview'+parseInt( i )][0].src = reader.result;
					}.bind(this), false);
					reader.readAsDataURL( this.files[i] );
				} 
				//Else, if not an image, show a generic icon
				else {
					this.$nextTick(function() {
						this.$refs['preview'+parseInt( i )][0].src = '/images/file.png';
					});
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		submitFiles: function() {
			this.ProgressIndicators.UploadPercentage = 1;

			let formData = new FormData();

			var p = this.findParent(); 
			let fieldData = {
				display: null,
				data: p.ActiveFormData
			}

			const fieldDataJson = JSON.stringify(fieldData);
			const fieldDataBlob = new Blob([fieldDataJson], {
  			type: 'application/json'
			});

			//Append field data json object
			formData.append("_data", fieldDataBlob);

			//Append files to upload
			for( var i = 0; i < this.files.length; i++ ) {
				let file = this.files[i];
				formData.append('files[' + i + ']', file);
			}

			axios.post(
				BASE_API_SERVER() + "/api/form-binder/upload-files/" + this.instanceId + "/" + this.name,
				formData, 
				{ headers: { 'Content-Type': 'multipart/form-data' },
					onUploadProgress: function( progressEvent ) {
						this.ProgressIndicators.UploadPercentage = parseInt( Math.round( ( progressEvent.loaded * 100 ) / progressEvent.total ) );
						this.ProgressIndicators.Size = progressEvent.total;
						this.ProgressIndicators.Loaded = progressEvent.loaded;
					}.bind(this)
				}
			).then(function(uploadResults) {
				if (this.showSuccessMessage != false) {
					var statusTitle = uploadResults.data.success == true ? "Success" : "Error";
					var statusMessage = uploadResults.data.success == true ? "Files uploaded successfully" : uploadResults.data.message;
					this.showMessageDialog(statusTitle, statusMessage, function() {
						this.handleUploadResult(uploadResults.data.success, uploadResults.data.data);
					}.bind(this));
				} 
				else {
					this.handleUploadResult(uploadResults.data.success, uploadResults.data.data);
				}
			}.bind(this))
			.catch(function(e) {
				console.log("ERROR: Failed to upload file(s). " + e);
					this.showMessageDialog("Error","Unable to upload files.<br><br>[" + e + "]",function() {
						if (!this.clearUploadQueue != true) {
							this.clearFileList();
						}
					this.fileUploadErrorEvent();
					this.$emit('change', null);
				}.bind(this));
			}.bind(this));
		},

		//--------------------------------------------------------------------------------------------
		handleUploadResult: function(success, data) {
			if (success == true) {
				if (!this.clearUploadQueue != true) this.clearFileList();
				this.fileUploadEvent();
				this.$emit('change', data);
			} 
			else {
				this.fileUploadErrorEvent();
				this.$emit('change', null);
			}
		},

		//--------------------------------------------------------------------------------------------
		removeFile: function(key) {
			this.files.splice( key, 1 );
		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {

			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				if (this.onRender != null && this.onRender != "") {
					console.log("WARNING: Local event 'onRender' ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				console.log("enableServerRender not implemented");
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
		disablePageDragover: function() {
			window.addEventListener("dragover",function(e) {
				e = e || event;
				e.preventDefault();
			},false);
			window.addEventListener("drop",function(e) {
				e = e || event;
				e.preventDefault();
			},false);
		}

	},
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
		this.disablePageDragover();
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted() {
		if (this.DisplayValues.visible == false || this.computedReadOnly == true) return;

		this.dragAndDropCapable = this.determineDragAndDropCapable();

		if( this.dragAndDropCapable ) {
			['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach( function( evt ) {
				this.$refs.fileform.addEventListener(evt, function(e) {
					e.preventDefault();
					e.stopPropagation();
				}.bind(this), false);
			}.bind(this));

			this.$refs.fileform.addEventListener('drop', function(e) {
				//Capture the files from the drop event and add them to our local files array.
				//If mulitple upload is enabled
				if (this.allowMultiple != false) {
					for( let i = 0; i < e.dataTransfer.files.length; i++ ) {
						this.files.push( e.dataTransfer.files[i] );
						this.getImagePreviews();
					}
				}
				//Else if single upload is enabled
				else {
					if (e.dataTransfer.files.length > 0) {
						this.files = [ e.dataTransfer.files[0] ];
						this.getImagePreviews();
					}
				}
			}.bind(this));
		}
	},

}
</script>