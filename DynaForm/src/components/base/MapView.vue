<template>
    <div 
			:class="['dyna-map map-view', customClasses, name]"
			v-show="DisplayValues.visible"
		>
			
			<div class="map-heading">
					{{label}}
			</div>
			
			<div class="map-container">
					<div id="map-container" class="map"></div>
			</div>
			
			<div class="map-footer"
				v-html="footer"
			></div>

			<div v-show="DisplayValues.ActivePoint.Latitude != null"
				class="badge" 
				id="lat-lon-widget"
			>
				<div style="cursor: default"
				>
					Lat: {{Math.round(DisplayValues.ActivePoint.Latitude*10000)/10000}} Long: {{Math.round(DisplayValues.ActivePoint.Longitude*10000)/10000}} 
					<span
						style="cursor: pointer"
						@click="copyPointToClipboard"
					>
						<i class="far fa-copy"></i>
					</span>
				</div>
			</div>

			<div>				
				<!-- {{DisplayValues.ActivePoint}}
				{{DisplayValues.CenterLongitude}} - {{DisplayValues.CenterLatitude}}
				{{DisplayValues.BoundingBox}} -->
			</div>

    </div>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";
import { loadModules } from "esri-loader";

export default {
  name: 'MapView',
	
	props: [
			'footer',
			'center',
			'centerField',
			'minLatField',
      'maxLatField',
      'minLngField',
      'maxLngField',
			'minLat',
      'maxLat',
      'minLng',
      'maxLng',
			'zoom',
			'baseMap',
			'disableWheel',
			'initialPoint',
			'longitudeField',
			'latitudeField',
		],
	
	mixins: [ baseInputMixin ],

	data () {
		return {

			DisplayValues: {
				visible: this.visible == null ? true : this.visible,
				DisableWheel: this.disableWheel == null ? true : this.disableWheel,
				CenterLongitude: 20,
				CenterLatitude: 30,
				BoundingBox: {
					MinLat: null,
					MaxLat: null,
					MinLng: null,
					MaxLng: null,
				},
				MapZoom: this.zoom || 10,
				BaseMap: this.baseMap == null ? "topo" : this.baseMap,
				ActivePoint: {
					Longitude: null,
					Latitude: null,
					Attributes: [],
				},
			},
		}
	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		copyPointToClipboard: function() {
			var s = this.DisplayValues.ActivePoint.Latitude + "," + this.DisplayValues.ActivePoint.Longitude;
			this.Utilities.CopyToClipboard(s);
			this.makeToast("Success","Copied location to clipboard", 2000);	
		},

		//--------------------------------------------------------------------------------------------
		renderMap: function() {
			const options = {
        url: "https://js.arcgis.com/4.13/"
			};

			loadModules(
				[
					"esri/Map",
	        "esri/Graphic",
					"esri/views/MapView",
					"esri/layers/FeatureLayer",
					"esri/geometry/geometryEngine",
					"esri/geometry/Point",				
					"esri/layers/Layer",
					"dojo/domReady!"
				], 
				options
			).then(([
						Map, 
						Graphic,
						MapView,
						FeatureLayer,
						geometryEngine,
						Point, 
						Layer
				]) => {
			
				var self = this;
				let pushPinLayerView;
				const map_container = document.getElementsByClassName("map-container")[0];			
				setCursor("default");

				//-------------------------------------------------------
				//Create a map
				//-------------------------------------------------------
				var map = new Map({
						basemap: self.DisplayValues.BaseMap,
				});

				//-------------------------------------------------------
				//Create a map view
				//-------------------------------------------------------
				var view = new MapView({
						container: "map-container",
						map: map,
						//zoom: self.DisplayValues.MapZoom,
						//center: [ self.DisplayValues.Longitude, self.DisplayValues.Latitude ],
				});

				//Set extent by bounding box if defined
				if (self.DisplayValues.BoundingBox.MinLat != null && self.DisplayValues.BoundingBox.MaxLat != null && self.DisplayValues.BoundingBox.MinLng != null && self.DisplayValues.BoundingBox.MaxLng != null) {
					view.extent = {
						ymin: self.DisplayValues.BoundingBox.MinLat,
						ymax: self.DisplayValues.BoundingBox.MaxLat,
						xmin: self.DisplayValues.BoundingBox.MinLng,
						xmax: self.DisplayValues.BoundingBox.MaxLng,
					};
				}
				//Else, set extent via center 
				else {
					view.zoom = self.DisplayValues.MapZoom;
					view.center = [ self.DisplayValues.CenterLongitude, self.DisplayValues.CenterLatitude];
				}

				//-------------------------------------------------------
				//Pushpin Feature layer
				//-------------------------------------------------------
				var pushPinLayer = new FeatureLayer({
					source: [
							new Graphic(
								{
									geometry: new Point({
										x: 0,
										y: 0,
									}),
									attributes: {
										id: 0,
										visible: "false"
									}
								})
						],
					objectIdField: "id",
					fields: [
						{
							name: "id",
							type: "integer"
						},
						{
							name: "visible",
							type: "string"
						}
					],
					renderer: {
						type: "simple",
						symbol: {
							type: "text",
							color: "#7A003C",
							text: "\ue61d",
							font: {
								size: 20,
								family: "CalciteWebCoreIcons",
								//weight: "bold",
							}
						}
					}
				});

				//-------------------------------------------------------
				function addPushPinLayer() {
					view.map.add(pushPinLayer);
					
				 	view.whenLayerView(pushPinLayer).then(function(layerView) {
						layerView.filter = {
            	where: "visible = 'true'"
          	};
					})
					.catch(function(error) {
						console.log("ERROR: Cannot read PushPinLayerView.")
					});
				}
				
				//Function to update active point
				//-------------------------------------------------------
				function updateActivePoint(lat, lng) {
					self.DisplayValues.ActivePoint.Longitude = lng;
					self.DisplayValues.ActivePoint.Latitude = lat;
					pushPinLayer.applyEdits({
						addFeatures: [
							new Graphic({
								visible: true,
								geometry: new Point({
									x: self.DisplayValues.ActivePoint.Longitude,
									y: self.DisplayValues.ActivePoint.Latitude,
								}),
								attributes: {
									visible: "true",
									id: 0,
								}
							})
						]
					});
					self.valueModel = self.DisplayValues.ActivePoint;
				}				

				//-------------------------------------------------------
				//Configure view
				//-------------------------------------------------------
				view.ui.add("lat-lon-widget", "bottom-left" );
				view.when().then(addPushPinLayer);

				//Set mousewheel action 
				//-------------------------------------------------------
				if (self.DisplayValues.DisableWheel == true) {
					view.surface.addEventListener("wheel", function(event) {   
						event.stopImmediatePropagation();  
					}, true);  
				}

				//Set cursor style
				//-------------------------------------------------------
				function setCursor(c) {
					try {
						map_container.style.cursor = c;
					} catch (e) {}
				}


				//Update initial point if needed
				//-------------------------------------------------------
				if (self.DisplayValues.ActivePoint.Latitude != 0 && self.DisplayValues.ActivePoint.Longitude != 0 && self.DisplayValues.ActivePoint.Latitude != null && self.DisplayValues.ActivePoint.Longitude != null) {
					updateActivePoint.call(this, self.DisplayValues.ActivePoint.Latitude, self.DisplayValues.ActivePoint.Longitude);
				}

			});
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
						this.renderMap();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
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
	created: function() {
		var p = this.findParent();
		//Initial point
		if (this.initialPoint != null) {
			this.DisplayValues.ActivePoint.Latitude = this.initialPoint.latitude == null ? 0 : this.initialPoint.latitude;
			this.DisplayValues.ActivePoint.Longitude = this.initialPoint.longitude == null ? 0 : this.initialPoint.longitude;
			this.DisplayValues.CenterLatitude = this.DisplayValues.ActivePoint.Latitude;
			this.DisplayValues.CenterLongitude = this.DisplayValues.ActivePoint.Longitude;
		}
		else {
			//If center is defined
			if (this.center != null && this.center != "") {
				this.DisplayValues.CenterLongitude = this.center.split(",")[0];
				this.DisplayValues.CenterLatitude = this.center.split(",")[1];
			} 
			else if (this.centerField != null) {
				this.DisplayValues.CenterLongitude = p.ActiveFormData[this.centerField].split(",")[0];
				this.DisplayValues.CenterLatitude = p.ActiveFormData[this.centerField].split(",")[1];
			}
			else {
				this.DisplayValues.CenterLongitude = 20;
				this.DisplayValues.CenterLatitude = 30;
			}

			//If bounding box is defined
			if (this.minLat != null) {
				this.DisplayValues.BoundingBox.MinLat = this.minLat;
				this.DisplayValues.BoundingBox.MaxLat = this.maxLat;
				this.DisplayValues.BoundingBox.MinLng = this.minLng;
				this.DisplayValues.BoundingBox.MaxLng = this.maxLng;
			}
			//If bounding box should be read from form fields
			else if (this.minLatField != null) {
				this.DisplayValues.BoundingBox.MinLat = p.ActiveFormData[this.minLatField];
				this.DisplayValues.BoundingBox.MaxLat = p.ActiveFormData[this.maxLatField];
				this.DisplayValues.BoundingBox.MinLng = p.ActiveFormData[this.minLngField];
				this.DisplayValues.BoundingBox.MaxLng = p.ActiveFormData[this.maxLngField];
			}

			//If lon/lat are specified as field values
			if (this.longitudeField != null && this.latitudeField != null) {
					this.DisplayValues.ActivePoint.Longitude = p.ActiveFormData[this.longitudeField];
					this.DisplayValues.ActivePoint.Latitude = p.ActiveFormData[this.latitudeField];

			}



		}

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted: function() {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {
		valueModel: {
			get () { return (!this.value) ? [] : this.value },
			set (v) { this.$emit('change', v) },
		},

	}

}
</script>