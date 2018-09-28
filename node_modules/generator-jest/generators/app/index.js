'use strict';
const Generator = require('yeoman-generator');
const extend = require('deep-extend');
const rootPkg = require('../../package.json');

const JEST_ENV = ['jsdom', 'node'];

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('testEnvironment', {
      type: String,
      desc: 'Test environment (jsdom or node)'
    });

    this.option('coveralls', {
      type: Boolean,
      desc: 'Send coverage reports to coveralls'
    });
  }

  prompting() {
    var prompts = [
      {
        type: 'list',
        name: 'testEnvironment',
        message: 'What environment do you want to use',
        choices: JEST_ENV,
        default: this.options.testEnvironment,
        when: JEST_ENV.indexOf(this.options.testEnvironment) === -1
      },
      {
        type: 'confirm',
        name: 'coveralls',
        message: 'Send coverage reports to coveralls?',
        when: this.options.coveralls === undefined
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(
        {
          testEnvironment: this.options.testEnvironment,
          coveralls: this.options.coveralls
        },
        props
      );
    });
  }

  writing() {
    var pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    pkg = extend(pkg, {
      scripts: {},
      devDependencies: {
        jest: rootPkg.devDependencies.jest,
        'jest-cli': rootPkg.devDependencies['jest-cli']
      }
    });

    // Add jest to the npm test script in a non-destructive way
    var testScripts = pkg.scripts.test || '';
    testScripts = testScripts
      .split('&&')
      .map(str => str.trim())
      .filter(Boolean);
    if (!testScripts.find(script => script.startsWith('jest'))) {
      testScripts.push(this.props.coveralls ? 'jest --coverage' : 'jest');
      pkg.scripts.test = testScripts.join(' && ');
    }

    // Send coverage reports to coveralls
    if (this.props.coveralls) {
      pkg.scripts.posttest = 'cat ./coverage/lcov.info | coveralls';
      pkg.devDependencies.coveralls = rootPkg.devDependencies.coveralls;
    }

    if (this.props.testEnvironment !== 'jsdom') {
      pkg.jest = {
        testEnvironment: this.props.testEnvironment
      };
    }

    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  }

  install() {
    this.installDependencies({ bower: false, npm: true });
  }
};
