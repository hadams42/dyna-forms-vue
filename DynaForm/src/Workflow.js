/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

//=============================================
//Utilities
//=============================================
export const Workflow = class Workflow {
	constructor(self) {
		
		//--------------------------------------------------------------------------------------------
		this.TriggerActivity = function(activity) {
			self.emitFilterEvent(
				"_TriggerWorkflowActivity",
				self.containerInstanceId, 
				activity,
				);		
		};

		//--------------------------------------------------------------------------------------------
		this.FinalizeActivity = function(refreshPage=null, dialogOptions=null) { 
			self.emitFilterEvent(
				"_FinalizeWorkflowActivity",
				self.containerInstanceId,
				refreshPage,
				dialogOptions
			);
		};

		//--------------------------------------------------------------------------------------------
		this.CancelActivity = function() {
			self.emitFilterEvent(
				"_CancelWorkflowActivity",
				self.containerInstanceId
			);
		};

	}

}
