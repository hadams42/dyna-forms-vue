<template>
<div>
  <div class="dyna-content">
		<div v-html="ActiveHtml"></div>
	</div>
</div>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */
import { Utilities } from "../Utilities.js"
import axios from 'axios';
import { HTTP_CONFIG, BASE_API_SERVER } from '../models/http-common.js';

export default {
  name: "DynaContent",
	
	components: {  },
	
	props: [
		"settings",
		"name",
		"instanceId",
		"data",
		"guid",
		"targets"
	],

  data() {
    return {
			Utilities: new Utilities(),
			//ServerInterface: new ServerInterface(),
			ActiveSettings: this.settings || {},
			ActiveHtml: "",
			ActiveContentData: this.data || {},
			ContentId: Math.random().toString(36).substr(2, 9),
    };
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
  methods: {

		//===================================================================================================
		// EVENT HANDLERS
		//===================================================================================================

		LoadEvent: function() {
			if (this.ActiveSettings != null && this.ActiveSettings.onContentLoad != null && this.ActiveSettings.onContentLoad != "") {
				this.ActiveSettings.onContentLoad.call(this,
					function() {
					}.bind(this),
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);

				//Show flash protected content (disabled since forms should cover this function)
				//this.Utilities.FlashProtect();

			}			
		},

		RenderEvent: function() {
			if (this.ActiveSettings != null && this.ActiveSettings.onContentRender != null && this.ActiveSettings.onContentRender != "") {
				this.ActiveSettings.onContentRender.call(this,
					function() {
					}.bind(this),
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}			
		},

		//===================================================================================================
		// COMPONENT RENDERING METHODS
		//===================================================================================================

		RenderView: function() {
			//Show static HTML if defined
			if (this.settings.html != null && this.settings.html != "") {
				this.ActiveHtml = this.settings.html;
			
			//Else, if a DOM element is specified
			} else if (this.settings.domElement != null && this.settings.domElement != "") {
				var e =  document.getElementById(this.settings.domElement.replace("#",""));
				if (e != null) {
					this.ActiveHtml = e.outerHTML;
				}
				
			//Else, load HTML via AJAX
			} else if (this.activeUrl != null) {
				this.CallAjax.call(this).then(function(responseHtml) {
					this.ActiveHtml = responseHtml;
					this.RenderEvent();
				}.bind(this))
				.catch(function(e) {
					console.log("Failed to retrieve AJAX content", e);
				}.bind(this));	
			}
		},

		CallAjax: function() {
			return new Promise((resolve, reject) => {
				axios.get(this.activeUrl, null, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}
				})
				.catch(e => {
					//this.HttpErrors.push(e);
					reject(e);
				})
			});
		}
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	mounted: function() {
		this.$forceUpdate();
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	created: function() {

		this.LoadEvent();

		//Render view unless auto render is false
		//if (this.ActiveSettings.autoLoad != false) {
			this.RenderView();
		//}
		
	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	watch: {
		activeUrl: function(val) {
		},

		guid: function(val) {
			//Re-render when content guid changes. Guid changes when the container switches out content or
			//forms for another one 
			//if (this.ActiveSettings.autoLoad != false) {			
				this.RenderView();
			//}
		}
	},


	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	computed: {
		activeUrl: function() {
			return this.settings.url;
		}
	},
	
};
</script>

