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
		} 
	}
}

export const BASE_URL = 
	(location.hostname === "localhost" || location.hostname === "127.0.0.1") ? 	"http://local-dynaform.deltasights.com/" : "//" + location.hostname + ":" + location.port + "/"

