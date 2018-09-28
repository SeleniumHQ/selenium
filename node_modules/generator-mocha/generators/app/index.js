'use strict';
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('ui', {
      desc: 'Choose your style of test DSL for Mocha (bdd, tdd)',
      type: String
    });

    this.option('rjs', {
      desc: 'Add support for RequireJS',
      type: Boolean
    });
  }

  prompting() {
    const done = this.async();

    const prompts = [{
      type: 'list',
      name: 'ui',
      message: 'Choose your style of DSL',
      choices: ['BDD', 'TDD'],
      default: 'BDD',
      when: !this.options.ui
    }];

    this.prompt(prompts).then(answers => {
      this.options.ui = (this.options.ui || answers.ui).toLowerCase();
      done();
    });
  }

  configuring() {
    this.config.set('ui', this.options.ui);
    this.config.set('rjs', !!this.options.rjs);
  }

  writing() {
    this.fs.copy(
      this.templatePath('test.js'),
      this.destinationPath('test/spec/test.js')
    );

    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('test/index.html'),
      {
        ui: this.options.ui,
        rjs: this.options.rjs
      }
    );
  }

  install() {
    if (!this.options['skip-install']) {
      this.installDependencies({
        bower: false
      });
    }

    const dependencies = [
      'chai',
      'mocha'
    ];

    if (this.options.rjs) {
      dependencies.push('requirejs');
    }

    this.npmInstall(dependencies, {saveDev: true});
  }
}
