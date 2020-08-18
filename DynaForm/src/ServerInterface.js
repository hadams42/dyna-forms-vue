/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import { Utilities } from "./Utilities"
import { FormModel } from './models/form.model';

export const ServerInterface = class ServerInterface {
	constructor() {

		this.Form = new FormModel();
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
			if (this.debugMode) console.log("[SERVER]", method, sender.name, args);
		};

		//--------------------------------------------------------------
		//Read Grid Data
		//--------------------------------------------------------------
		this.RenderPage = function(Sender, RenderCallback, ResultCallback,  InstanceId, CurrentPage, RowsPerPage, SortBy, SortDirection, Parameters) {
			this.Log("RenderPage", arguments, Sender);
			//Render entire form on server
			this.Form.RenderPage.call(this, 
				InstanceId, 
				CurrentPage, 
				RowsPerPage, 
				SortBy, 
				SortDirection,
				Parameters
			).then(function(responseJson) {
				RenderCallback(responseJson, ResultCallback);
			}.bind(this))
			.catch(function(e) {
				console.log("Error: ",e);
				RenderCallback({items:[]}, ResultCallback);
			}.bind(this));									
		};
	
		//--------------------------------------------------------------
		//Call remote render form function on server
		//--------------------------------------------------------------
		this.RenderForm = function(sender, formId, allowedActions, renderAction, recordKey, pageLevelRecordKey, actorKey, success, error) {
			this.Log("RenderForm", arguments, sender);
			//Render entire form on server
			this.Form.RenderForm.call(
					this.Form, 
					formId,
					allowedActions, 
					renderAction, 
					recordKey, 
					pageLevelRecordKey,
					actorKey
			).then(function(responseJson) {
				success(responseJson);
			}.bind(this))
			.catch(function(e) {
				error(e);
			}.bind(this));									
		};

		//--------------------------------------------------------------
		//Call remote load form function on server
		//--------------------------------------------------------------
		this.LoadForm = function(sender, instanceId, renderAction, success, error) {
			this.Log("LoadForm", arguments, sender);
			//Render entire form on server
			this.Form.LoadForm.call(this.Form, instanceId, renderAction).then(function(responseJson) {
				success(responseJson);
			}.bind(this))
			.catch(function(e) {
				error(e);
			}.bind(this));									
		};

		//--------------------------------------------------------------
		//Delete batch of records on server
		//--------------------------------------------------------------
		this.DeleteBatch = function(sender, instanceId, recordKeys, success, error) {
			this.Form.DeleteBatch(instanceId, recordKeys).then(function(responseJson) {
					success(responseJson);
				}.bind(this))
			.catch(function(responseJson) {
				error(responseJson.message);
			}.bind(this));									
		};

		//--------------------------------------------------------------
		//Call remote render field function on server
		//--------------------------------------------------------------
		this.RenderField = function(sender, instanceId, fieldName, watchedField, display, data, success, error) {
			this.Log("RenderField", arguments, sender);
			//Send information to server to render control
			var watchedName = watchedField == null ? null : watchedField.Name;
			this.Form.RenderField.call(this.Form, instanceId, fieldName, watchedName, display, data).then(function(responseJson) {
				var utilities = new Utilities();
				display = utilities.Merge(display, responseJson.display);
				data[fieldName] = responseJson.data[fieldName];
				success(data);
			}.bind(this))
			.catch(function(e) {
				error(e);
			}.bind(this));									
		};
	
		//--------------------------------------------------------------
		//Call remote field-level verification on server
		//--------------------------------------------------------------
		this.ValidateField = function(sender, instanceId, fieldName, data, resultCallback) {
			this.Log("ValidateField", arguments, sender);
			//Send information to server to get validated:
			this.Form.ValidateField.call(this.Form, instanceId, fieldName, data).then(function(responseJson) {
				resultCallback(responseJson);
			}.bind(this))
			.catch(function(e) {
				console.log("Server field validation error", e);
			}.bind(this));									
		};

		//--------------------------------------------------------------
		//Call remote form-level verification on server
		//--------------------------------------------------------------
		this.ValidateForm = function(sender, instanceId, data, resultCallback) {
			this.Log("ValidateForm", arguments, sender);
			//Send information to server to get validated:
			this.Form.ValidateForm.call(this.Form, instanceId, data).then(function(responseJson) {
				resultCallback(responseJson);
			}.bind(this))
			.catch(function(e) {
				console.log("Server form validation error", e);
			}.bind(this));									

		};

		//--------------------------------------------------------------
		//Submit form to binder
		//--------------------------------------------------------------
		this.SubmitForm = function(sender, instanceId, data, action, success, error) {
			this.Log("SubmitForm", arguments, sender);
			if (action == null) action = "-";
			//Submit form to server 
			this.Form.SubmitForm.call(this.Form, instanceId, action, data).then(function(responseJson) {
				if (responseJson.success == true) {
					var utilities = new Utilities();
					data = utilities.Merge(data, responseJson.data);
					success(action, responseJson.redirectUrl);				
				} else {
					error(action, responseJson.redirectUrl, responseJson.message);
				}
			}.bind(this))
			.catch(function(e) {
				console.log("Server form submission error", e);
				error(action, null, e);
			}.bind(this));									
		};

		//--------------------------------------------------------------
		//Update field
		//--------------------------------------------------------------
		this.UpdateField = function(sender, instanceId, layoutId, fieldName, recordKey, newValue, success, error) {
			this.Log("UpdateField", arguments, sender);
			//Send update to server 
			this.Form.UpdateField.call(this.Form, instanceId, layoutId, fieldName, recordKey, newValue).then(function(responseJson) {
				if (responseJson.success == true) {
					success();				
				} else {
					error();
				}
			}.bind(this))
			.catch(function(e) {
				console.log("Server field update error", e);
				error(e);
			}.bind(this));									
		};

		//--------------------------------------------------------------
		//Post form to binder. 
		//Similar to Submit, but no redirect, validation or allowedAction checks
		//--------------------------------------------------------------
		this.PostForm = function(sender, instanceId, data, postCommand, display, success, error, updateData=true, updateDisplay=true) {
			this.Log("PostForm", arguments, sender);
			//Submit form to server 
			this.Form.PostForm.call(this.Form, instanceId, data, postCommand, display).then(function(responseJson) {
				if (responseJson.success == true) {
					var utilities = new Utilities();
					if (updateDisplay) display = utilities.Merge(display, responseJson.fieldData.display);
					if (updateData) data = utilities.Merge(data, responseJson.fieldData.data);
					success(postCommand);				
				} else {
					error(postCommand, responseJson.message);
				}
			}.bind(this))
			.catch(function(e) {
				console.log("Form post error", e);
				error(postCommand, e);
			}.bind(this));									
		};

		//--------------------------------------------------------------
		//Auto-save form
		//--------------------------------------------------------------
		this.AutoSaveForm = function(sender, instanceId, data, error) {
			this.Log("AutoSaveForm", arguments, sender);
			//Submit form to server 
			this.Form.AutoSaveForm.call(this.Form, instanceId, data).then(function(responseJson) {
				if (responseJson.success == true) {
					//Do not merge updates during autosave
				} else {
					error(responseJson.message);
				}
			}.bind(this))
			.catch(function(e) {
				console.log("Auto save form error", e);
				error(e);
			}.bind(this));									
		};

	}

}
