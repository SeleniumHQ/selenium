var FileUtils = {
	getProfileDir: function() {
		return Components.classes["@mozilla.org/file/directory_service;1"]
		  .getService(Components.interfaces.nsIProperties)
		  .get("ProfD", Components.interfaces.nsILocalFile);
	},
	
	getUnicodeConverter: function(encoding) {
		var unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		try {
			unicodeConverter.charset = encoding;
		} catch (error) {
			throw "setting encoding failed: " + encoding;
		}
		return unicodeConverter;
	},
	
	openFileOutputStream: function(file) {
		var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		stream.init(file, 0x02 | 0x08 | 0x20, 420, 0);
		return stream;
	},

	openFileInputStream: function(file) {
		var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		stream.init(file, 0x01, 00004, 0);
		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
		sis.init(stream);
		return sis;
	},

	openURLInputStream: function(url) {
		const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
		var stream = ioService.newChannelFromURI(ioService.newURI(url, null, null)).open();
		var sis = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
		sis.init(stream);
		return sis;
	},

	readFile: function(file) {
		var stream = this.openFileInputStream(file);
		var content = stream.read(stream.available());
		stream.close();
		return content;
	},

	readURL: function(url) {
		var stream = this.openURLInputStream(url);
		var content = stream.read(stream.available());
		stream.close();
		return content;
	}
}
