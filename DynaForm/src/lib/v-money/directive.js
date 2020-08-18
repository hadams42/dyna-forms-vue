import {format, setCursor, event} from './utils'
import assign from './assign'
import defaults from './options'
import { Utilities } from "../../Utilities.js";

export default function (el, binding) {
  if (!binding.value) return
  var opt = assign(defaults, binding.value)

  // v-money used on a component that's not a input
  if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
    var els = el.getElementsByTagName('input')
    if (els.length !== 1) {
      // throw new Error("v-money requires 1 input, found " + els.length)
    } else {
      el = els[0]
    }
  }

  el.oninput = function () {
		//el.value = format(el.value, opt)

		var utilities = new Utilities();
		var precision = opt.precision;
		var valueFloat = el.value == "" ? 0 : parseFloat(el.value.replace(/,/g, ''));
		el.value = utilities.FormatFixedNumber(valueFloat, precision);
    el.dispatchEvent(event('change')) // v-model.lazy
  }

  el.onfocus = function () {
		el.select()
  }

  el.dispatchEvent(event('input')) // force format after initialization
}
