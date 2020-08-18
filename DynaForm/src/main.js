/* The DynaForm Responsive Forms Engine. Copyright 2018 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

require("babel-core/register");
require("idempotent-babel-polyfill");

import Vue from "vue";
import BootstrapVue from "bootstrap-vue"
import DynaContainer from "./components/DynaContainer.vue";
import LiteBus from "./LiteBus"

Vue.config.productionTip = false;
Vue.use(BootstrapVue)
Vue.use(LiteBus)

//=========================================================================================================
//=========================================================================================================
//                                                    DYNA CONTAINER
//=========================================================================================================
//=========================================================================================================
window["DynaCheck"] = function() {
	console.log("RUNNING DYNA FORMS");
}

window["RenderDynaContainer"] = function(
		ElementId, //Element Id
		Settings, //Settings variable
		InstanceId, //InstanceId
		ClearDefaults=false, //Clear defaults (T/F)
		FormGroupId, //FormGroupId
		ComponentUrl, //Url
		ShowInModal, //Show in modal (T/F)
		IsWorkflowActivity=false,
		ModalId,
		ModalCssClass,
		HideModalFormFooter=false
		) {

	//------------------------------------------------
	//Init and render Container 
	//------------------------------------------------
	new Vue({
		render: h => h(DynaContainer, {
			props: {
				elementId: ElementId,
				settings: Settings,
				formGroupId: FormGroupId,
				componentUrl: ComponentUrl,
				name: Settings.name,
				guid: Settings.guid,
				containerInstanceId: InstanceId,
				clearDefaults: ClearDefaults,
				showInModal: ShowInModal,
				modalCssClass: ModalCssClass,
				modalId: ModalId,
				isWorkflowActivity: IsWorkflowActivity == null ? false : IsWorkflowActivity,
				hideModalFormFooter: HideModalFormFooter == null ? false : HideModalFormFooter,
				initialReadOnly: Settings.readOnly == null ? false : Settings.readOnly,
			},
			on: {
				input: function(e) {
				}
			},
		}) 
	}).$mount("#" + ElementId);


}



