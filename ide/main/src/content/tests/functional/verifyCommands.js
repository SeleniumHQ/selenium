function loadTestSuite() {
	var editor = SeleniumIDE.Loader.getTopEditor();
    /*
	var BrowserBot = window.top.BrowserBot;
	var originalModify = BrowserBot.prototype.modifyWindowToRecordPopUpDialogs;
	BrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(windowToModify, browserBot) {
		originalModify.call(this, windowToModify, browserBot);
		SeleniumIDE.Loader.getRecorder(windowToModify).reattachWindowMethods();
	}
    */
}

function startRecording() {
	var editor = SeleniumIDE.Loader.getTopEditor();
	editor.loadDefaultOptions();
	editor.getOptions().recordAssertTitle = 'false';
	editor.clear(true);
    editor.topWindow = editor.lastWindow = window.top.document.getElementById('selenium_myiframe').contentWindow;
	editor.setRecordingEnabled(true);
}

function loadTest() {
	var editor = SeleniumIDE.Loader.getTopEditor();
    if (editor) {
        editor.setRecordingEnabled(false);
    }
    var iframe = document.getElementById('testCase');
	iframe.addEventListener('load', verifyCommands, false);
	iframe.src = 'chrome://selenium-ide/content/tests/functional/' + location.hash.substring(1);
}

function verifyCommands() {
	var testDoc = document.getElementById('testCase').contentDocument;
	var table = testDoc.getElementsByTagName('table')[0];
	var rows = table.getElementsByTagName('tr');
	var editor = SeleniumIDE.Loader.getTopEditor();
	var recordedCommands = editor.getTestCase().commands;
	var recordedIndex = 0;
	for (var i = 2; i < rows.length; i++) {
		var row = rows[i];
		var cols = row.getElementsByTagName('td');
		if (cols.length > 0) {
			var command = {};
			command.command = getText(cols[0]);
			if (cols.length > 1) command.target = getText(cols[1]);
			if (cols.length > 2) command.value = getText(cols[2]);
			if (command.target.indexOf('verifyCommands.html') >= 0) {
				break;
			}
			if (command.command != 'pause' && 
				command.command != 'setTimeout' &&
				command.command != 'close') { // these commands are currently not recorded by Selenium IDE
				if (command.command == 'selectWindow' && command.target == 'null') {
					// This is frame for application. Selenium IDE should record this window as 'selenium_myiframe'.
					command.target = 'name=selenium_myiframe';
				}
				if (recordedCommands.length <= recordedIndex || 
					!sameCommand(command, recordedCommands[recordedIndex])) {
					setResult('Failed: command is not same: recordedIndex = ' + recordedIndex + ', sourceIndex = ' + i + ', recorded=' + dumpCommand(recordedCommands[recordedIndex]) + ', source=' + dumpCommand(command));
					return;
				}
				recordedIndex++;
			}
		}
	}
	if (recordedIndex != recordedCommands.length) {
		setResult('Failed: too many commands are recorded');
	} else {
		setResult('Success');
	}
}

function dumpCommand(command) {
    if (command) {
        return "|" + command.command + "|" + command.target + "|" + command.value + "|";
    } else {
        return "";
    }
}

function sameCommand(c1, c2) {
	var matched = true;
	['command', 'target', 'value'].forEach(function(prop) {
			if (c1[prop] != c2[prop]) {
				matched = false;
			}
		});
	return matched;
}

function setResult(result) {
	document.getElementById('result').innerHTML = result;
}
