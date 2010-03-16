function PluginCollection(plugins) {
  var split_peas = plugins.split(",");

  this.plugins = [];  
  for (var i = 0; i < split_peas.length; i++) {
    this.plugins.push(new Plugin(split_peas[i]));
  }

}

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
};

// rdf
function readRDFValue(RDFNode)
{
  var obj;
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