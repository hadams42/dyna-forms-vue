require("babel-core/register");
require("idempotent-babel-polyfill");

import '../src/styles/dyna-form-admin.scss'
import Vue from "vue";
import FormEditor from "./components/FormEditor.vue";

Vue.config.productionTip = false;
window["RenderFormEditor"] = function(ElementName) {

	//Perform initial configuration as needed

	//Render master Vue component
	new Vue({
		render: h => h(FormEditor, {
			props: {
				// propName: value,
			},
			on: {
				input: function(e) {
				}
			},
		}) 
	}).$mount(ElementName);

}


