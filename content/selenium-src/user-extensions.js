var userExtensionsURL = getQueryParameter("userExtensionsURL");
var baseURL = getQueryParameter("baseURL");

if (userExtensionsURL) {
	document.write('<script src="' + userExtensionsURL + '" language="JavaScript" type="text/javascript"></script>');
}

Selenium.prototype.real_doOpen = Selenium.prototype.doOpen;

Selenium.prototype.doOpen = function(newLocation) {
	if (baseURL && newLocation) {
		if (!newLocation.match(/^\w+:\/\//)) {
			if (baseURL[baseURL.length - 1] == '/' && newLocation[0] == '/') {
				newLocation = baseURL + newLocation.substr(1);
			} else {
				newLocation = baseURL + newLocation;
			}
		}
	}
	return this.real_doOpen(newLocation);
};
