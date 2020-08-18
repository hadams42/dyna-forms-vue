//=============================================
//Utilities
//=============================================
export const Utilities = class Utilities {
	constructor() {
		
		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.GetVueParent = function(o) {
			//Find parent which contains active form data
			var p = o.$parent;
			while (p)
			{
				if (p.ActiveFormData != null) break;
				p = p.$parent;
			}
			return p;
		}

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.GetColumnClass = function(width) {
			var prefixList = [
				"col-",
				"col-sm-",
				"col-md-",
				"col-lg-",
			];

			var classList = [];
			var widthList = width.split(",");
			for (var i=0; i<widthList.length; i++) {
				var w = widthList[i].trim();
				classList.push(prefixList[i] + w);
			}

			return classList.join(" ");
		}	

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.FormatNumber = function(value, show_nulls) {
			if (show_nulls && value == null) {
				return 'NULL'
			}
			
			if (isNaN(value)) {
				return value;
			} else {
				let val = (value/1);//.replace('.', ',')
				return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
			}
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
			let val = (value/1);//.replace('.', ',')
			return val.toFixed(fixed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		};

		//-----------------------------------------------------------------------
		//-----------------------------------------------------------------------
		this.GetStringValue = function(value, defaultString = "") {
			if (!value > '') return defaultString;
			return value;
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
		this.MaxLength = function(s, maxLength) {
			if (s != null && s.length > maxLength )
			{
				return s.substr(0, maxLength) + "...";
			}
			else {
				return s;
			}
		};

	
	
	}

}
