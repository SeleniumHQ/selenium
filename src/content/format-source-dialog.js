function loadDialog() {
	this.formatInfo = window.arguments[0];
	document.getElementById('format-name').value = this.formatInfo.name;
	var sourceTextbox = document.getElementById('format-source');
	sourceTextbox.value = this.formatInfo.getSource();
	if (!this.formatInfo.save) {
		// preset format
		sourceTextbox.readonly = true;
		document.getElementById("note").hidden = false;
	}
	if (!this.formatInfo.id) {
		// new format
		document.getElementById("name-box").hidden = false;
	}
}

function saveDialog() {
	if (!this.formatInfo.id) {
		var name = document.getElementById('format-name').value;
		if (name.length > 0) {
			this.formatInfo.name = name;
		} else {
			window.alert("Please specify a name");
			return false;
		}
	}
	this.formatInfo.save(document.getElementById('format-source').value);
	this.formatInfo.saved = true;
	return true;
}
