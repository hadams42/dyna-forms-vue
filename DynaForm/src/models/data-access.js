/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

export const DATA_ACCESS = {

	ResultType: {
		SingleRow: "1",
		MultiRow: "2",
		ReturnValue: "3",
		RowsAffected: "4",
		Success: "5",
		Raw: "6",
	},

	QueryResult: {
		RowsAffected: 0,
		DataAccessException: {
			Message: "",
			Source: ""
		},
		Rows: [],
		Success: false,
		ReturnValue: -1
	},

	GetResponseData: function(response, result_type) {
		var results = response.data;
		
		if (results.hasOwnProperty("Success") && results.hasOwnProperty("DataAccessException")) {
			//If error, then return error
			if (results.Success == false) {
				throw results.DataAccessException.Message;
			} 
			//Else, return results
			else {
				switch(result_type) {
					case this.ResultType.SingleRow:
						return response.data.Rows[0];
					case this.ResultType.MultiRow:
						return response.data.Rows;
					case this.ResultType.ReturnValue:
						return response.data.ReturnValue;
					case this.ResultType.RowsAffected:
						return response.data.RowsAffected;
					case this.ResultType.Success:
						return response.data.Success;
					default:
					case this.ResultType.Raw:
						return response;
				}
			}
		}
		else {
			throw "Missing or Invalid QueryResult Object"
		}
	},


}


