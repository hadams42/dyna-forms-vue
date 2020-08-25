
/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

//=============================================
//Utilities
//=============================================
import moment from 'moment'

export const Utilities = class Utilities {
	constructor() {
		
		// //-----------------------------------------------------------------------
		// //-----------------------------------------------------------------------
		// this.GetVueParent = function(o) {
		// 	//Find parent which contains active form data
		// 	var p = o.$parent;
		// 	while (p)
		// 	{
		// 		if (p.ActiveFormData != null) break;
		// 		p = p.$parent;
		// 	}
		// 	return p;
		// }

		
		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.CopyToClipboard = function(text) {
			var dummy = document.createElement("input");
			document.body.appendChild(dummy);
			dummy.setAttribute("value",  text);
			dummy.select();
			document.execCommand("copy");
			document.body.removeChild(dummy);
		}

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.GetColumnClass = function(width, newRow=false, customClasses="") {
			var prefixList = [
				"col-",
				//"col-sm-",
				"col-md-",
				"col-lg-",
				"col-xl-",
			];

			var classList = [];
			var widthList = width.split(",");
			for (var i=0; i<widthList.length; i++) {
				var w = widthList[i].trim();
				classList.push(prefixList[i] + w);
				if (newRow) {
					var wi = parseInt(w);
					classList.push(prefixList[i] + 'offset-right-' + (12-wi).toString());
				}
			}
			return classList.join(" ") + " " + customClasses;
		}	

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.GetRowClass = function(align) {
			if (align == "right") return "justify-content-end";
			else if (align == "left") return "justify-content-start";
			else if (align == "center") return "justify-content-center";
			else if (align == "between") return "justify-content-between";
			else return "";
		}	

		//--------------------------------------------------------------------------------------------
		//--------------------------------------------------------------------------------------------
		this.FormatString = function(value, format="") {
			if (value == null) return null;

			var escapeHtml = true;
			var result =  value;

			//If this is a date format
			if (format.toUpperCase().startsWith("DATE")) {
				var dateFormat = format.substring(4);
				dateFormat = this.ReplaceAll(dateFormat.trim(), "(", "");
				dateFormat = this.ReplaceAll(dateFormat, ")", "");
				if (dateFormat == "" ) dateFormat = 'l';
				var d = moment(value);
				result = d.isValid() ? d.format(dateFormat) : '';
			}
			//If this is a max length format
			else if (format.toUpperCase().startsWith("MAX")) {
				var maxLength = format.substring(3);
				maxLength = this.ReplaceAll(maxLength.trim(), "(", "");
				maxLength = this.ReplaceAll(maxLength, ")", "");
				if (result.length > maxLength) {
					//var escapedValue = this.ReplaceAll(result, "'", "\"");
					//result = "<span title='" + escapedValue + "'>" + result.substring(0, parseInt(maxLength)) + "...</span>";
					result = result.substring(0, parseInt(maxLength)) + "...";
				} 
				
			}
			//Else, if it is another format type
			else {
				switch (format.toUpperCase()) {
					case "N":
					case "C":
						result = this.FormatNumber(result);
						break;
					case "N0":
					case "C0":
						result = this.FormatFixedNumber(result, 0);
						break;
					case "N1":
					case "C1":
						result = this.FormatFixedNumber(result, 1);
						break;
					case "N2":
					case "C2":
						result = this.FormatFixedNumber(result, 2);
						break;
					case "N3":
					case "C3":
						result = this.FormatFixedNumber(result, 3);
						break;
					case "N4":
					case "C4":
						result = this.FormatFixedNumber(result, 4);
						break;
					case "RAW":
						escapeHtml = false;
						break;
					case "CHECK":
						result = result == "1" ? "&#x2611;" : "&#x2610;";
						escapeHtml = false;
						break;
					case "GROUP":
						break;
					case "T":
						break;
					}

				if ((format.startsWith("N") || format.startsWith("C")) && result.startsWith("-") ) {
					result = "(" + result.substring(1) + ")"
				}

			}		

			if (escapeHtml == true) {
				result = this.EscapeHtml(result);
			}

			return result;			
		},


		//--------------------------------------------------------------------------------------------
		//--------------------------------------------------------------------------------------------
		this.EscapeHtml = function(s) {
			let elt = document.createElement('span'); 
			elt.textContent = s; 
			return elt.innerHTML;	
		},


		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.FormatNumber = function(value, show_nulls) {
			var valueString = "" + value;
			var valueFloat = valueString == "" ? 0 : parseFloat(valueString.replace(/,/g, ''));
			
			if (show_nulls && (valueFloat/1) == null) {
				return 'NULL'
			}
			
			if (isNaN(value)) {
				return value;
			} else {
				let val = (value/1);

				return parseFloat(val.toFixed(2)).toLocaleString().replace(/\.([0-9])$/, ".$10");
			}
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.ReplaceAll = function(str, find, replace) {
			return str.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), replace);
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.ConvertRemToPixels = function(rem) {    
			return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.RoundNumber = function(value, decimals=2) {
			if (isNaN(value)) {
				return value;
			} else {
				let m = Math.pow(10,decimals);
				let val = Math.round(value*m)/m;//.replace('.', ',')
				return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			}
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.FormatFixedNumber = function(value, fixed=0) {
			var valueString = "" + value;
			var valueFloat = valueString == "" ? 0 : parseFloat(valueString.replace(/,/g, ''));
			let val = (valueFloat/1);
			return val.toFixed(fixed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.GetStringValue = function(value, defaultString = "") {
			try {
				if (!value > '') return defaultString;
				return value;
			} catch (ex){
				return "";
			}
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.FillTemplateString = function(template, inputString) {
			if (inputString != null && inputString != '') {
				return template.replace("{FactorAName}", inputString);
			} else {
				return null;
			}
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.FillHtmlTemplate = function(template, data) {
			var re = /\{\{([^\{\}>]+)?\}\}/g;
			var result = template;
			var match;
	
			while(match = re.exec(template)) {
				var templateFieldRaw = match[1];
				var templateField = null;
				var templateFormat = null;
				var templateFieldSplit = templateFieldRaw.split(":");
				if (templateFieldSplit.length === 2) {
					templateFormat = templateFieldSplit[0];
					templateField = templateFieldSplit[1];
				} 
				else {
					templateField = templateFieldSplit[0];
				}
				
				if (typeof data[templateField] != "undefined" && data[templateField] != null) 
				{
					var replacementValue = data[templateField];

					if (replacementValue.length == 10) {
						var event = new Date(replacementValue);
						if(Boolean(+event)) {
							var options = { year: 'numeric', month: 'long', day: 'numeric' };
							replacementValue = event.toLocaleDateString(undefined, options);
						}
					}

					if (templateFormat != null) {
						replacementValue = this.FormatString(replacementValue, templateFormat);
					}

					result = result.replace("{{" + templateFieldRaw + "}}", replacementValue);
				} 
				else {
					result = result.replace("{{" + templateFieldRaw + "}}", "");
				}
			}

			return result;	
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.ParseFloat = function(s) {
			try {
				return parseFloat(s);
			} 
			catch(e) {
				return 0;
			}
		};


		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.Clone = function(obj) {
			// Handle the 3 simple types, and null or undefined
			if (null == obj || "object" != typeof obj) return obj;
			// Handle Date
			if (obj instanceof Date) {
					var copy = new Date();
					copy.setTime(obj.getTime());
					return copy;
			}
			// Handle Array
			if (obj instanceof Array) {
					var copy = [];
					for (var i = 0, len = obj.length; i < len; i++) {
							copy[i] = this.Clone(obj[i]);
					}
					return copy;
			}
			// Handle Object
			if (obj instanceof Object) {
					var copy = {};
					for (var attr in obj) {
							if (obj.hasOwnProperty(attr)) copy[attr] = this.Clone(obj[attr]);
					}
					return copy;
			}
			throw new Error("Unable to clone Javascript object. Its type isn't supported.");
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.Merge = function(originalObject, newObject) {
			//Define a new function if this browser does not support object.assign
			if (typeof Object.assign != 'function') {
				Object.assign = function(target, varArgs) {
					'use strict';
					if (target == null) { // TypeError if undefined or null
						throw new TypeError('Cannot convert undefined or null to object');
					}
					var to = Object(target);
					for (var index = 1; index < arguments.length; index++) {
						var nextSource = arguments[index];
						if (nextSource != null) { // Skip over if undefined or null
							for (var nextKey in nextSource) {
								// Avoid bugs when hasOwnProperty is shadowed
								if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
									to[nextKey] = nextSource[nextKey];
								}
							}
						}
					}
					return to;
				};
			}

			function isObject(item) {
				return (item && typeof item === 'object' && !Array.isArray(item));
			}
			
			//Function to merge object in a recursive manner 
			function mergeDeep(target, ...sources) {
				if (!sources.length) return target;
				const source = sources.shift();
				if (isObject(target) && isObject(source)) {
					for (const key in source) {
						if (isObject(source[key])) {
							if (!target[key]) Object.assign(target, { [key]: {} });
							mergeDeep(target[key], source[key]);
						} else {
							Object.assign(target, { [key]: source[key] });
						}
					}
				}
				return mergeDeep(target, ...sources);
			}

			return mergeDeep(originalObject, newObject);

			//return Object.assign(originalObject, newObject);
		};



		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.MaxLength = function(s, maxLength) {
			if (s != null && s.length > maxLength )
			{
				return s.substr(0, maxLength) + "...";
			}
			else {
				return s;
			}
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.Redirect = function(url, data, method) {
			method = method.toUpperCase();
			var form = document.createElement('form');
			document.body.appendChild(form);
			form.method = method.toLowerCase();
			form.action = url;
			for (var property in data) {
				if (data.hasOwnProperty(property)) {
					var input = document.createElement('input');
					input.type = 'hidden';
					input.name = property;
					input.value = data[property];
					form.appendChild(input);
				}
			}
			form.submit();
			document.body.removeChild(form);
		};
		
		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		//Show flash protected content
		this.FlashProtect = function(Visible=true) {
			setTimeout(function() { 
				if (Visible == true) {
					$(".flash-protect").css("visibility", "visible");
				} else {
					$(".flash-protect").css("visibility", "hidden");
				}
			}, 30);
		}

	}

}
