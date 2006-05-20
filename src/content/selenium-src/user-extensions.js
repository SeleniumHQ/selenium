var userExtensionsURL = getQueryParameter("userExtensionsURL");
var baseURL = getQueryParameter("baseURL");

if (userExtensionsURL) {
	var urls = userExtensionsURL.split(/,/);
	for (var i = 0; i < urls.length; i++) {
		var url = urls[i];
		document.write('<script src="' + url + '" language="JavaScript" type="text/javascript"></script>');
	}
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

// Replace clickElement to prevent double-popup
MozillaPageBot.prototype.clickElement = function(element) {
    triggerEvent(element, 'focus', false);

    // Trigger the click event.
    triggerMouseEvent(element, 'click', true);

    if (this.windowClosed()) {
        return;
    }

    triggerEvent(element, 'blur', false);
};

