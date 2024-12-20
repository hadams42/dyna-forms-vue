/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

export const ValidationRules = class ValidationRules {
	constructor() {
		

		this.Validate = function(type, rule, value, message=null) {
			
			//Configure result object
			var result = {
				status: true,
				helpMessage: null,
				helpUrl: null,
				helpLabel: null,
			};

			//-----------------------------------------------------
			//Define validation routines
			//-----------------------------------------------------

			//Required
			//--------------------------------
			if (type == "required") {
				//Determine whether rule is enabled
				if (rule === true) {

					result.helpLabel = "Required";
					
					//Perform validation
					if (value == null || value.length == 0) {
						result.status = false;
					}

					//Set result message
					if (result.status == false) {
						if (message == null) {
							result.helpMessage = this.name.replace(/([A-Z])/g, ' $1').trim() + " is " + "required. ";
						} else {
							result.helpMessage = message;
						}
					}

				}
			} 

			

			//Min Value
			//--------------------------------
			else if (type == "min") {
				result.helpLabel = "Value too low" + ". ";
				//Read in min value
				var min = 0;
				if (rule > 0) {
					min = rule;
				} 

				//Perform validation
				if (value == null || value < min) {
					result.status = false;
				}

				//Set result message
				if (result.status == false) {
					result.helpMessage = "Value must be at least " + min + ". ";
				}
			} 

			//Max Value
			//--------------------------------
			else if (type == "max") {
				result.helpLabel = "Value too high" + ". ";
				//Read in max value
				var max = 0;
				if (rule > 0) {
					max = rule;
				} 

				//Perform validation
				if (value == null || value > max) {
					result.status = false;
				}

				//Set result message
				if (result.status == false) {
					result.helpMessage = "Value must be less than " + max + ". ";
				}
			} 

			//Min Length
			//--------------------------------
			else if (type == "email") {
				result.helpLabel = "Invalid email address format. ";

				const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				result.status =  re.test(String(value).toLowerCase());

				//Set result message
				if (result.status == false) {
					result.helpMessage = "Must be at a valid emails address in the format of xxxxxx@yyyyyyyy.zzz";
				}
			} 

			//Min Length
			//--------------------------------
			else if (type == "minLength") {
				result.helpLabel = "Response too short. ";
				//Read in min length
				var min = 0;
				if (rule > 0) {
					min = rule;
				} else if (rule.length > 0) {
					min = rule.length;
				}

				//Perform validation
				if (value == null || value.length < min) {
					result.status = false;
				}

				//Set result message
				if (result.status == false) {
					result.helpMessage = "Must be at least " + min + " characters. ";
				}
			} 

			//Max Length
			//--------------------------------
			else if (type == "maxLength") {
				result.helpLabel = "Response too long. ";
				//Read in max length
				var max = 0;
				if (rule > 0) {
					max = rule;
				} else if (rule.length > 0) {
					max = rule.length;
				}

				//Perform validation
				if (value != null && value.length > max) {
					result.status = false;
				}

				//Set result message
				if (result.status == false) {
					result.helpMessage = "Must be less than " + max + " characters. ";
				}
			} 

			//Files uploaded
			//--------------------------------
			else if (type == "uploaded") {
				result.helpLabel = "No file uploaded. ";
				//Determine whether rule is enabled
				if (rule.enabled == true || rule == true) {

					//Perform validation
					if (this.files.length > 0) {
						result.status = false;
					} else {
						result.status = true;
					}

					//Set result message
					if (result.status == false) {
						result.helpMessage = "Files must be uploaded. ";
					}

				}
			} 


			//Return validation result
			//--------------------------------
			return result;

		};

	}

}
