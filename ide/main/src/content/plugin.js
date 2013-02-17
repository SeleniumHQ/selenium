function PluginCollection(plugins) {
  this.plugins = plugins.split(",").map(function(id) {
    return new Plugin(id);
  });
}

PluginCollection.prototype.isReady = function() {
  return this.plugins.every(function(plugin) {
    return plugin.ready;
  });
};

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

PluginCollection.prototype.findPlugin = function(id) {
  for (var i = 0; i < this.plugins.length; i++) {
    if (id == this.plugins[i].id) {
      return this.plugins[i];
    }
  }
  return null;
};

function Plugin(id) {
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
      self.ready = true;
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