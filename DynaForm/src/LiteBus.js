/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

export default {

	install(Vue) {


		const root =  {
			subscriptions: {},


			//Only allows one instance of a given subscriber to exist. 
			onFiltered: function (eventType, sequence, guid, callback) {

				const id = Symbol("id");
				var isReplacement = false;

				//If this is the first event of this type, then start a queue
				if (!this.subscriptions[eventType] ) {
					this.subscriptions[eventType] = {};
				}
				//Else, if there are already events in this queue, then replace it
				else {
					Object.getOwnPropertySymbols(this.subscriptions[eventType]).forEach((existingId) => {
						if (this.subscriptions[eventType][existingId] != undefined && 
								this.subscriptions[eventType][existingId].guid === guid &&
								this.subscriptions[eventType][existingId].sequence === sequence) {
							delete this.subscriptions[eventType][existingId];
							isReplacement = true;
						}
					});
				}
				
				//Add callback and guid
				this.subscriptions[eventType][id] = {};
				this.subscriptions[eventType][id].callback = callback;
				this.subscriptions[eventType][id].guid = guid
				this.subscriptions[eventType][id].sequence = sequence

				//Log if required
				if (
					window["_Dyna"] != null &&
					window["_Dyna"].logHandlers == true &&
					(window["_Dyna"].hideInternals == false ||
						eventType.startsWith("_") == false)
				) {
					console.log("[ON]", eventType, isReplacement ? 'isReplaced=true' : 'isReplaced=false', callback);
				}

				return {
					id: id,
					eventType: eventType,
					off: function () {
						//Delete only the specified id
						delete this.subscriptions[eventType][id];
						//Clean up event type if it no longer has any children
						if (Object.getOwnPropertySymbols(this.subscriptions[eventType]).length === 0) {
							delete this.subscriptions[eventType];
						}
					}.bind(this),
				};
			},




			//--------------------------------------------------------------
			//On
			//--------------------------------------------------------------
			on: function (eventType, callback) {
				const id = Symbol("id");
				if (!this.subscriptions[eventType]) this.subscriptions[eventType] = {};
				this.subscriptions[eventType][id] = {};
				this.subscriptions[eventType][id].callback = callback;
				//this.subscriptions[eventType][id].id = id;

				if (
					window["_Dyna"] != null &&
					window["_Dyna"].logHandlers == true &&
					(window["_Dyna"].hideInternals == false ||
						eventType.startsWith("_") == false)
				) {
					console.log("[ON]", eventType, callback);
				}

				return {
					id: id,
					eventType: eventType,
					off: function () {
						//Delete only the specified id
						delete this.subscriptions[eventType][id];
						//Clean up event type if it no longer has any children
						if (Object.getOwnPropertySymbols(this.subscriptions[eventType]).length === 0) {
							delete this.subscriptions[eventType];
						}
					}.bind(this),
				};
			},

			//--------------------------------------------------------------
			//Off
			//--------------------------------------------------------------
			off: function (eventType, id) {
				if (this.subscriptions[eventType] != undefined) {
					//Delete all events for this type if no id is specified
					if (id == null) {
						Object.getOwnPropertySymbols(this.subscriptions[eventType]).forEach((key) => {
							delete this.subscriptions[eventType][key];
						});
					}
					//Delete only the specified id
					else if (this.subscriptions[eventType][id] != undefined) {
						delete this.subscriptions[eventType][id];
					}
					//Clean up event type if it no longer has any children
					if (Object.getOwnPropertySymbols(this.subscriptions[eventType]).length === 0) {
						delete this.subscriptions[eventType];
					}
				}
			},

			//--------------------------------------------------------------
			//Emit
			//--------------------------------------------------------------
			emitFiltered: function (self, eventType, guid, ...args) {
				if (!this.subscriptions[eventType]) return;

				Object.getOwnPropertySymbols(this.subscriptions[eventType]).forEach((id) => {
					if (this.subscriptions[eventType][id] != undefined && this.subscriptions[eventType][id].guid === guid) {
						if (window["_Dyna"] != null && window["_Dyna"].logEmitters == true) {
							console.log("[EMIT]", eventType, ...args);
						}
						this.subscriptions[eventType][id].callback(self, ...args);
					}
				});
			},

			emit: function (self, eventType, ...args) {
				if (!this.subscriptions[eventType]) return;

				Object.getOwnPropertySymbols(this.subscriptions[eventType]).forEach((id) => {
					if (this.subscriptions[eventType][id] != undefined) {
						if (window["_Dyna"] != null && window["_Dyna"].logEmitters == true) {
							console.log("[EMIT]", eventType, ...args);
						}
						this.subscriptions[eventType][id].callback(self, ...args);
					}
				});
			},

			//--------------------------------------------------------------
			//Log
			//--------------------------------------------------------------
			log: function (a, o) {
				let name;
				if (typeof o != "undefined" && o != null) {
					if (o.name != null && o.name != "") name = o.name;
					else name = o.formType;
				} else name = "empty";
				console.log("[LOG]", a.callee.name, name);
			}
		};

		Vue.prototype.$LiteBus = root;
  }
}




