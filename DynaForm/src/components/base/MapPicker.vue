<template>
    <div 
			:class="['dyna-map map-picker', customClasses, name]"
			v-show="DisplayValues.visible"
		>
			<component-label
				:forId="name"
				:text="label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:kpiText="kpiText"
				:kpiTitle="kpiTitle"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				@locked="onLockToggle()"				
				:isAdmin="this.isAdmin"
				:adminUnlockable="this.adminUnlockable"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
			>
			</component-label>

			<div class="map-heading">
					<div id="search-widget"
					></div>
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
			
			<!-- <div>				
				{{DisplayValues.ActivePoint}}
				{{DisplayValues.CenterLongitude}} - {{DisplayValues.CenterLatitude}}
				{{DisplayValues.BoundingBox}} 
			</div> -->

    </div>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import validationMixin from "../shared/ValidationMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import { loadModules } from "esri-loader";
import ComponentLabel from "../shared/ComponentLabel";
import { Utilities } from '../../Utilities';

export default {
  name: 'MapPicker',
	
	components: { ComponentLabel },

	props: [
			'label',
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
			'placeholder',
			'zoom',
			'maxRows',
			'baseMap',
			'disableWheel',
			'extentKm',
			'filterQuery',
			'apiUrl',
			'featureLayers',
			'initialPoint',
			'longitudeField',
			'latitudeField',
			'confirmChanges',
			'confirmationMessage',
			'onValidateResult',
			'invalidResultMessage',
			'onGetFilterQuery'
		],
	
	mixins: [ baseInputMixin, validationMixin ],

	data () {
		return {

			DisplayValues: {
				ConfirmChanges: this.confirmChanges == null ? true : this.confirmChanges,
				ConfirmationMessage: "Do you wish to add or change this location?",
				Placeholder: this.placeholder == null ? "Enter search keywords": this.placeholder,
				visible: this.visible == null ? true : this.visible,
				FeatureLayers: this.featureLayers == null ? [] : this.featureLayers,
				DisableWheel: this.disableWheel == null ? true : this.disableWheel,
				ApiUrl: this.apiUrl, // == null ? "https://api-adresse.data.gouv.fr/search" : this.apiUrl, 
				//FilterQuery: this.filterQuery == null ? "" : this.filterQuery, 
				CenterLongitude: 20,
				CenterLatitude: 30,
				BoundingBox: {
					MinLat: null,
					MaxLat: null,
					MinLng: null,
					MaxLng: null,
				},
				MapZoom: this.zoom || 10,
				MaxRows: this.maxRows == null ? 6 : this.maxRows,
				ExtentKm: this.extentKm == null ? 10 : this.extentKm,
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
		getFilterQuery: function() {
			var result = null;
			if (this.onGetFilterQuery != null && this.onGetFilterQuery != "") {
				var p = this.findParent(); 
				result = this.onGetFilterQuery.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} 
			else {
				result = this.filterQuery;
			}			

			return result == null ? "" : result;

		},

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

			loadModules([
	        //"esri/tasks/Locator",
					"esri/Map",
					"esri/Color",
	        "esri/Graphic",
	        "esri/request",
					"esri/views/MapView",
	        "esri/layers/FeatureLayer",
					"esri/widgets/Search",
        	"esri/widgets/Search/SearchSource",					
					"esri/geometry/geometryEngine",
					"esri/geometry/Point",
					"esri/layers/Layer",
					"dojo/domReady!"					
				], 
				options
			).then(([
					Map, 
					Color,
        	Graphic,					
        	esriRequest,
					MapView, 
					FeatureLayer, 
					Search, 
					SearchSource, 
					geometryEngine,
					Point,
					Layer 
			]) => {
				
				var self = this;
				let pushPinLayerView;
				const map_container = document.getElementsByClassName("map-container")[0];			
				setCursor("crosshair");

				//-------------------------------------------------------
				//Create a map
				//-------------------------------------------------------
				var map = new Map({
					basemap: this.DisplayValues.BaseMap,
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
					view.zoom = this.DisplayValues.MapZoom;
					view.center = [ this.DisplayValues.CenterLongitude, this.DisplayValues.CenterLatitude];
				}

				//-------------------------------------------------------
				//Custom Search Source
				//-------------------------------------------------------
				var customSearchSource = new SearchSource({
          placeholder: self.DisplayValues.Placeholder,
					//-------------------------------------------------------
          getSuggestions: function(params) {
						try {
							return esriRequest(self.DisplayValues.ApiUrl + "/city-search", { query: {
								k: params.suggestTerm, //.replace(/ /g, "+"),
								l: self.DisplayValues.MaxRows, 
								f: self.getFilterQuery(),
							},
								responseType: "json"
							}).then(function(results) {
								// Return Suggestion results to display
								// in the Search widget
								var r = results.data.response.docs.map(function(doc) {
									return {
										key: doc.objectid,
										text: (doc.city ? doc.city : "") + (doc.admin_name && doc.admin_name != doc.city ? (", " + doc.admin_name) : "") + (doc.country ? (", " + doc.country) : ""),
										//text: (doc.city ? doc.city : "") + (doc.country ? (", " + doc.country) : ""),
										sourceIndex: params.sourceIndex
									};
								});
								return r;
							});
						}
						catch (ex) {
							console.log("ERROR", ex);
						}
          },
					
					//-------------------------------------------------------
					getResults: function(params) {
						try {
							return esriRequest(self.DisplayValues.ApiUrl + "/city-search", {
								query:  {
									k: "objectid:" + params.suggestResult.key,
									l: 1, 
									//f: self.getFilterQuery(),
								},
								responseType: "json"
							}).then(function(results) {
								try {
									// Parse the results of your custom search
									var searchResults = results.data.response.docs.map(function(doc) {
										try {
											// Create a Graphic the Search widget can display
											var graphic = new Graphic({
												geometry: new Point({
													x: doc.lng,
													y: doc.lat
												}),
												attributes: doc,
											});
											// Optionally, you can provide an extent for
											// a point result, so the view can zoom to it
											var buffer = geometryEngine.geodesicBuffer(
												graphic.geometry,
												self.DisplayValues.ExtentKm,
												"kilometers"
											);
											// Return a Search Result
											var searchResult = {
												extent: buffer.extent,
												feature: graphic,
												name: doc.city + ", " + doc.admin_name + ", " + doc.country
											};
											return searchResult;
										} 
										catch (e) {
											console.log("ERROR",e)
										}
									});

									// Return an array of Search Results
									return searchResults;
								}
								catch (ex) {
									console.log("ERROR", ex)
								}
							});
						}
						catch (ex) {
							console.log("ERROR", ex);
						}						

					}
        });


				//-------------------------------------------------------
				//Custom feature layers
				//-------------------------------------------------------
				var customFeatureLayers = [];
				self.DisplayValues.FeatureLayers.forEach((feature) => {
					var fillColor = Color.fromHex(feature.fill_color);
					fillColor.a = feature.fill_opacity; 
					var borderColor = Color.fromHex(feature.border_color);
					borderColor.a = feature.border_opacity; 
					customFeatureLayers.push(
						new FeatureLayer({
							url: feature.url,
							renderer: {
								type: "simple",
								symbol: { 
									type: "simple-fill",
									color: fillColor, 
									outline: {
										color: borderColor,
										width: 1
									}
								},
							}
						})
					);
				});
				
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
				function addCustomFeatureLayer() {
					customFeatureLayers.forEach((l) => {
						view.map.add(l);
					});
				}

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
				function updateActivePoint(lat, lng, attributes) {					
					self.DisplayValues.ActivePoint.Longitude = lng;
					self.DisplayValues.ActivePoint.Latitude = lat;
					pushPinLayer.applyEdits({
						updateFeatures: [
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
					self.DisplayValues.ActivePoint.Attributes = attributes;
					searchWidget.searchTerm = ""; //(attributes.city ? attributes.city : "") + (attributes.admin_name && attributes.admin_name != attributes.city ? (", " + attributes.admin_name) : "") + (attributes.country ? (", " + attributes.country) : "");
					self.valueModel = self.DisplayValues.ActivePoint;
				}

				//-------------------------------------------------------
				//Define search widget
				//-------------------------------------------------------
				var searchWidget = new Search({
					view: view,
					container: "search-widget",
					resultGraphicEnabled: false,
					locationEnabled: false, 
					//searchAllEnabled: false,
					includeDefaultSources: false,
					sources: [customSearchSource],
					popupEnabled: false,
					 
				});

				//-------------------------------------------------------
				searchWidget.on("search-focus", function(event){
					const input = document.getElementsByClassName("esri-search__input")[0]
					input.focus();
					input.select();
				});

				//Result selection event
				//-------------------------------------------------------
				searchWidget.on("select-result", function(event){
					updateActivePoint.call(this, event.result.extent.center.y, event.result.extent.center.x, event.result.feature.attributes);
				}.bind(this));

				//Create fill symbol helper
				//-------------------------------------------------------
				function createFillSymbol(value, color) {
					return {
						"value": value,
						"symbol": {
							"color": color,
							"type": "simple-fill",
							"style": "solid",
							"outline": {
								"style": "none"
							}
						},
						"label": value
					};
				}


				//-------------------------------------------------------
				//Configure view
				//-------------------------------------------------------
				view.ui.add("lat-lon-widget", "bottom-left" );
				
				//view.ui.add(searchWidget, "top-right" );
				
				view.when().then(addCustomFeatureLayer);
				view.when().then(addPushPinLayer);

				//Function to update search text based on lat/lng
				//-------------------------------------------------------
				function updateSearchText(lat, lng) {
					try {
						var result = esriRequest(self.DisplayValues.ApiUrl + "/reverse-city-search", {
								query: {
									lat: lat,
									lng: lng,
								},
							responseType: "json"
						}).then(function(results) {
							try {
								// Parse the results of your custom search
								var searchResults = results.data.response.docs;
								if (searchResults != null && searchResults.length > 0) {
									var doc = searchResults[0];
									if (self.onValidateResult != null && self.onValidateResult != "") {
										var p = self.findParent(); 
										var isValid = self.onValidateResult.call(self,
											self.DisplayValues,
											p.ActiveFormData,
											doc,
											function(e) {
												console.log("Error: ", e, self.name);
											}.bind(this)
										);
										if (isValid) {
											updateActivePoint(lat, lng, doc);
										} 
										else {
											self.showMessageDialog("Error", self.invalidResultMessage);
										}
									} 
									else {
										updateActivePoint(lat, lng, doc);
									}			
								}
							}
							catch (ex) {
								console.log("ERROR", ex)
							}
							finally {
								setCursor("crosshair");
							}
						});
					}
					catch (e) {
						console.log("ERROR: " + e);
					}
				}


				//Record clicks
				//-------------------------------------------------------
				view.on("click", function(event) {
					if (self.DisplayValues.readonly == true) return;

					if (self.DisplayValues.ActivePoint.Latitude != null && self.DisplayValues.ConfirmChanges == true) {
						this.showConfirmDialog(
							"Confirm",
							self.DisplayValues.ConfirmationMessage, 
							//Dialog box "Ok" action
							function() {
								RecordMapClick(event.x, event.y);
							}.bind(this),
							//Dialog box cancel action. Do nothing.
							function() {}
						);
					}
					else {
						RecordMapClick(event.x, event.y);
					}
				}.bind(this));

				//-------------------------------------------------------
				function RecordMapClick(x, y) {
					var pos = view.toMap({ x: x, y: y });
					setCursor("progress");
					updateSearchText.call(this, Math.round(pos.latitude*10000)/10000, Math.round(pos.longitude*10000)/10000);							
				}

				//Set mousewheel action 
				//-------------------------------------------------------
				if (this.DisplayValues.DisableWheel == true) {
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

				//Update search text to initial point if needed
				//-------------------------------------------------------
				if (self.DisplayValues.ActivePoint.Latitude != null && self.DisplayValues.ActivePoint.Longitude != null && self.DisplayValues.ActivePoint.Latitude != 0 && self.DisplayValues.ActivePoint.Longitude != 0) {
					updateSearchText.call(this, self.DisplayValues.ActivePoint.Latitude, self.DisplayValues.ActivePoint.Longitude);
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
						this.renderMap();
						this.onAfterRenderEvent();
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
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				this.renderMap();
				this.onAfterRenderEvent();
			} else {
				this.renderMap();
				this.onAfterRenderEvent();
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

			//If lon/lat are specified as field values
			if (this.longitudeField != null && this.latitudeField != null) {
					this.DisplayValues.ActivePoint.Longitude = p.ActiveFormData[this.longitudeField];
					this.DisplayValues.ActivePoint.Latitude = p.ActiveFormData[this.latitudeField];
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
			set (v) { this.fieldChangeEvent(v) },
		},

	}

}
</script>