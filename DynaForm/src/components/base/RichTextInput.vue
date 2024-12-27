<template>
		<b-form-group 
			:class="['rich-text-input', name ]"
			v-show="DisplayValues.visible"
		>
			<component-label
				:forId="name"
				:text="DisplayValues.label"
				:helpText="helpText"
				:helpUrl="helpUrl"
				:kpiText="kpiText"
				:kpiTitle="kpiTitle"
				:numberLabel="numberLabel"
				:locked="this.DisplayValues.locked !== false && (computedReadOnly || DisplayValues.readonly)"
				:lockMessage="DisplayValues.readonlyMessage"
				:unlockable="!(formReadOnlyLock || readOnlyLock)"
				:requiredField="rules != null && rules.required == true ? true : false"
				:isAdmin="this.isAdmin"
				:adminUnlockable="this.adminUnlockable"
				@locked="onLockToggle()"				
			>
			</component-label>
			
			<div 
				:class="['form-control readonly', 'input-' + DisplayValues.size]"
				v-if="computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null)"
				:style="getReadOnlyStyle()"
				@click="onLockToggle(false)"
				v-html="valueModel"
			></div>


			<div class="editor">
				<editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
					<div class="menubar">
						<div class="toolbar">
							
							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.bold() }"
								@click="commands.bold"
							>
								<i class="fas fa-bold"></i>
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.italic() }"
								@click="commands.italic"
							>
								<i class="fas fa-italic"></i>
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.strike() }"
								@click="commands.strike"
							>
								<i class="fas fa-strikethrough"></i>
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.underline() }"
								@click="commands.underline"
							>
								<i class="fas fa-underline"></i>
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.paragraph() }"
								@click="commands.paragraph"
							>
								<i class="fas fa-paragraph"></i>
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.heading({ level: 1 }) }"
								@click="commands.heading({ level: 1 })"
							>
								H1
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.heading({ level: 2 }) }"
								@click="commands.heading({ level: 2 })"
							>
								H2
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.heading({ level: 3 }) }"
								@click="commands.heading({ level: 3 })"
							>
								H3
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.heading({ level: 4 }) }"
								@click="commands.heading({ level: 4 })"
							>
								H4
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.heading({ level: 5 }) }"
								@click="commands.heading({ level: 5 })"
							>
								H5
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.link() }"
								@click="commands.link"
							>
								<i class="fas fa-link"></i>
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.bullet_list() }"
								@click="commands.bullet_list"
							>
								<i class="fas fa-list-ul"></i>
							</button>

							<button
								class="menubar__button"
								:class="{ 'is-active': isActive.ordered_list() }"
								@click="commands.ordered_list"
							>
								<i class="fas fa-list-ol"></i>
							</button>

							<button
								class="menubar__button"
								@click="commands.horizontal_rule"
							>
								<i class="fas fa-grip-lines"></i>
							</button>

							<button
								class="menubar__button"
								@click="commands.undo"
							>
								<i class="fas fa-undo-alt"></i>
							</button>

							<button
								class="menubar__button"
								@click="commands.redo"
							>
								<i class="fas fa-redo-alt"></i>
							</button>							

							<button
								class="menubar__button"
								@click="showHtml"
							>
								<i class="fas fa-code"></i>
							</button>							
						</div>
					</div>
				</editor-menu-bar>

				<editor-content 
					class="editor__content" 
					:editor="editor"
				 />
			</div>


			<!-- <b-textarea
				v-if="DisplayValues.multiline == true && !(computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null))"
				:id="name"
				:name="name"
				v-model="valueModel"
				:placeholder="placeholder"
				:rows="DisplayValues.rows"
				:max-rows="DisplayValues.maxRows"
				:state="validationState"
				:class="customClasses"
				:autofocus="autoFocusField==name ? true : false"
				:size="DisplayValues.size"
				:no-resize="noResize"
				@change="fieldChangeEvent($event)"
				:maxLength="DisplayValues.maxLength*4"
			>
    	</b-textarea> -->

			<!-- <b-form-input 
				v-if="DisplayValues.multiline == false && !(computedReadOnly && (DisplayValues.readonlyOverride == true || DisplayValues.readonlyOverride == null))"
				:id="name"
				type="text"
				:state="validationState"
				:size="DisplayValues.size"
				:name="name"
				:value="valueModel"
				:autofocus="autoFocusField==name ? true : false"
				@focus.native="$event.target.select()"				
				:class="customClasses"
				:style="{'color': DisplayValues.color, 'background-color': DisplayValues.backgroundColor, 'max-width': DisplayValues.maxWidth > 0 ? DisplayValues.maxWidth + 'px' : 'unset' }"
				@change="fieldChangeEvent($event)"
				@input="fieldInputEvent"
				:placeholder="placeholder"
				v-on:keyup.enter="enterPressed"
				:maxLength="DisplayValues.maxLength"
			></b-form-input> -->
			
			<b-form-invalid-feedback>
				<ul
					v-if="this.Validation.Status  > 0 && this.Validation.MessageList.length > 0"
					class="help-block list-unstyled" 
					style="padding-left: 4px; margin-bottom: 0"
				>
					<li v-for="(msg, index) in this.Validation.MessageList"
						:key="index"
					>
					{{msg.Label}}
						<a 
							:href="msg.Url"
							v-if="msg.Url != null"
						><span class="glyphicon glyphicon-question-sign"></span></a>
					</li>
				</ul>
			</b-form-invalid-feedback>
		</b-form-group>
</template>

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
import {
  Blockquote,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  Bold,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions'

import validationMixin from "../shared/ValidationMixin.js";
import baseInputMixin from "../shared/BaseInputMixin.js";
import ComponentLabel from "../shared/ComponentLabel";

export default {
  name: 'RichTextInput',
	
	components: { ComponentLabel, EditorContent, EditorMenuBar },
	
	props: [
		],
	
	data () {
		return {

			editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new Link(),
          new Bold(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
				],
				onUpdate: function() { this.editorUpdated() }.bind(this),
      }),

			DisplayValues: {
				readonlyShowAll: this.readonlyShowAll == null ? true : this.readonlyShowAll,
				readonly: this.readonly == null ? false : this.readonly,
				name: this.name,
				label: this.label,
				visible: this.visible == null ? true : this.visible,				
			},
		}
	},

	mixins: [baseInputMixin, validationMixin],

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		editorUpdated: function() {
			if (this.editor != null) {
				this.valueModel = this.editor.getHTML();
			}
		},

		//--------------------------------------------------------------------------------------------
		showHtml: function() {
			if (this.editor != null) {
				var result = window.prompt("Copy or paste raw HTML below:", this.editor.getHTML());
				if (result != null && result != "") {
					this.valueModel = result ;
					this.updateEditor();
				}
			}
		},

		//--------------------------------------------------------------------------------------------
		updateEditor: function() {
			this.$nextTick(function() {
				this.editor.setContent(this.valueModel, false);
			});
		},

		//--------------------------------------------------------------------------------------------
		focusEditor: function() {
			this.$nextTick(function() {
				this.editor.focus();
			});
		},

		//--------------------------------------------------------------------------------------------
		renderField: function(watchedField, clearValue, focus) {
			//watchedField is the field that changed and triggered this render.
			if (clearValue) {
				this.valueModel = "";
				this.editor.setContent(null, false);
			}
			
			if (focus) {
				this.focusEditor();
			}

			if (this.enableLocalStorage) {
				var savedValue = localStorage[this.formType + "__" + this.name];
				this.fieldChangeEvent(savedValue == null ? this.defaultValue : savedValue);
			}

			//Call enableServerRender if enabled
			if (this.enableServerRender == true) {
				if (this.onRender != null && this.onRender != "") {
					console.log("WARNING: Local event 'onRender' ignored when enableServerRender is enabled. [" + this.name + "]");
				}
				//Call server render interface
				var p = this.findParent();
				this.ServerInterface.RenderField(this,
					this.instanceId,
					this.name,
					watchedField,
					this.DisplayValues,
					p.ActiveFormData,
					function() {
						this.updateEditor();
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
				this.updateEditor();
				return;
			} 

			//Else, call local onRender if specified
			else if (this.onRender != null && this.onRender != "") {
				var p = this.findParent(); 
				this.onRender.call(this,
					this.DisplayValues,
					p.ActiveFormData,
					watchedField,
					function() {
						//Success code here
						this.updateEditor();
						this.onAfterRenderEvent();
					}.bind(this)
					,function(e) {
						console.log("Error: ", e, this.name);
					}.bind(this)
				);
			} else {
				this.updateEditor();
				this.onAfterRenderEvent();
			}
		},
		

	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	mounted: function() {
	},


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
  beforeDestroy() {
    this.editor.destroy()
	},
	
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	computed: {
		valueModel: {
			get () { return (!this.value) ? null : this.value },
			set (v) { this.$emit('change', v) },
		},

	}
}
</script>