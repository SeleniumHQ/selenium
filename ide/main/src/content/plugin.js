/*
 */
function PluginManager(options) {
  this.pluginsData = null;
  this.disableBadPluginCode = true;
  this.disableBadPluginAddon = true;
  this.load(options);
  this.errors = PluginManager.Errors;
}

PluginManager.prototype.load = function(options) {
  this.options = options;
  this._installedPlugins = null;
  this._enabledPlugins = null;
  this.disableBadPluginCode = (options['disableBadPluginCode'] && options['disableBadPluginCode'].toLowerCase() === 'true');
  this.disableBadPluginAddon = (options['disableBadPluginAddon'] && options['disableBadPluginAddon'].toLowerCase() === 'true');
  this.pluginsData = JSON.parse(options.pluginsData);
};

PluginManager.prototype.save = function(options) {
  this.options.pluginsData = JSON.stringify(this.pluginsData);
  if (options) {
    options.pluginsData = this.options.pluginsData;
  } else {
    Preferences.save(this.options, "pluginsData");
  }
};

PluginManager.prototype.updatePluginOptions = function(id, pluginOptions) {
  var plugins = this.pluginsData;
  for (var i = 0; i < plugins.length; i++) {
    if (id == plugins[i].id) {
      plugins[i].options = pluginOptions;
      break;
    }
  }
  this._installedPlugins = null;
  this._enabledPlugins = null;
};

PluginManager.prototype.updatePlugins = function(pluginCollection) {
  var self = this;
  pluginCollection.forEach(function(plugin) {
    if (!plugin.data.options.disabled) {
      plugin.data.options.autoDisabled = false;
    } else if (self.disableBadPluginAddon && plugin.addon) {
      plugin.addon.userDisabled = true;
    }
    self.updatePluginOptions(plugin.id, plugin.data.options);
  });
};

PluginManager.prototype.getInstalledPlugins = function() {
  if (!this._installedPlugins) {
    this._installedPlugins = this.pluginsData.filter(function (plugin) {
      return plugin.installed;
    });
  }
  return this._installedPlugins;
};

PluginManager.prototype.getEnabledPlugins = function() {
  if (!this._enabledPlugins) {
    this._enabledPlugins = this.getInstalledPlugins().filter(function (plugin) {
      return !plugin.options.disabled;
    });
  }
  return this._enabledPlugins;
};

PluginManager.prototype.getEnabledPluginsCode = function(key) {
  return this.getEnabledPlugins().map(function(plugin) {
    return {
      id: plugin.id,
      code: plugin.code[key]
    };
  });
};

PluginManager.prototype.getEnabledIDEExtensions = function() {
  return this.getEnabledPluginsCode('ideExtensions');
};

PluginManager.prototype.getEnabledUserExtensions = function() {
  return this.getEnabledPluginsCode('userExtensions');
};

PluginManager.prototype.getEnabledFormatters = function() {
  return this.getEnabledPluginsCode('formatters');
};

PluginManager.prototype.getPluginCollection = function() {
  return new PluginCollection(this.getInstalledPlugins());
};

PluginManager.prototype.autoDisablePlugin = function(id) {
  if (this.disableBadPluginCode) {
    var plugins = this.pluginsData;
    for (var i = 0; i < plugins.length; i++) {
      if (id == plugins[i].id) {
        plugins[i].options.disabled = true;
        plugins[i].options.autoDisabled = true;
        this._enabledPlugins = null;
        this.save();
        if (this.disableBadPluginAddon) {
          new Plugin(plugins[i], function(plugin) {
            if (plugin.addon) {
              plugin.addon.userDisabled = true;
            }
          });
        }
        break;
      }
    }
  }
};

PluginManager.prototype.setPluginError = function(pluginId, code, error) {
  this.errors.addPluginError(pluginId, code, error);
  this.autoDisablePlugin(pluginId);
};

PluginManager.prototype.runDiagnostic = function() {
  return {
    pluginsData: this.pluginsData,
    errors: this.errors.getPluginErrors()
  };
};

PluginManager.Errors = (function () {
  var errors = [];

  return {
    addPluginError: function (pluginId, code, error) {
      errors.push({
        date: new Date(),
        id: pluginId,
        code: code,
        error: error
      });
      //TODO persist plugin error data?
    },

    getPluginErrors: function (id) {
      if (!id) {
        return errors;
      }
      return errors.filter(function(plugin) {
        return id == plugin.id;
      });
    },

    hasErrors: function() {
      return errors.length > 0;
    },

    getPluginIdsWithErrors: function() {
      var ids = [];
      errors.forEach(function(error) {
        if (ids.indexOf(error.id) == -1) {
          ids.push(error.id);
        }
      });
      return ids;
    }
  };
})();


function PluginCollection(pluginsData) {
  this._plugins = pluginsData.map(function(plugin) {
    return new Plugin(plugin);
  });
}

//Samit: Enh: work with async nature of Addon Manager in Firefox 4
PluginCollection.prototype.callWhenReady = function(callback, obj) {
  if (!this.isReady()) {
    var self = this;
    setTimeout(function() {
      self.callWhenReady(callback, obj);
    }, 100);
  } else {
    callback.call(obj);
  }
};

PluginCollection.prototype.isReady = function() {
  return this._plugins.every(function(plugin) {
    return plugin.ready;
  });
};

PluginCollection.prototype.getPluginsData = function() {
  return this._plugins.map(function(plugin) {
    return plugin.data;
  });
};

PluginCollection.prototype.forEach = function(callback, thisArg) {
  this._plugins.forEach(callback, thisArg);
};

PluginCollection.prototype.findPlugin = function(id) {
  for (var i = 0; i < this._plugins.length; i++) {
    if (id == this._plugins[i].id) {
      return this._plugins[i];
    }
  }
  return null;
};

function Plugin(data, readyCallback) {
  var id = data.id;
  this.data = data;
  this.id = id;
  if (Plugin.useAddonManager) {
    //Samit: Enh: Support plugins on Firefox 4
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    var self = this;
    this.ready = false;
    AddonManager.getAddonByID(id, function(addon) {
      self.name = addon.name;
      self.version = addon.version;
      self.creator = addon.creator.name;
      self.developers = (addon.developers && addon.developers.length > 0) ? addon.developers : [];
      self.homepageURL = addon.homepageURL;
      self.description = addon.description;
      self.addon = addon;
      self.ready = true;
      if (readyCallback) {
        readyCallback(this);
      }
    });
  } else {
    var rdf = Components.classes['@mozilla.org/rdf/rdf-service;1'].getService(Components.interfaces.nsIRDFService);
    var man_res = rdf.GetResource("urn:mozilla:install-manifest");

    var dir = Components.classes["@mozilla.org/file/directory_service;1"].
        getService(Components.interfaces.nsIProperties).
        get("ProfD", Components.interfaces.nsIFile);
    dir.append("extensions");
    dir.append(id);
    dir.append("install.rdf");
    var ds = rdf.GetDataSourceBlocking("file:///" + dir.path);

    this.name = readRDFValue(man_res, ds, rdf, 'http://www.mozilla.org/2004/em-rdf#name');
    this.version = readRDFValue(man_res, ds, rdf, 'http://www.mozilla.org/2004/em-rdf#version');
    this.creator = readRDFValue(man_res, ds, rdf, 'http://www.mozilla.org/2004/em-rdf#creator');
    this.developers = [];
    this.description = readRDFValue(man_res, ds, rdf, 'http://www.mozilla.org/2004/em-rdf#description');
    this.ready = true;
    if (readyCallback) {
      readyCallback(this);
    }
  }
}

Plugin.useAddonManager = (function() {
  try {
    var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes['@mozilla.org/xpcom/version-comparator;1'].getService(Components.interfaces.nsIVersionComparator);

    return (versionChecker.compare(appInfo.version, '4.0') >= 0);
  } catch(e) {
    return false;
  }
})();

// rdf
function readRDFValue(man_res, ds, rdf, res_name) {
  var RDFNode = ds.GetTarget(man_res, rdf.GetResource(res_name), true);
  try {
    return RDFNode.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
  } catch (e) {
    try {
      return RDFNode.QueryInterface(Components.interfaces.nsIRDFResource).Value;
    } catch (e) {
    }
  }
  return '';
}