import axios from 'axios';
import { HTTP_CONFIG, BASE_URL } from './http-common'
import { DATA_ACCESS } from './data-access.js'

//=============================================
//Forms Model
//=============================================
export const FormsModel = class FormsModel {
	constructor() {

		this.List = [];
		this.HttpErrors = [];

		//---------------------------------------------
		this.GetAll = function(ShowInactive = false) 
		{
			return new Promise((resolve, reject) => {
				var url = BASE_URL + "api/form/get-all?ShowInactive=" + ShowInactive;
				axios.post(url, {}, HTTP_CONFIG.ReadSettings)
				.then(response =>  {
					this.List = DATA_ACCESS.GetResponseData(response, DATA_ACCESS.ResultType.MultiRow);
					resolve();
				})
				.catch(e => {
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}

		//---------------------------------------------
		this.Sync = function() 
		{
			return new Promise((resolve, reject) => {
				axios.post(BASE_URL + "api/form/sync", {}, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {				
					var rowAffected = DATA_ACCESS.GetResponseData(response, DATA_ACCESS.ResultType.RowsAffected);
					resolve(rowAffected);
				})
				.catch(e => {
					console.log(e);
					this.HttpErrors.push(e);
					reject(e);
				})

			});
		}	

	}
}

//=============================================
//Form Model
//=============================================
export const FormModel = class FormModel {
	constructor() {
		
		this.HttpErrors = [];

		this.Settings = {
			FormId: -1,
			FormName: "",
			FormDescription: "",
			Instructions: "",
			DefinitionJS: "",
			BinderKey: "",
			IsActive: true,
			Timestamp: ""
		};
		
		this.Defaults = {
			FormId: -1,
			FormName: "",
			FormDescription: "",
			Instructions: "",
			DefinitionJS: "",
			BinderKey: "",
			IsActive: true,
			Timestamp: ""
		};

		//---------------------------------------------
		this.GetById = function(FormId = -99) 
		{
			return new Promise((resolve, reject) => {
				axios.post(BASE_URL + "api/form/get-by-id/" + FormId,{}, HTTP_CONFIG.ReadSettings)
				.then(response =>  {		
					this.Settings = DATA_ACCESS.GetResponseData(response, DATA_ACCESS.ResultType.SingleRow);
					resolve();
				})
				.catch(e => {
					console.log(e);
					this.HttpErrors.push(e);
					reject(e);
				})
			});
		}


		//---------------------------------------------
		this.Create = function() 
    {
			return new Promise((resolve, reject) => {
				axios.post(BASE_URL + "api/form/create", this.Settings, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {				
					this.Settings.FormId = DATA_ACCESS.GetResponseData(response, DATA_ACCESS.ResultType.ReturnValue);
					resolve();
				})
				.catch(e => {
					console.log(e);
					this.HttpErrors.push(e);
					reject(e);
				})

			});
		}
		

		//---------------------------------------------
		this.Update = function() 
		{
      return new Promise((resolve, reject) => {
				axios.post(BASE_URL + "api/form/update", this.Settings, HTTP_CONFIG.Settings)
				.then(response =>  {				
					var success = DATA_ACCESS.GetResponseData(response, DATA_ACCESS.ResultType.Success);
					resolve(success);
				})
				.catch(e => {
					console.log(e);
					this.HttpErrors.push(e);
					reject(e);
				})

			});
		}

		//---------------------------------------------
		this.Delete = function(FormId = 0) 
		{
			return new Promise((resolve, reject) => {
				axios.post(BASE_URL + "api/form/delete/" + FormId, {}, HTTP_CONFIG.ReadWriteSettings)
				.then(response =>  {				
					var success = DATA_ACCESS.GetResponseData(response, DATA_ACCESS.ResultType.Success);
					resolve(success);
				})
				.catch(e => {
					console.log(e);
					this.HttpErrors.push(e);
					reject(e);
				})

			});
		}	

	}
}






