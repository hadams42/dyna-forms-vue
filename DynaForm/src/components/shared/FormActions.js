/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import { Utilities } from "../../Utilities"
import { ServerInterface } from "../../ServerInterface.js";
import { AUTO_REDIRECT_URL } from "../../models/http-common";

export const FormActions = class FormActions {
	constructor(self) {

		this.debugMode = false;

		//--------------------------------------------------------------
		//Logging functionality
		//--------------------------------------------------------------
		//Turn on logging if requested
		if (window["_Dyna"] != null && window["_Dyna"].debugMode == true && window["_Dyna"].logServerCalls == true ) {
			this.debugMode = true;
		}

		//Generic logging method
		this.Log = function(method, args, sender) {
			if (this.debugMode) console.log("[ACTION]", method, sender.name, args);
		};

		//--------------------------------------------------------------
		//Perform Server Actions
		//--------------------------------------------------------------
		this.ServerAction = function(Sender, Action, InstanceId, RecordKey, Display=null) {
			this.Log("ServerAction", arguments, Sender);
			//Set initial values
			var utilities = new Utilities();
			var redirectUrl = AUTO_REDIRECT_URL();
			var data = {};
			
			//--------- Static URL -----------
			if (typeof Action.urlRedirect != "undefined" &&  Action.urlRedirect != null && Action.urlRedirect.href != null && Action.urlRedirect.href != "") {
				redirectUrl = Action.urlRedirect.href;
				data = {
					recordKey: RecordKey,
					instanceId: InstanceId
				}
				utilities.Redirect(redirectUrl, data, Action.urlRedirect.method == null || Action.urlRedirect.method == "" ? "get" : Action.urlRedirect.method);

			//--------- Post to URL -----------
			}	else if (typeof Action.post != "undefined" &&  Action.post != null && Action.post.command != null && Action.post.command != "") {
				var postCommand = {
					recordKey: RecordKey,
					instanceId: InstanceId,
					command: Action.post.command,
					data: Action.post.data
				}
				var p = null;
				if (Sender.findParent != null) {
					p = Sender.findParent();
				} else {
					p = Sender;
				}

				var serverInterface = new ServerInterface();
				serverInterface.PostForm(Sender,
					InstanceId, 
					p.ActiveFormData,
					postCommand,  
					Display,
					function(cbAction) {
						if (Action.post.success != null) {
							Action.post.success.call(Sender, cbAction);
						}
					}.bind(Sender),
					function(cbAction, e) {
						console.log("POST ERROR:", e);
						if (Action.post.error != null) Action.post.error.call(Sender,cbAction, e);
					}.bind(Sender)
				);


			//--------- Auto Redirect -----------
			}	else if (typeof Action.autoRedirect != "undefined" &&  Action.autoRedirect != null && (Action.autoRedirect.target != null && Action.autoRedirect.target || Action.autoRedirect.href != null)) {
				var target = Action.autoRedirect.target;
				var renderAction = Action.autoRedirect.renderAction != null ? Action.autoRedirect.renderAction : "";
				var renderCommand = Action.autoRedirect.command != null ? Action.autoRedirect.command : "";
				data = {
					instanceId: InstanceId,
					recordKey: Action.autoRedirect.recordKey == null ? RecordKey : Action.autoRedirect.recordKey,
					target: target,
					command: renderCommand,
					targetUrl: Action.autoRedirect.href == null ? Sender.targets[target] : Action.autoRedirect.href,
					allowedActions: "*", //for legacy compatibility
					renderAction: renderAction,
				}
				utilities.Redirect(redirectUrl, data, "post");
			} 
			//--------- Invalid Action -----------
			else {
				console.log("Missing or invalid form action specified.", Action);
			}

		};


		//--------------------------------------------------------------
		//Perform Local Form Actions
		//--------------------------------------------------------------
		this.LocalAction = function(Sender, FormType, Guid, ActionCommand, Parameters) {

			//--------- Reset -----------
			if (ActionCommand == "reset") {
				self.emitFilterEvent("_Reset", Guid);
			}

			//--------- Submit -----------
			else if (ActionCommand == "submit") {
				var renderAction = Parameters;
				if (typeof Parameters == "undefined" || Parameters == null || Parameters == "") {
					renderAction = "auto";
				}
				self.emitFilterEvent("_Loading", Guid, true);
				self.emitFilterEvent("_BeforeSubmit", Guid + FormType, renderAction);
			}

			//--------- Validate Field -----------
			else if (ActionCommand == "validate-field" && Parameters != null) {
				self.emitFilterEvent("_ValidateField", Guid + FormType + Parameters);
			}

			//--------- Validate Form -----------
			else if (ActionCommand == "validate-form") {
				self.emitFilterEvent("_BeforeValidateForm", Guid + FormType);
			}

		};


	}

}
