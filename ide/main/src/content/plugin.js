function PluginCollection(plugins) {
  var split_peas = plugins.split(",");

  this.plugins = [];
  for (var i = 0; i < split_peas.length; i++) {
    this.plugins.push(new Plugin(split_peas[i]));
  }

}

PluginCollection.prototype.isReady = function() {
  for (var i = 0; i < this.plugins.length; i++) {
    if (!this.plugins[i].ready) {
      return false;
    }
  }
  return true;
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
      self.description = addon.description;
      self.ready = true;
    });
  } else {
    var rdf = Components.classes['@mozilla.org/rdf/rdf-service;1'].getService(Components.interfaces.nsIRDFService);

    var dir = Components.classes["@mozilla.org/file/directory_service;1"].
        getService(Components.interfaces.nsIProperties).
        get("ProfD", Components.interfaces.nsIFile);
    dir.append("extensions");
    dir.append(id);
    dir.append("install.rdf");
    var ds = rdf.GetDataSourceBlocking("file:///" + dir.path);
    var man_res = rdf.GetResource("urn:mozilla:install-manifest");

    var name_res = rdf.GetResource('http://www.mozilla.org/2004/em-rdf#name');
    this.name = readRDFValue(ds.GetTarget(man_res, name_res, true));

    var version_res = rdf.GetResource('http://www.mozilla.org/2004/em-rdf#version');
    this.version = readRDFValue(ds.GetTarget(man_res, version_res, true));

    var creator_res = rdf.GetResource('http://www.mozilla.org/2004/em-rdf#creator');
    this.creator = readRDFValue(ds.GetTarget(man_res, creator_res, true));

    var description_res = rdf.GetResource('http://www.mozilla.org/2004/em-rdf#description');
    this.description = readRDFValue(ds.GetTarget(man_res, description_res, true));
    this.ready = true;
  }
}
;

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
function readRDFValue(RDFNode) {
  var obj;
  var node;
  var value = '';

  try {
    node = RDFNode.QueryInterface(Components.interfaces.nsIRDFLiteral);
    value = node.Value;
  }
  catch (e) {
    try {
      node = RDFNode.QueryInterface(Components.interfaces.nsIRDFResource);
      value = node.Value;
    }
    catch (e) {
    }
  }
  return value;
}