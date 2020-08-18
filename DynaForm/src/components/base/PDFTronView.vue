<template>
	<div
		class="object-viewer-component"
		v-if="DisplayValues.visible"
		v-show="!DisplayValues.hidden"
	>

		<div id="object-viewer-container">
				<div id="objectViewer" />
		</div>

		<async-link 
			:href="DisplayValues.url"
			type="callback"
			:callback="function() { loadViewer() }"
			:filename="ObjectFile.filename"
			:title="ObjectFile.title"
			:fileSize="ObjectFile.length"
			:enableAsync="true"
			ref="ViewerAsyncLink"
		></async-link>
	</div>
</template>



<script>

/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";
import validationMixin from "../shared/ValidationMixin.js";
import { IMAGE_PATH } from '../../models/http-common.js';
import ComponentLabel from "../shared/ComponentLabel";
import AsyncLink from "../shared/AsyncLink";

export default {
	name: 'PDFTronView',
		
	components: { 
		ComponentLabel,
		AsyncLink
	},
	
  props: [
		'urlTemplate',
		'filename',
		'viewerFileType',
		'filenameField',
		'titleField',
		'hashField',
		'mimeType',
		'mimeTypeField',
		'fallbackHashField',
		'autoRender',
	],
	
	data () {
		return {
			ObjectFile: {},
			DisplayValues: {
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,
				viewerFileType: this.viewerFileType == null ? "xod" : this.viewerFileType,
				url: null,
				autoRender: this.autoRender == null ? true : this.autoRender,
			},
			RetryTimeout: null,
			RetryCount: 0,
		}
	},

	mixins: [ baseInputMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		renderViewer: function(objectFile=null) {

			//If no object file object specified
			if (objectFile != null) {
				this.ObjectFile = objectFile;
			}

			//Ensure required fields are supplied
			if (this.ObjectFile.hash == null || typeof this.ObjectFile.hash == undefined
					|| this.ObjectFile.mimeType == null || typeof this.ObjectFile.mimeType == undefined
					|| this.ObjectFile.title == null 
					) {
				this.reloadViewer();			
				return;
			}

			//Create URL from template if not already a full url
			if (this.urlTemplate != null) {
				var url = this.urlTemplate;
				url = url.replace("{hash}", this.ObjectFile.hash );
				url = url.replace("{type}", this.ObjectFile.mimeType );
				url = url.replace("{fallback}", this.ObjectFile.fallbackHash );
			} 
			else {
				console.log("Error: Missing urlTemplate.");
			}

			//Async link to url
			if (url != null && url != "") {
				clearTimeout(this.RetryTimeout);
				this.DisplayValues.url = url;
				this.$nextTick(() => {
					this.$refs.ViewerAsyncLink.click(null, this.ObjectFile);
				})
			} 
			else {
				this.reloadViewer();			
				return;
			}
			
		},

		//--------------------------------------------------------------------------------------------
		reloadViewer: function() {
			this.RetryCount++;
			if (this.RetryCount < 20) {
				console.log("ERROR: Failed to load book viewer. Retrying.")
				this.RetryTimeout = setTimeout(() => { 
					this.renderViewer();
				}, 100);
			} 
			else {
					this.showMessageDialog("Error", "Cannot load <strong>" + this.ObjectFile.title + "</strong> after multiple attempts. Please try again later.");
			}
		},

		//--------------------------------------------------------------------------------------------
		loadViewer: function() {
			//Set object data
			window.objectUrl = this.DisplayValues.url;
			window.objectType = this.DisplayValues.viewerFileType;

			//Load Viewer
			if (window.myWebViewer != null) {
				window.myWebViewer.loadDocument(this.DisplayValues.url);
			} 
			else {
				window.loadViewer();
			}
		},

		//--------------------------------------------------------------------------------------------
		closeViewer: function() {
			if (window.myWebViewer != null && window.myWebViewer.instance != null) {
				window.myWebViewer.instance.closeDocument();
			} 
		},


		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {
			//watchedField is the field that changed and triggered this render.

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
					function() {
						this.onAfterRenderEvent();
						if (this.DisplayValues.autoRender == true) this.renderViewer();
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
						this.onAfterRenderEvent();	
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				if (this.DisplayValues.autoRender == true) this.renderViewer();
			} else {
				this.onAfterRenderEvent();				
				if (this.DisplayValues.autoRender == true) this.renderViewer();
			}
		},
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted: function() {
		//Read in filename			
		var p = this.findParent();
		if (this.filenameField != null) {
				this.ObjectFile.filename = p.ActiveFormData[this.filenameField];
		} 
		else {
			this.ObjectFile.filename = this.filename;
		}

		//Read in title
		if (this.titleField != null) {
				this.ObjectFile.title = p.ActiveFormData[this.titleField];
		} 
		else {
			this.ObjectFile.title = this.title;
		}

		//Read in hash
		if (this.hashField != null) {
				this.ObjectFile.hash = p.ActiveFormData[this.hashField];
		} 
		else {
			this.ObjectFile.hash = this.hash;
		}

		//Read in mimeTypeField
		if (this.mimeTypeField != null) {
				this.ObjectFile.mimeType = p.ActiveFormData[this.mimeTypeField];
		} 
		else {
			this.ObjectFile.mimeType = this.mimeType;
		}

		//Read in fallbackHashField
		if (this.fallbackHashField != null) {
				this.ObjectFile.fallbackHash = p.ActiveFormData[this.fallbackHashField];
		} 
		else {
			this.ObjectFile.fallbackHash = this.fallbackHash || "";
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {		
	}

}
</script>