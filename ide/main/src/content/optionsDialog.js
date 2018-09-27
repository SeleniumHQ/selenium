/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

this.Preferences = SeleniumIDE.Preferences;

function saveOptions() {
  var options = this.options;
  var name;
  for (name in options) {
    var e = document.getElementById(name);
    if (e != null) {
      options[name] = e.checked != undefined ? e.checked.toString() : e.value;
    }
  }
  if (options.enableExperimentalFeatures.toLowerCase() != 'true' && options.selectedFormat != 'default') {
    if (!confirm(Message("options.confirmFormatDisable"))) {
      return false;
    }
  }
  updateFormatOptions();
  options['locatorBuildersOrder'] = this.locatorBuilderList.getListItems().join(',');
  this.pluginManager.updatePlugins(this.plugins);
  this.pluginManager.save(options);
  SeleniumIDE.Loader.getEditors().forEach(function(editor) {
    editor.app.setOptions(options);
  });
  Preferences.save(options);
  return true;
}

function loadFromOptions(options) {
  var key;
  for (key in options) {
    var e = document.getElementById(key);
    if (e != null) {
      if (e.checked != undefined) {
        e.checked = options[key] == 'true';

        //initialize the reload-button state
        if (key == "showDeveloperTools") {
          updateReloadButton(e.checked);
        }
      } else {
        e.value = options[key];
      }
    }
  }
}

function loadDefaultOptions() {
  if (confirm(Message("options.confirmLoadDefaultOptions"))) {
    loadFromOptions(Preferences.DEFAULT_OPTIONS);
    validate()
    for (key in this.options) {
      if (/^formats\./.test(key)) {
        delete this.options[key];
      }
    }
    if (this.format) {
      showFormatDialog();
    }
    if (this.locatorBuilderList) {
      //By design the new locators will be temporarily lost. The missing locators will be automatically added when the options are saved
      this.locatorBuilderList.reload(options['locatorBuildersOrder'].split(','));
    }
    //TODO set plugin defaults
  }
}

function getPluginManager(options) {
  var editor = SeleniumIDE.Loader.getTopEditor();
  if (editor && editor.pluginManager) {
    return editor.pluginManager;
  }
  return new PluginManager(options);
}

function loadOptions() {
  var options = Preferences.load();
  this.options = options;
  loadFromOptions(options);
  this.pluginManager = getPluginManager(options);
  this.formats = new FormatCollection(options, this.pluginManager);

  loadFormatList();
  //Samit: Enh: Selected the options of the current format if available
  if (this.formats.findFormat(options.selectedFormat)) {
    selectFormat(options.selectedFormat);
  } else {
    selectFormat('default');
  }

  //Convert our normal listbox into a drag and drop reordered listbox
  this.locatorBuilderList = new DnDReorderedListbox(window.document.getElementById('locatorBuilder-list'), options['locatorBuildersOrder'].split(','));
  this.pluginErrors = this.pluginManager.errors;
  this.plugins = this.pluginManager.getPluginCollection();
//  this.plugins.callWhenReady(loadPluginList, this); //Samit: Enh: Work with async Addon Manager for Firefox 4
  loadPluginsWhenReady(this.plugins, this); //For some reason the above call stopped working, my guess is it is due to a different window context
}

function loadPluginsWhenReady(plugins, win) {
  if (!plugins.isReady()) {
    setTimeout(function() {
      loadPluginsWhenReady(plugins, win);
    }, 100);
  } else {
    win.loadPluginList();
  }
}

function loadFormatList() {
  var list = getClearedList("format-list");
  for (var j = 0; j < this.formats.formats.length; j++) {
    var format = this.formats.formats[j];
    list.appendItem(format.name, format.id);
  }
}

var encodingTestConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

function chooseFile(target) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window, "Select extensions file", nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterAll);
  var res = fp.show();
  if (res == nsIFilePicker.returnOK) {
    var e = document.getElementById(target);
    if (e.value) {
      e.value += ', ' + fp.file.path;
    } else {
      e.value = fp.file.path;
    }
  }
}

function updateFormatOptions() {
  if (this.format && this.format.options) {
    for (key in this.format.options) {
      var e = document.getElementById("options_" + key);
      if (e) {
        if (e.checked != undefined) {
          this.options["formats." + this.formatInfo.id + "." + key] = e.checked.toString();
        } else {
          this.options["formats." + this.formatInfo.id + "." + key] = e.value;
        }
      }
    }
  }
}

function selectFormat(id) {
  document.getElementById("format-list").value = id;
  updateFormatSelection();
}

function updateFormatSelection() {
  this.updateFormatOptions();
  this.showFormatDialog();
}

function showFormatDialog() {
  var formatListBox = document.getElementById("format-list");
  var formatId;
  if (formatListBox.selectedItem) {
    formatId = formatListBox.selectedItem.value;
  } else {
    formatId = 'default';
  }
  var formatInfo = this.formats.findFormat(formatId);

  document.getElementById("format-name").value = formatInfo.name;
  document.getElementById("delete-button").disabled = formatInfo.saveFormat ? false : true;
  document.getElementById("rename-button").disabled = formatInfo.saveFormat ? false : true;

  var configBox = document.getElementById("format-config");
  var format;
  try {
    format = formatInfo.loadFormatter();
  } catch (error) {
    setTimeout(function() {
      alert("an error occured: " + error + ", file=" + formatInfo.getFormatURI());
    }, 50);
    format = {};
  }
  var newConfigBox;
  if (format.createConfigForm) {
    newConfigBox = format.createConfigForm(document);
  } else {
    newConfigBox = document.createElement("box");
    newConfigBox.setAttribute("id", "format-config");
    var note = document.createElement("description");
    newConfigBox.appendChild(note);
    note.appendChild(document.createTextNode("There are no options."));
  }
  configBox.parentNode.replaceChild(newConfigBox, configBox);
  configBox = newConfigBox;
  if (format.options) {
    for (key in format.options) {
      var e = document.getElementById("options_" + key);
      if (e) {
        var value = this.options["formats." + formatInfo.id + "." + key];
        if (value == null) {
          value = format.options[key];
        }
        if (e.checked != undefined) {
          e.checked = 'true' == value;
        } else {
          e.value = value;
        }
      }
    }
  }
  var self = this;
  this.format = format;
  this.formatInfo = formatInfo;
  configBox.addEventListener("blur", function(event) {
    self.updateFormatOptions();
  }, true);
}

function openFormatSource() {
  this.formatInfo.saved = false;
  window.openDialog('chrome://selenium-ide/content/format-source-dialog.xul', 'options-format-source', 'chrome', this.formatInfo);
  if (this.formatInfo.saved) {
    updateFormatSelection();
  }
}

function createNewFormat() {
  var formatInfo = new UserFormat();
  window.openDialog('chrome://selenium-ide/content/format-source-dialog.xul', 'options-format-source', 'chrome', formatInfo);
  if (formatInfo.saved) {
    this.formats.reloadFormats();
    loadFormatList();
    selectFormat(formatInfo.id);
  }
}

function findFormatIndex(formatInfo) {
  return -1;
}

function deleteFormat() {
  if (!confirm("Really delete this format?")) {
    return;
  }
  var index = -1;
  if (!this.formatInfo) return;
  var formats = this.formats.userFormats;
  for (var i = 0; i < formats.length; i++) {
    if (formats[i].id == this.formatInfo.id) {
      index = i;
      break;
    }
  }
  if (index >= 0) {
    this.formats.removeUserFormatAt(index);
    this.formats.saveFormats();
    loadFormatList();
    selectFormat("default");
  }
}

function renameFormat() {
  var name = prompt("Enter new name", this.formatInfo.name);
  if (name) {
    this.formatInfo.name = name;
    this.formats.saveFormats();
    loadFormatList();
    selectFormat(this.formatInfo.id);
  }
}

function validate() {
  var hasError = false;
  for (var name in validations) {
    var e = document.getElementById(name);
    var result = validations[name](e.value);
    document.getElementById(name + 'Error').value = result;
    if (result) {
      hasError = true;
    }
  }
  document.documentElement.getButton("accept").disabled = hasError;
}

var validations = {
  encoding: function(value) {
    var result = "";
    try {
      encodingTestConverter.charset = value;
    } catch (error) {
      result = Message("error.invalidEncoding");
    }
    var encoding = value.toUpperCase();
    if (encoding == 'UTF-16' || encoding == 'UTF-32') {
      // Character encodings that contain null bytes are not supported.
      // See http://developer.mozilla.org/en/docs/Reading_textual_data
      // Let me know if there are other encodings.
      result = Message("error.encodingNotSupported", value);
    }
    return result;
  },

  timeout: function(value) {
    if (value.match(/^\d+$/)) {
      return '';
    } else {
      return Message("error.timeoutNotNumber");
    }
  }
};

/**
 * Return a list by id and clear it as well
 * @param listId
 */
function getClearedList(listId) {
  var list = document.getElementById(listId);
  for (var i = list.getRowCount() - 1; i >= 0; i--) {
    list.removeItemAt(i);
  }
  return list;
}

/**
 * Call the reload method of the current editor
 */
function reloadUserExtFile() {
  try {
    SeleniumIDE.Loader.getEditors()[0].reload();
  } catch(e) {
    alert("error :" + e);
  }
}

/**
 * Use to toggle the reload-button state
 */
function updateReloadButton(show) {
  document.getElementById('reload').hidden = !show;
  document.getElementById('reload').disabled = !show;
}

//
// plugins
//
function loadPluginList() {
  var list = getClearedList("plugin-list");
  this.plugins.forEach(function(p) {
    list.appendItem(p.name, p.id);
  });

  if (list.itemCount > 0) {
    selectPlugin(list.getItemAtIndex(0).value);
  }
}

function selectPlugin(id) {
  document.getElementById("plugin-list").value = id;
  showPluginInfo();
}

function updatePluginSelection() {
  showPluginInfo();
}

// TODO - this is a copy/paste from formats/html.js that needs to be moved to a common place
function copyElement(doc, element) {
  var copy = doc.createElement(element.nodeName.toLowerCase());
  var atts = element.attributes;
  var i;
  for (i = 0; atts != null && i < atts.length; i++) {
    copy.setAttribute(atts[i].name, atts[i].value);
  }
  var childNodes = element.childNodes;
  for (i = 0; i < childNodes.length; i++) {
    if (childNodes[i].nodeType == 1) { // element
      copy.appendChild(copyElement(doc, childNodes[i]));
    } else if (childNodes[i].nodeType == 3) { // text
      copy.appendChild(doc.createTextNode(childNodes[i].nodeValue));
    }
  }
  return copy;
}

function showPluginInfo() {
  var pluginId = document.getElementById("plugin-list").value;
  var pluginInfo = this.plugins.findPlugin(pluginId);

  var pluginName = document.getElementById("plugin-name");
  pluginName.value = pluginInfo.name;
  pluginName.className = '';
  var content = '<description>' + pluginInfo.description + '</description>';
  content += '<separator class="thin"/><description>Version ' + pluginInfo.version + '</description>';
  content += '<separator class="thin"/>' + '<description>Created By ' + pluginInfo.creator + '</description>';
  pluginInfo.developers.forEach(function (developer) {
    content += '<description>Developed by ' + developer.name + '</description>';
  });
  if (pluginInfo.homepageURL && pluginInfo.homepageURL.length > 0) {
    content += '<label class="text-link" href="' + pluginInfo.homepageURL + '" value="Visit website" />';
  }
  content += '<separator class="thin"/><checkbox id="disablePlugin" label="Disable code provided by this plugin"/>';
  content += '<description>A restart of Selenium IDE is required if changed.</description>';
  if (pluginInfo.data.options.autoDisabled) {
    pluginName.className = 'pluginError';
    content += '<description class="error">There were errors loading this plugin. The plugin provided code has been disabled. Clear the disabled checkbox if you think the problem has been solved. Please contact the plugin author for fixing this issue.</description>';
  }
  var errors = this.pluginErrors.getPluginErrors(pluginInfo.id);
  if (errors.length > 0) {
    content += '<textbox id="pluginErrors" multiline="true" readonly="true" rows="5" />';
  }
  var infoBox = document.getElementById("plugin-info");
  var xml = '<vbox id="plugin-info" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">' + content + '</vbox>';
  var parser = new DOMParser();
  var element = parser.parseFromString(xml, "text/xml").documentElement;
  // If we directly return this element, "permission denied" exception occurs
  // when the user clicks on the buttons or textboxes. I haven't figured out the reason, 
  // but as a workaround I'll just re-create the element and make a deep copy.
  infoBox.parentNode.replaceChild(copyElement(document, element), infoBox);

  if (errors.length > 0) {
    //TODO improve error reporting by showing more errors and details
    document.getElementById('pluginErrors').value = errors[0].error;
  }
  var checkbox = document.getElementById('disablePlugin');
  checkbox.checked = pluginInfo.data.options.disabled;
  checkbox.addEventListener("click", function(event) {
    pluginInfo.data.options.disabled = checkbox.checked;
  }, false);
}
