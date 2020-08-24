/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

export default {

	data () {
		return {
			EventQueue: [],
		}
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	methods: {

		//---------------------------------------------------------------------------------------------------
		onFilterEvent: function(...args) {
			let result = this.$LiteBus.onFiltered(...args);
			this.EventQueue.push(result);
		},
		
		//---------------------------------------------------------------------------------------------------
		onEvent: function(...args) {
			let result = this.$LiteBus.on(...args);
			this.EventQueue.push(result);
		},
		
		//---------------------------------------------------------------------------------------------------
		offEvent: function(...args) {
			this.$LiteBus.off(...args);
		},

		//---------------------------------------------------------------------------------------------------
		emitEvent: function(...args) {
			this.emitEvent2(this, ...args);
		},

		emitEvent2: function(self, ...args) {
			this.$LiteBus.emit(self, ...args);
		},

		//---------------------------------------------------------------------------------------------------
		emitFilterEvent: function(...args) {
			this.emitFilterEvent2(this, ...args);
		},

		emitFilterEvent2: function(self, ...args) {
			this.$LiteBus.emitFiltered(self, ...args);
		},

		//---------------------------------------------------------------------------------------------------
		logEvent: function(...args) {
			this.$LiteBus.log(...args);
		},

		//---------------------------------------------------------------------------------------------------
		clearEvents: function() {
			this.EventQueue.forEach(f => {
				f.off();
			});
		},
			
	},

	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------
	created: function() {
	},	
}


