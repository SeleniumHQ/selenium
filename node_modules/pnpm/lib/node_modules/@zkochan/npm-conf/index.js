'use strict';
const path = require('path');
const Conf = require('./lib/conf');
const _defaults = require('./lib/defaults');

// https://github.com/npm/npm/blob/latest/lib/config/core.js#L101-L200
module.exports = (opts, types, defaults) => {
	const conf = new Conf(Object.assign({}, _defaults.defaults, defaults), types);

	conf.add(Object.assign({}, opts), 'cli');
	conf.addEnv();
	conf.loadPrefix();

	const projectConf = path.resolve(conf.localPrefix, '.npmrc');
	const userConf = conf.get('userconfig');

	if (!conf.get('global') && projectConf !== userConf) {
		conf.addFile(projectConf, 'project');
	} else {
		conf.add({}, 'project');
	}

	conf.addFile(conf.get('userconfig'), 'user');

  if (conf.get('workspace-prefix')) {
		const workspaceConf = path.resolve(conf.get('workspace-prefix'), '.npmrc');
		conf.addFile(workspaceConf, 'workspace');
	}
	if (conf.get('prefix')) {
		const etc = path.resolve(conf.get('prefix'), 'etc');
		conf.root.globalconfig = path.resolve(etc, 'npmrc');
		conf.root.globalignorefile = path.resolve(etc, 'npmignore');
	}

	conf.addFile(conf.get('globalconfig'), 'global');
	conf.loadUser();

	const caFile = conf.get('cafile');

	if (caFile) {
		conf.loadCAFile(caFile);
	}

	return conf;
};

module.exports.defaults = Object.assign({}, _defaults.defaults);
