<template>
	<span class="async-link"
	@click.stop="clickEvent()"
	>
		<a 
		>
			<slot></slot>
		</a>		  
		<a 
			v-show="false"
			ref="SyncLinkDownload"
			:href="href"
			:download="filename"
			target="_blank"
		>
		</a>
	</span>	
</template>
        
        

<script>
/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import { Utilities } from "../../Utilities.js";
import baseMixin from "./BaseMixin.js";
import { FormModel } from '../../models/form.model';

export default {
	name: 'AsyncLink',
	
  props: [
		'href',
		'filename',
		'title',
		'fileSize',
		'type',
		'onWait',
		'onAfterWait',
		'action',
		'callback',
		'enableAsync',
		'waitMessages',
		'retryMessage',
		],
	
	data () {
		return {
			Utilities: new Utilities(),
			Form: new FormModel(),

			DisplayValues: {
				title: this.title == null ? this.filename : this.title,
				fileSize: this.fileSize == null ? 0 : this.fileSize,
				type: this.type == null ? 'download' : this.type,
				enableAsync: this.enableAsync == null ? true : this.enableAsync,
				retryMessage: this.retryMessage == null ? "Unable to load file. Please try again later." : this.retryMessage,
				waitMessages: this.waitMessages == null ? [
					{ message: "Please wait while the requested file is retrieved from a remote cache.", delayPerGb: 40 },
					{ message: "We're sorry, it is taking longer than expected to retrieve your file.", delayPerGb: 20 },
					{ message: "The file is still not ready. Trying one more time...", delayPerGb: 10 },
				] : this.waitMessages,
		},

			countDownTimeout: null,
			tryCount: 0,
		}
	},

	mixins: [ baseMixin ],


	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//--------------------------------------------------------------------------------------------
		click: function(e, o=null) {
			if (o != null) {
				this.DisplayValues.title = o.title;
				this.DisplayValues.fileSize = o.length;
			}
			this.clickEvent(e);
		},

		//--------------------------------------------------------------------------------------------
		clickEvent: function(e) {
			this.tryCount = 0;
			if (this.onWait != null) {
				this.onWait(this.tryCount);
			}

			if (this.DisplayValues.enableAsync) {
				$('body').addClass('waiting');
				this.checkIfResourceExists();
			} 
			else {
				this.resourceFound();
			}
		},

		//--------------------------------------------------------------------------------------------
		calcDelay(DelayPerGb, FileSize) {
			if (DelayPerGb == null || DelayPerGb == 0) {
				DelayPerGb = 40;
			}

			if (FileSize != null && FileSize > 0) {
				return Math.ceil(FileSize / (1000 * 1000 * 1000) * DelayPerGb);
			} 
			else {
				return 10;
			}
		},

		//--------------------------------------------------------------------------------------------
		showWaitDialog: function(msg = null) {
				this.elapsed = 0;
				this.tryCount++;

				if (this.DisplayValues.waitMessages[this.tryCount-1].message != null && this.DisplayValues.waitMessages[this.tryCount-1].message != "") {
					this.makeToast(this.DisplayValues.waitMessages[this.tryCount-1].message, "Loading " + this.DisplayValues.title + " from cache...", 2000, true);
				}
				this.countDown();
		},

		//--------------------------------------------------------------------------------------------
		countDown: function() {
			var p = this.findParent(); 
			this.countDownTimeout = setTimeout(() => { 
				this.elapsed = this.elapsed + 1;
				p.messageDialog.OkButton.Text = this.calcDelay(this.DisplayValues.waitMessages[this.tryCount-1].delayPerGb, this.DisplayValues.fileSize) - this.elapsed + " s";
				var delay = this.calcDelay(this.DisplayValues.waitMessages[this.tryCount-1].delayPerGb, this.DisplayValues.fileSize);
				if (this.elapsed >= delay) {
					p.messageDialog.Show = false;
					this.checkIfResourceExists();
					clearTimeout(this.countDownTimeout);
				} else {
					console.log("ELAPSED_TIME", this.elapsed, delay)
					clearTimeout(this.countDownTimeout);
					this.countDown();
				}
			}, 1000);
		},

		//--------------------------------------------------------------------------------------------
		checkIfResourceExists: function() {
			clearTimeout(this.countDownTimeout);
			this.Form.DoesUrlExist.call(this, 
				this.href
			).then(function(responseJson) {
				$('body').removeClass('waiting');
				this.resourceFound();
			}.bind(this))
			.catch(function(e) {
				$('body').removeClass('waiting');
				if (e.response == null) {
					this.resourceError(e);
				}
				else {
					if (e.response.status == "404") {
						this.resourceNotFound();
					} else {
						var msg = "";
						if (e.response != null) {
							msg = e.response.statusText;
						} else {
							msg = e;
						}
						this.resourceError(msg);
					}
				}
			}.bind(this));												
		},

		//--------------------------------------------------------------------------------------------
		resourceError: function(e) {
			var p = this.findParent(); 
			p.messageDialog.OkButton.IsLoading = false;
			p.messageDialog.OkButton.Text = "Close";				
			p.showMessageDialog("Unable to load <strong>" + this.DisplayValues.title + "</strong>", "An error has occurred on the server:<br><div style='font-size: small; padding: 1rem; color: #444'>" + e + "</div>Please try again later.");
			if (this.onAfterWait != null) {
				this.onAfterWait();
			}
		},

		//--------------------------------------------------------------------------------------------
		resourceFound: function() {
			if (this.onAfterWait != null) {
				this.onAfterWait();
			}

			try {
				switch(this.DisplayValues.type.toLowerCase()) {
					case "link":
						window.location = this.href;
						break;
					case "download":
						this.$refs.SyncLinkDownload.click();
						break;
					case "action":
						this.performServerAction.call(this, this.action);
						break;
					case "callback":
						if (this.callback != null) {
							this.callback();
						}
						break;
					default:
						this.$refs.SyncLinkDownload.click();
						break;
				}
			}
			catch(e) {
				console.log("ERROR:",e);
			}
		},
		
		//--------------------------------------------------------------------------------------------
		resourceNotFound: function() {
			console.log("NOT FOUND", this.href);
			if (this.tryCount > this.DisplayValues.waitMessages.length - 1) {
				var p = this.findParent(); 
				p.messageDialog.OkButton.IsLoading = false;
				p.messageDialog.OkButton.Text = "Close";				
				this.makeToast(this.DisplayValues.retryMessage, "Error loading " + this.DisplayValues.title, 2000, true);
				//p.showMessageDialog("Unable to load <strong>" + this.DisplayValues.title + "</strong>", this.DisplayValues.retryMessage);
				if (this.onAfterWait != null) {
					this.onAfterWait();
				}
			} 
			else {
				this.showWaitDialog();
			}
		},
		


	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},

}
</script>