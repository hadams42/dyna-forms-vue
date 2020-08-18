
<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import "codemirror/mode/javascript/javascript.js"

import 'codemirror/theme/base16-dark.css'
//import 'codemirror/theme/monokai.css'
import { Utilities } from "../Utilities.js"
import { EventBus } from "../EventBus.js";
import { DataAccess } from "../models/form.model.js";
import { FormModel, FormsModel } from '../models/form.model.js'
import { debug, error } from 'util';

export default {
  name: "FormEditor",
	
	components: { codemirror },
	
	props: [
	],

    data() {
    return {
			Utilities: new Utilities(),
			Forms: new FormsModel(),
			SelectedForm: new FormModel(),
			
			FormId: -1,
			NewFormName: "",

			DefaultEditorHeight: 400,
			EditorHeight: 400,
			FullScreen: false,
			ShowPreview: false,
			ShowInactiveForms: true,

			FormIsDirty: false,

			ConfirmModal: {
				Text: "",
				Title: "",
				ShowConfirm: false,
				CancelCallback: function() {},
				OkCallback: function() {},
			},

			FormPropertiesModal: {
				ShowDialog: false,
				CancelCallback: function() {},
				OkCallback: function() {},
			},

			InProcessIndicators: {
				Loading: false,
				Saving: false,
				BeforeEditing: false,
				Editing: false,
				EditingNew: false,
				EditingProperties: false				
			},

			Messages: {
				IsErrorAlertVisible: false,
				ErrorMessage: "",
				ErrorSource: "",
			},
			
			JSCode: '',
			
      cmOptions: {
        tabSize: 2,
        mode: 'text/javascript',
        theme: 'base16-dark',
				//theme: 'monokai',
				readOnly: this.isReadyOnly,
        lineNumbers: true,
				line: true,
				//viewportMargin: Infinity,
      }

    };
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
  methods: {

		//Events
		//---------------------------------------------------
		CodeChangesEvent: function(value) {
			if (this.InProcessIndicators.BeforeEditing == true) {
				this.InProcessIndicators.BeforeEditing = false;
				this.InProcessIndicators.Editing = true;			
			} else {
				this.FormIsDirty = true;
			}
		},

		UpdateFormSelectionEvent: function() {
			//If we have already selected this record, then ignore
			if (this.FormId == this.SelectedForm.Settings.FormId) {
				 return;
			} 
			//Else if no form is selected, clear preview
			else if (this.FormId == -1) {
				this.ClearForm();
			}
			//Else update selection
			else 
			{
				this.SelectedForm.Settings.FormId = this.FormId;
				this.RefreshForm(this.SelectedForm.Settings.FormId);
			}
		},

		NewFormEvent: function(value) {
			this.NewForm();
		},

		EditFormEvent: function(value){
			this.EditForm();
		},

		DeleteFormEvent: function(value) {
			//Configure confirm dialog box
			this.ConfirmModal.Title = "Confirm Delete";
			this.ConfirmModal.Text = "Do you wish to delete the form '" + this.SelectedForm.Settings.FormName + "'";
			this.ConfirmModal.CancelCallback = function() { };
			this.ConfirmModal.OkCallback = function() {				
				this.InProcessIndicators.EditingNew = false;
				this.InProcessIndicators.Editing = false;
				this.FormIsDirty = false;
				this.DeleteForm();
			};

			//Open confirm dialog
			this.ConfirmModal.ShowConfirm = true;
		},

		SyncFormEvent: function(value) {
				this.SyncForms();
		},

		PreviewEvent: function(value) {
			this.ShowPreview = ! this.ShowPreview;

			if (this.ShowPreview) {
				this.RefreshPreview();
			} else {
				this.RemoveChildElements("FormPreviewOuterContainer");
			}
		},

		ToggleFullScreenEvent: function(value) {
			this.FullScreen = !this.FullScreen;

			if (this.FullScreen) {
				var fullHeight = window.innerHeight;
				this.EditorHeight = fullHeight - 175;
			} else {
				this.EditorHeight = this.DefaultEditorHeight;
			}
		},

		SaveEvent: function(value) {
			this.InProcessIndicators.Saving = true;
			this.SaveForm();
		},

		RefreshPreviewEvent: function(value) {
			this.RefreshPreview();
		},

		CancelEvent: function(value) {
			//Configure confirm dialog box
			this.ConfirmModal.Title = "Confirm";
			this.ConfirmModal.Text = "Do you wish to cancel and loose all changes to this form?";
			this.ConfirmModal.CancelCallback = function() { };
			this.ConfirmModal.OkCallback = function() {				
				this.ClearForm();
			};

			//Open confirm dialog
			this.ConfirmModal.ShowConfirm = true;
		},

		ClearForm: function() {
				this.SelectedForm.Settings = this.Utilities.Clone(this.SelectedForm.Defaults);				
				this.FormId = -1;
				this.InProcessIndicators.EditingNew = false;
				this.InProcessIndicators.Editing = false;
				this.InProcessIndicators.Saving = false;
				this.InProcessIndicators.EditingProperties = false;
				this.FormIsDirty = false;
				this.RefreshPreview();
		},

		ConfirmOkClick: function() {
			this.ConfirmModal.ShowConfirm = false;
			this.ConfirmModal.OkCallback.call(this);
		},

		ConfirmCancelClick: function() {
			this.ConfirmModal.ShowConfirm = false;
			this.ConfirmModal.CancelCallback.call(this);			
		},

		FormPropertiesOkClick: function() {

			// Fetch form to apply custom Bootstrap validation
			var form = $("#PropertiesForm")

			if (form[0].checkValidity() === false) {
				form.addClass('was-validated');
				return;
			}
			form.addClass('was-validated');

			this.FormPropertiesModal.ShowDialog = false;
			this.FormPropertiesModal.OkCallback.call(this);
		},

		FormPropertiesCancelClick: function() {
			this.FormPropertiesModal.ShowDialog = false;
			this.FormPropertiesModal.CancelCallback.call(this);			
		},

		//Business Logic
		//---------------------------------------------------
		
		SaveForm: function(e) {
			//Update form definition code
			this.SelectedForm.Settings.DefinitionJS = this.JSCode;

			//Create or update
			var CreateOrUpdate;
			if (this.InProcessIndicators.EditingNew) {
				CreateOrUpdate = this.SelectedForm.Create.bind(this.SelectedForm);
			} else {
				CreateOrUpdate = this.SelectedForm.Update.bind(this.SelectedForm);
			}

			//Perform action
			CreateOrUpdate().then(function() {
				this.FinalizeSaveForm();
			}.bind(this))
			.catch(function(e) {
				this.ShowError(this.SelectedForm, e, "Adding or Updating Form");
				this.InProcessIndicators.Saving = false;
			}.bind(this));
		},

		FinalizeSaveForm: function() {
			this.FormId = this.SelectedForm.Settings.FormId;
			this.InProcessIndicators.Saving = false;
			this.InProcessIndicators.EditingProperties = false;
			this.InProcessIndicators.EditingNew = false;
			this.RefreshForms();
			this.$nextTick().then(function () {
				this.FormIsDirty = false;
			}.bind(this));
		},		

		EditForm: function() {
			//Define callbacks
			this.FormPropertiesModal.CancelCallback = function() { };
			this.FormPropertiesModal.OkCallback = function() {
				//Create dropdown placeholder to display form name
				this.FormId = 0;
				this.NewFormName = this.SelectedForm.Settings.FormName;
				//Configure indicators
				this.InProcessIndicators.EditingProperties = true;
				this.FormIsDirty = true;
			};

			//Show dialog
			this.FormPropertiesModal.ShowDialog = true;
			this.$nextTick(() => this.$refs.FormNameTextBox.focus())			
		},

		NewForm: function() {
			//Clear current form selection
			this.SelectedForm.Settings = this.Utilities.Clone(this.SelectedForm.Defaults);		
			this.FormId = -1;		
			this.SelectedForm.Settings.FormName = "";
			//Define callbacks
			this.FormPropertiesModal.CancelCallback = function() { };
			this.FormPropertiesModal.OkCallback = function() {
				//Create dropdown placeholder to display form name
				this.FormId = 0;
				this.SelectedForm.Settings.FormId = this.FormId;
				this.NewFormName = this.SelectedForm.Settings.FormName;
				//Set example js code
				this.SelectedForm.Settings.DefinitionJS = "{\n\tsettings: {},\n\tdata: {},\n\tschema: [\n\t\t{\n\t\t\tlabel: \"Last Name\",\n\t\t\tname: \"txtLastName\",\n\t\t\tfieldType: \"TextInput\",\n\t\t\twidth: \"12, 6\"\n\t\t}\n\t]\n};";
				this.JSCode = this.SelectedForm.Settings.DefinitionJS;
				//Configure indicators
				this.InProcessIndicators.Loading = false;
				this.InProcessIndicators.Editing = true;
				this.InProcessIndicators.EditingNew = true;
				this.InProcessIndicators.BeforeEditing = true;
				this.FormIsDirty = true;
				this.RefreshPreview();									
			};

			//Show dialog
			this.FormPropertiesModal.ShowDialog = true;
			this.$nextTick(() => this.$refs.FormNameTextBox.focus())			
		},

		DeleteForm: function() {
			this.SelectedForm.Delete.call(this.SelectedForm, this.SelectedForm.Settings.FormId).then(function() {
				this.SelectedForm.Settings = this.Utilities.Clone(this.SelectedForm.Defaults);				
				this.FormId = -1;
				this.RefreshPreview();
				this.RefreshForms();
			}.bind(this))
			.catch(e => {
					this.ShowError(this.SelectedForm, e, "[Deleting Form]");
			});									
		},

		SyncForms: function() {
			this.Forms.Sync.call(this.Forms).then(function(syncCount) {
				alert(syncCount + " forms synced.");
			}.bind(this))
			.catch(e => {
					this.ShowError(this.Forms, e, "Syncing Forms");
			});			
		},

		RefreshForms: function() {
			this.Forms.GetAll.call(this.Forms, this.ShowInactiveForms).then(function() {
			}.bind(this))
			.catch(e => {
					this.ShowError(this.Forms, e, "Loading Forms");
			});			
		},

		RefreshForm: function(formId) {
			this.InProcessIndicators.Loading = true;
			this.SelectedForm.GetById.call(this.SelectedForm, formId).then(function() {
				this.JSCode = this.SelectedForm.Settings.DefinitionJS;
				this.InProcessIndicators.Loading = false;
				this.InProcessIndicators.Editing = false;
				this.InProcessIndicators.BeforeEditing = true;
				this.FormIsDirty = false;
				this.RefreshPreview();
			}.bind(this))
			.catch(function(e) {
					this.ShowError(this.SelectedForm, e, "[Loading Form]");
			}.bind(this));									
		},

		RefreshPreview: function() {
			this.ClearError();

			//Create preview element in dom
			this.RemoveChildElements("FormPreviewOuterContainer");
			this.AddElement("FormPreviewOuterContainer", "div", "FormPreviewContainer", "");

			//Only show if this is a valid form
			if (this.FormId < 0 || this.ShowPreview == false) return;

			//Evaluate form definition
			var formDefinition = "var _Form = " + this.JSCode;
			try {
				eval.call(null, formDefinition);
			} catch (e) {
				this.Messages.ErrorMessage = "Invalid Javascript Syntax";
				this.Messages.ErrorSource = "";
				this.Messages.IsErrorAlertVisible = true;
				return;
			}

			//Determine if this is a valid form 
			var errorMessage = "";
			if (typeof _Form === 'undefined') {
				errorMessage += "No _Form variable defined";
			}
			else {
				if (_Form.settings == null) errorMessage += ((errorMessage != "") ? "<br/>" : "") + "No _Form.settings defined";
				if (_Form.schema == null) errorMessage += ((errorMessage != "") ? "<br/>" : "") + "No _Form.schema defined";
			} 

			if (errorMessage != "") {
				this.Messages.ErrorMessage = errorMessage;
				this.Messages.ErrorSource = "";
				this.Messages.IsErrorAlertVisible = true;
				return;
			}

			//Render form
			window.RenderForm("#FormPreviewContainer", _Form, "aW5zdGFuY2VpZA==");
		},

		//Utility Methods
		//---------------------------------------------------------------------
		ShowError: function(Model, Exception, Source) {
			var Message = "";
			if (Model != null && Model.hasOwnProperty("HttpErrors")) {
				Message = Model.HttpErrors.join(";");
				Model.HttpErrors = [];
			}
			if (Exception != null && Exception.hasOwnProperty("message") && Exception.message != Message) {
				Message += Exception.message;
			} else if (Exception != null && Exception.toString() != Message) {
				Message += Exception.toString();
			}
			if (Message.endsWith("to data type int.")) {
				Message = Message.replace("Conversion failed when converting the nvarchar value","");
				Message = Message.replace("to data type int.","");
			}
			Message = Message.replace("Error: Network ErrorNetwork Error","Please check your network connection.");			
			this.Messages.ErrorMessage = Message;
			this.Messages.ErrorSource = Source;
			this.Messages.IsErrorAlertVisible = true;
		},

		ClearError: function() {
			this.Messages.ErrorMessage = "";
			this.Messages.ErrorSource = "";
			this.Messages.IsErrorAlertVisible = false;
		},

		IsStrictMode: function() {
	    try {
				var o= {p:1,p:2};}
			catch(E){ 
				return true;
			}
  	  return false;
		},

		AddElement: function(parentId, elementTag, elementId, html) {
			// Adds an element to the document
			var p = document.getElementById(parentId);
			var newElement = document.createElement(elementTag);
			newElement.setAttribute('id', elementId);
			newElement.innerHTML = html;
			p.appendChild(newElement);
		},

		RemoveChildElements: function(elementId) {
			var myNode = document.getElementById(elementId);
			while (myNode.firstChild) {
					myNode.removeChild(myNode.firstChild);
			}	
		}


	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	watch: {
		FormIsDirty: function(value) {
			if (value == true) {
				// Enable navigation prompt
				window.onbeforeunload = function() {
					return true;
				};
			} else {
				// Remove navigation prompt
				window.onbeforeunload = null;			
			}
		}
		
	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	mounted: function() {
		this.SelectedForm.Settings = this.Utilities.Clone(this.SelectedForm.Defaults);
		this.RefreshForms(false);
	},
	
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	created: function() {
	},

	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------------------
	computed: {
		isReadyOnly: {
			get () { return this.SelectedForm.Settings.FormId < 0 ? true : false }
		},

	},
	
};
</script>

<style lang="scss">

.code-editor-container {

	.form-preview {
		background-color: #fdfdfd;
	}

	.codemirror-container {
		background-color: #3e3e3e; 
		overflow-y: scroll;

		.CodeMirror {
			height: 100%;
		}
	}
}

</style>


<template>
<div>
	<div class="container-fluid code-editor-container px-0">
		<div class="row">
			<div 
				v-if="Messages.IsErrorAlertVisible"
				class="col-12 cta-alert alert text-dark alert-warning fade bg-warning show" 
				role="alert"				
				>
					<span 
						v-html="Messages.ErrorMessage"
					></span>
					<span 
						v-if="Messages.ErrorSource != null && Messages.ErrorSource != ''"
						v-html="Messages.ErrorSource"
					></span>
					<button 
						@click="ClearError"
						type="button" 
						class="close text-dark" 
						aria-label="Close">
							<span aria-hidden="true">&times;</span>
					</button>
			</div>
		</div>

		<form>
			<div class="row">
				<div class="col-xs-12 col-md-6 form-group pr-0">
					<select 
						:disabled="FormIsDirty"
						v-model="FormId"
						class="form-control" 
						name="FormSelectList" 
						@change="UpdateFormSelectionEvent()"
					>
						<option value="-1">-- Select Form --</option>
						<option v-if="InProcessIndicators.EditingNew || InProcessIndicators.EditingProperties" value="0">{{ NewFormName }}</option>
						<option v-for="(f, index) in this.Forms.List" 
							:key="index" 
							:value="f.FormId"
						>
							{{ f.FormName }} ({{ f.FormId }})
						</option>
					</select>
				</div>
				<div class="col-xs-12 col-md-6 form-group">

					<button 
						type="button"
						@click="NewFormEvent" 
						class="btn"
						:disabled="FormIsDirty || InProcessIndicators.EditingNew"
					>New</button>
					
					<button 
						type="button"
						@click="EditFormEvent" 
						class="btn"
					>Properties</button>
					
					<button 
						type="button"
						@click="DeleteFormEvent" 
						class="btn float-right"
						:disabled="FormId <= 0"
					>Delete</button>

					<button 
						type="button"
						@click="SyncFormEvent" 
						:disabled="FormId > 0"
						class="btn float-right mr-3"
					>Sync</button>

				</div>
			</div>
			<div class="row">
				<div class="col-12 form-group">
					<div 
						class="codemirror-container"
						:style="'height: ' + EditorHeight + 'px'"
					>
						<h6 
							v-if="isReadyOnly"
							style="position: absolute; top: 2rem; left: 2rem; font-family: monospace" 
							class="text-light"
						>Select or create a form to edit</h6>
					
						<div 
							v-if="InProcessIndicators.Loading || InProcessIndicators.Saving"
							class="progress"
						>
							<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
						</div>						

						<codemirror 
							v-model="JSCode" 
							:options="cmOptions"
							:style="isReadyOnly ? 'visibility: hidden;' : ''"
							@changes="CodeChangesEvent"
						></codemirror>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-12 form-group">

					<button 
						type="button"
						@click="PreviewEvent" 
						class="btn"
						:disabled="!InProcessIndicators.Editing"
					>Preview {{ ShowPreview ? "Off" : "On" }}
					</button>

					<button 
						type="button"
						@click="ToggleFullScreenEvent" 
						class="btn"
					>Full Screen {{ FullScreen ? "Off" : "On" }}
					</button>

					<div class="form-check form-check-inline pl-3">
						<input 
							class="form-check-input" 
							type="checkbox" 
							:disabled="FormIsDirty"
							@change="RefreshForms"
							v-model="ShowInactiveForms"
							id="ShowInactiveCheckbox">
						<label class="form-check-label" for="ShowInactiveCheckbox">
							Show Inactive Forms
						</label>
					</div>

					<button 
						type="button"
						@click="SaveEvent" 
						:disabled="!FormIsDirty"
						class="btn float-right"
					>Save</button>

					<button 
						type="button"
						@click="CancelEvent" 
						:disabled="!FormIsDirty"
						class="btn float-right mx-2"
					>Cancel</button>

				</div>
			</div>
		</form>	

		<div 
			class="row" 
			v-if="ShowPreview && InProcessIndicators.Editing"
		>
			<div class="col-12">
				<div class="card form-preview">
					<div class="card-body p-0">
						<div class="card-title mb-0" style="padding: 1rem; background-color: #efefef; height: 4.0rem">
							<div class="h5 float-left">Form Preview</div>
							<button 
								type="button" 
								@click="RefreshPreviewEvent"
								class="btn btn-secondary float-right"
							>
								Refresh
							</button>
						</div>
					</div>					
				</div>
			</div>			
		</div>	
	</div>	
	
	<!-- Confirm Modal -->
	<div v-if="ConfirmModal.ShowConfirm" class="modal fade show" id="confirmModal" role="dialog" style="display: inline">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="confirmModalLabel">{{ ConfirmModal.Title }}</h5>
					<button @click="ConfirmCancelClick" type="button" class="close" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					{{ ConfirmModal.Text }}
				</div>
				<div class="modal-footer">
					<button type="button" @click="ConfirmCancelClick" class="btn btn-secondary">No</button>
					<button type="button" @click="ConfirmOkClick" class="btn btn-primary">Yes</button>
				</div>
			</div>
		</div>
	</div>	

	<!-- Form Properties Modal -->
	<div v-if="FormPropertiesModal.ShowDialog" class="modal fade show" id="FormPropertiesModal" role="dialog" style="display: inline">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="FormPropertiesModalLabel">{{ InProcessIndicators.EditingNew ? 'New Form' : 'Edit Form'}}</h5>
					<button @click="FormPropertiesCancelClick" type="button" class="close" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<form class="container" novalidate="" id="PropertiesForm">
						<div class="form-group">
							<label>Form Name</label>
							<input type="text"
								ref="FormNameTextBox"
								v-model="SelectedForm.Settings.FormName"
								class="form-control"
								placeholder="My Sample Form"
								maxlength="50"
								required
							>
							<div class="invalid-feedback">A form name is required.</div>							
							<div class="text-secondary float-right" style="font-style: italic; font-size: .75rem">This value is only used in the admin interface</div>
						</div>					
						<div class="form-group">
							<label>Description</label>
							<textarea 
								v-model="SelectedForm.Settings.FormDescription"
								placeholder="A brief description of this form"
								class="form-control" 
								rows="3"
								maxlength="255"
							></textarea>
						</div>					
						<div class="form-group">
							<label>Instructions</label>
							<textarea 
								v-model="SelectedForm.Settings.Instructions"
								placeholder="Instructions on how to complete this form"
								class="form-control" 
								rows="3"
								maxlength="255"
							></textarea>						
						</div>
						<div class="form-group">
							<label>Binding ID</label>
							<input type="text"
								v-model="SelectedForm.Settings.BinderKey"
								class="form-control"
								placeholder="Leave blank to use AutoBinder"
								maxlength="50"
							>
						<div class="form-check mt-3">
							<input 
								class="form-check-input" 
								type="checkbox" 
								v-model="SelectedForm.Settings.IsActive"
								id="IsActiveCheckbox">
							<label class="form-check-label" for="IsActiveCheckbox">
								Is Active
							</label>
						</div>					
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" @click="FormPropertiesCancelClick" class="btn btn-secondary">Cancel</button>
					<button type="button" @click="FormPropertiesOkClick" class="btn btn-primary">OK</button>
				</div>
			</div>
		</div>
	</div>	
</div>
</template>
