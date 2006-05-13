var CheckBuilders = {};

CheckBuilders.builders = [];

CheckBuilders.add = function(name, func, noPrefix) {
	this.builders.push({name: name, builder: func, noPrefix: noPrefix});
}

CheckBuilders.getRecorder = function(window) {
	return Recorder.get(window);
}

CheckBuilders.callBuilder = function(builder, window) {
	var command = builder.builder.call(this, window);
	['name', 'target', 'value'].forEach(function(name) {
			if (command[name] == null) command[name] = '';
		});
	command.window = window;
	return command;
}

/*
 * add builders
 */

CheckBuilders.add('open', function(window) {
		var path = window.location.href;
		var base = '';
		var r = /^(\w+:\/\/[\w\.-]+(:\d+)?)\/.*/.exec(path);
		if (r) {
			path = path.substr(r[1].length);
			base = r[1] + '/';
		}
		return {
			command: "open",
			target: path
		};
	}, true);

CheckBuilders.add('textPresent', function(window) {
		var result = { name: "TextPresent" };
		var selection = String(window.getSelection());
		if (selection) {
			result.target = selection;
		} else {
			result.disabled = true;
		}
		return result;
	});

CheckBuilders.add('title', function(window) {
		var result = { name: "Title" };
		if (window.document) {
			result.target = exactMatchPattern(window.document.title);
			result.valueInTarget = true;
		} else {
			result.disabled = true;
		}
		return result;
	});

CheckBuilders.add('value', function(window) {
		var result = { name: "Value" };
		var element = this.getRecorder(window).clickedElement;
		if (element && element.hasAttribute && element.tagName &&
			('input' == element.tagName.toLowerCase() || 
			 'textarea' == element.tagName.toLowerCase() || 
			 element.value)) {
			result.target = this.getRecorder(window).findLocator(element);
			var type = element.getAttribute("type");
			if ('input' == element.tagName.toLowerCase() && 
				(type == 'checkbox' || type == 'radio')) {
				result.value = element.checked ? 'on' : 'off';
			} else {
				result.value = exactMatchPattern(element.value);
			}
		} else {
			result.disabled = true;
		}
		return result;
	});

CheckBuilders.add('table', function(window) {
		var element = this.getRecorder(window).clickedElement;
		var result = { name: "Table" };
		if (element && element.tagName && 'td' == element.tagName.toLowerCase()) {
			var parentTable = null;
			var temp = element.parentNode;
			while (temp != null) {
				if (temp.tagName.toLowerCase() == 'table') {
					parentTable = temp;
					break;
				}
				temp = temp.parentNode;
			}
			if (parentTable == null) {
				result.disabled = true;
				result.target = "(Unavailable: Selection not a cell of a table)";
			} else {
				//first try to locate table by id and then by name
				var tableName = parentTable.id;
				if (!tableName) {
					tableName = parentTable.name;
				}
				if (!tableName) {
					result.disabled = true;
					result.target = "(Unavailable: Table must have an id declared)";
				} else {
					result.target = tableName + '.' + element.parentNode.rowIndex + '.' + element.cellIndex;
					result.value = exactMatchPattern(element.innerHTML.replace(/^\s*(.*?)\s*$/, "$1"));
				}
			}
		} else {
			result.disabled = true;
		}
		return result;
	});


