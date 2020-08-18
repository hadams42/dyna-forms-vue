/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import axios from 'axios';
import { HTTP_CONFIG, BASE_API_SERVER } from './http-common';
import { DATA_ACCESS } from './data-access'


//=============================================
//Form Model
//=============================================
export const FormModel = class FormModel {
	constructor() {
		
		this.HttpErrors = [];

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.RenderPage = function(InstanceId, CurrentPage, RowsPerPage, SortBy, SortDirection, Parameters) 
		{
			return new Promise((resolve, reject) => {
				axios.post(
					BASE_API_SERVER() + "/api/form-binder/render-grid-page/" + InstanceId,  
					{
						currentPage: CurrentPage,
						rowsPerPage: RowsPerPage,
						totalRows: 0,
						sortBy: (typeof SortBy == "undefined") ? null : SortBy,
						sortDirection: (typeof SortDirection == "undefined") ? null : SortDirection,
						parameters: (typeof Parameters == "undefined") ? null : Parameters,
					}, 
					HTTP_CONFIG.ReadWriteSettings)
				.then(response => {
					try {
						var result = response.data;
						resolve(result);
					}
					catch(e) {
						reject(e);
					}
				}).catch(e => {
					console.log("Error: ", e)
 					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.LoadForm = function(InstanceId, RenderAction) 
		{
			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/load-form/" + InstanceId + "/" + RenderAction, {}, HTTP_CONFIG.ReadSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.RenderForm = function(FormId, AllowedActions, RenderAction, RecordKey = -1, PageLevelRecordKey = -1, ActorKey = null) 
		{
			var renderData = {
				allowedActions: AllowedActions,
				renderAction: RenderAction,
				recordKey: RecordKey,
				pageLevelRecordKey: PageLevelRecordKey,
				actorKey: ActorKey
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/render-form/" + FormId, renderData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {	
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.DeleteBatch = function(InstanceId, RecordKeys = []) 
		{
			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/delete-batch/" + InstanceId, RecordKeys, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}
				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.RestoreForm = function(InstanceId) 
		{
			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/restore-form/" + InstanceId, {}, HTTP_CONFIG.ReadSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.SaveForm = function(InstanceId, Data) 
		{
			var fieldData = {
				display: null,
				data: Data
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/save-form/" + InstanceId, fieldData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.RenderField = function(InstanceId, FieldName, WatchedName, Display, Data) 
		{
			var fieldData = {
				display: Display,
				data: Data,
				watched: WatchedName
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/render-field/" + InstanceId + "/" + FieldName, fieldData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.ValidateField = function(InstanceId, FieldName, Data) 
		{
			var fieldData = {
				display: null,
				data: Data
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/validate-field/" + InstanceId + "/" + FieldName, fieldData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}


		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.ValidateForm = function(InstanceId, Data) 
		{
			var fieldData = {
				display: null,
				data: Data
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/validate-form/" + InstanceId, fieldData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}


		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.SubmitForm = function(InstanceId, Action, Data) 
		{
			var fieldData = {
				display: null,
				data: Data
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/submit-form/" + InstanceId + "/" + Action, fieldData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.UpdateField = function(InstanceId, LayoutId, FieldName, RecordKey, NewValue) 
		{
			var fieldUpdateData = {
				layoutId: LayoutId,
				fieldName: FieldName,
				recordKey: RecordKey,
				newValue: NewValue
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/update-field/" + InstanceId, fieldUpdateData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.PostForm = function(InstanceId, Data, Command, Display=null) 
		{
			var postData = {
				fieldData: {
					data: Data,
					display: Display,
				},
				command: Command != null ? Command.command : null,
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/post-form/" + InstanceId, postData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}


		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.AutoSaveForm = function(InstanceId, Data) 
		{
			var fieldData = {
				display: null,
				data: Data
			}

			return new Promise((resolve, reject) => {
				axios.post(BASE_API_SERVER() + "/api/form-binder/auto-save-form/" + InstanceId, fieldData, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {		
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//-------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------
		this.DoesUrlExist = function(Url) 
		{
			if (Url == null || typeof Url == undefined) {
				return Promise.reject("No URL has been specified for this resource"); 
			}

			return new Promise((resolve, reject) => {
				axios.head(Url, {}, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {
					try {
						var result = response.data;
						resolve(result);
					} catch(e) {
						reject(e);
					}

				})
				.catch(e => {
					reject(e);
				})
			});
		}

	}
}






