<template>
    <div 
			:class="['dyna-map', customClasses]"
			v-show="DisplayValues.visible"
			@resize="resizeMap"
		>
			<div class="heading h5">
					{{label}}
			</div>
			<div class="container" ref="mapContainer">
						<img class="map" 
							v-if="DisplayValues.Width > 0"
							:src="'https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/export?bbox=-73.99,41.99,-74,42&bboxSR=4326&size=' + DisplayValues.Width + ',' + DisplayValues.Width*0.5625 + '&dpi=96&f=image&format=png'"
						>
			</div>
			<div class="footer"
				v-html="footer"
			></div>
			{{DisplayValues.Width}}
    </div>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";

export default {
  name: 'MapStaticView',
	
	props: [
			'footer',
			'mapCenter'
		],
	
	mixins: [ baseInputMixin ],

	data () {
		return {


			DisplayValues: {
				visible: this.visible == null ? true : this.visible,
				MapCenter: "-86.3389,41.9464",
				MapZoom: 10,
				Longitude: 0,
				Latitude: 0,
				Width: "0",				
			},
		}
	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {


		//--------------------------------------------------------------------------------------------
		renderMap: function() {
			if (this.$refs.mapContainer) {
				this.DisplayValues.Width = this.$refs.mapContainer == null ? 0 : this.$refs.mapContainer.clientWidth;
			}

		},

		//--------------------------------------------------------------------------------------------
		resizeMap: function() {
			if (this.$refs.mapContainer) {
				var resizePct = Math.abs(this.$refs.mapContainer.clientWidth - this.DisplayValues.Width) / (this.DisplayValues.Width+1);
				if (resizePct > 0.25) {
					this.renderMap();
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {

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
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				this.renderMap();
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
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				this.renderMap();
			} else {
				this.onAfterRenderEvent();
				this.renderMap();
			}
		},


	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------

	created() {
		window.addEventListener("resize", this.resizeMap);
	},

	destroyed() {
		window.removeEventListener("resize", this.resizeMap);
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted: function() {
		this.renderMap();
	},

//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {
	}
}
</script>