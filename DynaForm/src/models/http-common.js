/* The DynaForm Responsive Forms Engine. Copyright 2020 by The Infogetics Group, LLC
Licensed under the MIT License | https://opensource.org/licenses/MIT  */

import axios from 'axios';

export const HTTP_CONFIG = {
	ReadSettings: {
		'Accept': 'application/json', 
		crossdomain: true,
		withCredentials: true,
		headers: {
			'Content-Type': 'text/plain',
		} 
	},
	ReadWriteSettings: {
		'Accept': 'application/json', 
		crossdomain: true,
		withCredentials: true,
		headers: {
			'Content-Type': 'application/json',
		} 
	}
}

export const BASE_API_SERVER = function() {
	var apiServer = "localhost/";

	if (window["_Dyna"] != null && window["_Dyna"].apiServer != null && typeof window["_Dyna"].apiServer != "undefined" ) {
		apiServer = window["_Dyna"].apiServer;
		if (apiServer.endsWith("/") == true) apiServer = apiServer.substr(0, apiServer.length-1);
	}
	var url =	(location.hostname === "localhost" || location.hostname === "127.0.0.1") ? 	apiServer : "//" + location.hostname + (location.port != "" && location.port != null && location.port != "80" ? ":" + location.port : "");
	return url;
}

export const IMAGE_PATH = function() {
	var imagePath = "/images/";

	if (window["_Dyna"] != null && window["_Dyna"].imagePath != null && typeof window["_Dyna"].imagePath != "undefined" ) {
		imagePath = window["_Dyna"].imagePath;
		if (imagePath.endsWith("/") == false) imagePath = imagePath + "/";
	}
	return 	imagePath;
}

export const AUTO_REDIRECT_URL = function() {
	var path = "/#NoRedirectSpecified"

	if (window["_Dyna"] != null && window["_Dyna"].autoRedirectUrl != null && typeof window["_Dyna"].autoRedirectUrl != "undefined" ) {
		path = window["_Dyna"].autoRedirectUrl;
	}
	if (path.startsWith("/") == false) {
		path = "/" + path;
	}
	return 	BASE_API_SERVER() + path;
}

