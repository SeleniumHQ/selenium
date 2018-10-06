'use strict';
const path = require('path');
const camelCase = require('lodash.camelcase');
const upperFirst = require('lodash.upperfirst');
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('filepath', {
      type: String,
      desc: 'Path to the file to test',
      required: true
    });

    this.option('componentName', {
      type: String,
      desc: 'Name of the component to test'
    });
  }

  writing() {
    // Use or define a default component name.
    var extname = path.extname(this.options.filepath);
    var componentName = this.options.componentName;
    if (!componentName) {
      componentName = path.basename(this.options.filepath, extname);
      componentName = upperFirst(camelCase(componentName));
    }

    var dirname = path.dirname(this.options.filepath);
    var destinationPath = path.join(
      dirname,
      '__tests__',
      componentName + '.test' + extname
    );
    destinationPath = this.destinationPath(destinationPath);

    this.fs.copyTpl(this.templatePath('test.js.tpl'), destinationPath, {
      filepath: '../' + path.basename(this.options.filepath),
      name: componentName
    });
  }
};
