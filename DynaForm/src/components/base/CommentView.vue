<template>
	<div class="comment-view" ref="commentViewContainer" > 
		<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:kpiText="kpiText"
				:kpiTitle="kpiTitle"
				:numberLabel="DisplayValues.numberLabel"
				:locked="DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
			>
		</component-label>

		<b-form :class="['comment-section', DisplayValues.isNarrow ? 'narrow' : '']"
						@submit="onSubmit">
			<div 
				v-if="DisplayValues.showAddNew"
				:class="[ 'write-new',  'justify-' + DisplayValues.justify ]"
			>
				<div class="notification-group-container">
					<span>{{notificationCaption}}</span>
					<b-radio-group class="notification-group"
						v-model="notificationSelection"
						:required="true"
					>
						<b-radio v-for="(notice, index) in getNotificationList()"
						:key="index"
						:value="getActiveData(notice.ValueField)"
						>{{getActiveData(notice.NameField)}}</b-radio>
					</b-radio-group>
				</div>
				<b-textarea
					v-model="NewComment"
					:placeholder="placeholder" 
					:readonly="DisplayValues.activeCommentId != -1"
					@blur="onNewCommentBlur()"
					:class="[DisplayValues.activeCommentId != -1 ? 'disabled' : '', 'comment-view-textbox']"						
				>
				</b-textarea>
				<div class="button-group">
					<b-button 
						class="cancel-comment-button"
						v-if="!DisplayValues.autoSave"
						@click="cancelCommentClick()"
						size="sm"
						variant="secondary"
						type="button"
					>Cancel
					</b-button>
					<b-button 
						
						class="add-comment-button"
						size="sm"
						:disabled="NewComment == ''"
						variant="primary"
						type="submit"
					>Add Comment
					</b-button>
				</div>
			</div>
		</b-form>
		</div>


			<div 
				v-for="(comment, index) in DisplayValues.comments"
				:key="index"
				:comment_id="comment.id"
				:class="['comment', getJustifyClass(comment), comment.isSelf ? 'author' : '' ]"
			>
					<div 
						class="info"
					>
							<span class="user-title" :title="comment.title" >{{comment.title}}</span> 
							to 
							<span class="user-name" :title="comment.recipientName" >{{comment.recipientName}}</span>
							<span class="time">{{comment.timestamp}}</span>							
					</div>
					<!-- <a 
						v-if="comment.avatarUrl != null"
						class="avatar" 
						href="#"
					>
							<img :src="comment.avatarUrl" width="35" alt="Avatar" :title="comment.recipientName" />
					</a>
					 -->

					<div 
						:class="[comment.isRead==false && comment.isSelf==false ? 'unread' : 'read', 'comment-text']" 
					>
						<div 
							v-if="isActive(comment) == false && comment.isNew != true" 
						>
							<span v-if="comment.messageHeading != null"
								:class="['heading', comment.messageAlert == true ? 'heading-alert' : '']" 
							>{{comment.messageHeading}}</span>
							{{getSummary(comment)}}
							<a v-if="comment.collapsed==true" @click="summaryShowAllEvent(comment)" href="#" >(Show all)</a>
							<a v-if="comment.collapsed==false" @click="summaryHideEvent(comment)" href="#" >(Hide)</a>
						</div>
						<div v-if="isActive(comment) == true || comment.isNew == true" >
							<b-textarea 
								class="comment-view-textbox"
								v-model="comment.message"
								@blur="comment.isNew == false ? saveEdit(comment) : null"
								:style="{'height': comment.isNew ? '60px' : '', 'border-radius': '5px'}"
								
							></b-textarea>
							<div v-if="comment.isNew == true"
							>
								<b-button 
									@click="saveButton(comment)"
									size="sm"
									:disabled="comment.message == null || comment.message == '' || DisplayValues.autoSave == true"
									variant="primary"
									type="button"
									class="float-right mt-1"
								>Add Comment
								</b-button>
							</div>							
						</div>
					</div>

					<i 
						v-if="comment.flag"
						class="flag fas fa-star" 
					></i>

					<div v-if="getEditMode(comment) && comment.isNew != true"
						class="edit-controls"
					>
						<a @click="editComment(comment)" :class="['edit', isActive(comment) ? 'active' : '']">Edit</a> · 
						<a @click="confirmDelete(comment)" :class="['delete', isActive(comment) ? 'active' : '']">Delete</a> 
						<a @click="saveEdit(comment)" v-if="isActive(comment) == true" :class="['save', isActive(comment) ? 'active' : '']">· Save</a>
					</div>
			</div>

			<div v-if="(DisplayValues.comments == null || DisplayValues.comments.length == 0) && DisplayValues.emptyText != null">
				<p class="read">{{DisplayValues.emptyText}}</p>
			</div>

	</div>
</template>
<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */


import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'CommentView',
		
	components: { ComponentLabel },
	
	props: [
		'comments',
		'justify',
		'maxLength',
		'showAddNew',
		'emptyText',
		'editMode',
		'narrowMode',
		'requestId',
		'onCancelButtonClick',
		'autoSave',
		'notificationList',
		'notificationSelection',
		'notificationCaption'
		],
	
	data () {
		return {
			NewComment: "",
			DisplayValues: {
				label: this.label == null ?  "" : this.label,
				comments: this.comments == null ?  [] : this.comments,
				justify: this.justify == null ? 'alternate' : this.justify,
				maxLength: this.maxLength = null ? 0 : this.maxLength,
				showAddNew: this.showAddNew = null ? true : this.showAddNew,
				emptyText: this.emptyText == null ? null : this.emptyText,
				editMode: this.editMode == null ? "off" : this.editMode.toLowerCase(),
				activeCommentId: -1,
				isActiveCommentDirty: false,
				narrowMode: this.narrowMode == null ? false : this.narrowMode,
				isNarrow: false,
				requestId: this.requestId == null ? -1 : this.requestId,
				autoSave: this.autoSave == null ? false : this.autoSave,
			}
		}
	},

	mixins: [ baseInputMixin ],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		getNotificationList() {
			return this.notificationList.filter((o) => {
					return (this.getActiveData(o.ValueField) != null && this.getActiveData(o.ValueField) != "");
				})
		},

		//--------------------------------------------------------------------------------------------
		onSubmit(e) {
			e.preventDefault()
			this.saveNewComment();
		},

		//--------------------------------------------------------------------------------------------
		onNewCommentBlur: function() {
			if (this.DisplayValues.autoSave) {
				this.saveNewComment();
			}
		},

		//--------------------------------------------------------------------------------------------
		getActiveData: function(field) {
			var p = this.findParent();
			return p.ActiveFormData[field];
		},

		//--------------------------------------------------------------------------------------------
		isActive: function(comment) {
			return this.DisplayValues.activeCommentId != -1 && comment.id == this.DisplayValues.activeCommentId;
		},

		//--------------------------------------------------------------------------------------------
		saveButton: function(comment) {
			if (!this.DisplayValues.autoSave) {
				this.saveNewComment(comment);
			}
		},

		//--------------------------------------------------------------------------------------------
		saveNewComment: function(comment) {
			if (comment == null && this.NewComment != "" && this.NewComment != null) {
				comment =  {
					id: -1,
					message: this.NewComment,
					recipientId: this.notificationSelection,
				}			
			}
			this.performCommentUpdate(comment, function() {
				//do stuff after save
			});
		},

		//--------------------------------------------------------------------------------------------
		cancelCommentClick: function() {
			this.NewComment = "";
 			if (this.onCancelButtonClick != null && this.onCancelButtonClick != "") {
				var p = this.findParent(); 
				this.onCancelButtonClick.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					null,
					function() {
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		editComment: function(comment) {
			// if (this.DisplayValues.isActiveCommentDirty) {
			// 	this.showUnsavedWarning();
			// 	return;
			// }

			this.DisplayValues.isActiveCommentDirty = true;
			this.DisplayValues.originalComment = comment.message;

			if (comment != null && comment.id != null && comment.id >= 0) {
				this.DisplayValues.activeCommentId = comment.id;
			} else {
				this.DisplayValues.activeCommentId = -1;
			}
		},

		//--------------------------------------------------------------------------------------------
		showUnsavedWarning: function() {
			this.showMessageDialog(
				"Unsaved Data", 
				"Please save or cancel changes to the current comment before proceeding.",
				function() {
				}
			);
		},

		//--------------------------------------------------------------------------------------------
		deleteComment: function(comment) {
			comment.message = "";
			this.performCommentUpdate(comment);
		},

		//--------------------------------------------------------------------------------------------
		confirmDelete: function(comment) {
			this.showConfirmDialog(
				"Confirm", //Caption
				"Do you want to delete this comment?", //Message Text
				function() {
					this.deleteComment(comment);
				}.bind(this),
				function() {
					this.DisplayValues.isActiveCommentDirty = false;
					this.DisplayValues.activeCommentId = -1;
				}.bind(this)
			);
		},

		//--------------------------------------------------------------------------------------------
		saveEdit: function(comment) {
			if ((comment.message == null || comment.message.trim() == "") && comment.isNew == false) {
				this.confirmDelete(comment);
				return;
			}
			this.performCommentUpdate(comment);
		},

		//--------------------------------------------------------------------------------------------
		getEditMode: function(comment) {

			if (this.editMode == "off") {
				return false;
			}
			else if (this.editMode == "all") {
				return true;
			}
			else if (this.editMode == "unlocked" && comment.isLocked != 1) {
				return true;
			}

		},


		//--------------------------------------------------------------------------------------------
		performCommentUpdate(comment, callback=null) {
			//If server render is not enabled...
			if (this.enableServerRender == false) {
				this.DisplayValues.comments.push(comment);
				this.$emit('update')
			}	
			//If server render is enabled...
			else {
				this.ServerInterface.UpdateField(this, 
					this.instanceId,
					"comment-view",
					this.name,
					comment.id,
					{
						requestId: this.requestId,
						message: comment.message,
						recipientId: comment.recipientId,
					}, 
					function() { //success
						if (callback == null) {
							this.DisplayValues.isActiveCommentDirty = false;
							this.DisplayValues.activeCommentId = -1;
						} else {
							callback.call(this);
							if (this.comments != null && comment.isNew == false ) {
							}
							this.cancelCommentClick();
						}
						this.renderField();
						this.$emit('update')
					}.bind(this),
					function(e) { //error
						this.showMessageDialog(
							"Cannot save comment", 
							"Please try again. " + e,
							function() {
							}
						);

					}.bind(this)
				);
			}
		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField) {
			//watchedField is the field that changed and triggered this render.
			
			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				if (this.onRender != null && this.onRender != "") {
					console.log("WARNING: Local event 'onRender' ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				//Call server render interface
				var p = this.findParent();
				p.ActiveFormData[this.name] = []
				this.ServerInterface.RenderField(this,
					this.instanceId,
					this.name,
					watchedField,
					this.DisplayValues,
					p.ActiveFormData,
					function() {
						this.DisplayValues.comments = p.ActiveFormData[this.name];
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} 

			//Else, call local onRender if specified
			else if (this.onRender != null && this.onRender != "") {
				var p = this.findParent(); 
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function() {
						this.updateComments();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);			
				this.updateComments();
				this.onAfterRenderEvent();
			} 
			else {
				this.updateComments();
				this.onAfterRenderEvent();
			}
		},
		
		//--------------------------------------------------------------------------------------------
		updateComments: function() {
		},		

		//--------------------------------------------------------------------------------------------
		getSummary: function(comment) {
			if (comment.message != null && comment.message.length > this.DisplayValues.maxLength + 25 && (comment.collapsed == true || comment.collapsed == null )) {
				comment.collapsed = true;
				var i = comment.message.substring(0, this.DisplayValues.maxLength).lastIndexOf(" ");
				if (this.DisplayValues.maxLength - i > 15) i = this.DisplayValues.maxLength;
				return comment.message.substring(0, i);
			} 
			else {
				return comment.message;
			}
		},

		//--------------------------------------------------------------------------------------------
		summaryShowAllEvent: function(comment) {
			comment.collapsed = false;
			this.$forceUpdate();
		},

		//--------------------------------------------------------------------------------------------
		summaryHideEvent: function(comment) {
			comment.collapsed = true;
			this.$forceUpdate();
		},

		//--------------------------------------------------------------------------------------------
		getJustifyClass: function(comment) {
			switch (this.DisplayValues.justify.toLowerCase()) {
				case "left":
					return 'left-comment';
				case "right":
					return 'right-comment';
				case "alternate":
					return comment.isSelf ? 'right-comment' : 'left-comment'
			}			
		}

	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {


		if (this.DisplayValues.narrowMode == "auto") {
			window.addEventListener("resize", function() {
				var containerWidth = this.$refs.commentViewContainer == null ? 400 : this.$refs.commentViewContainer.clientWidth;
				if (containerWidth <= 400) {
					this.DisplayValues.isNarrow =  true;
				} else {
					this.DisplayValues.isNarrow = false;
				}
			}.bind(this));
		}
		else if (this.DisplayValues.narrowMode == true) {
			this.DisplayValues.isNarrow = true;
		} 
		else {
			this.DisplayValues.isNarrow = false;
		}


	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {

	}


}
</script>