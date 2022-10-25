// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Module that will generate the API documentation for the
 * `selenium-webdriver` npm package.
 */

'use strict';

const child_process = require('child_process'),
    fs = require('fs'),
    path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');


/**
 * @param {string} command the command to run.
 * @param {!Array<string>} args command arguments.
 * @param {!Object} opts command options.
 * @return {!Promise<void>} a promise that will resolve when the command
 *     completes.
 */
function exec(command, args, opts) {
  console.log(`${command} ${args.join(' ')}`);
  return new Promise(function(fulfill, reject) {
    child_process.spawn(command, args, opts)
        .on('error', reject)
        .on('exit', function(code, signal) {
          if (code) {
            reject(Error(`command terminated with status=${code}`));
          } else if (signal) {
            reject(Error(`command killed with signal=${signal}`));
          } else {
            fulfill();
          }
        });
  });
}

/**
 * @param {string} aPath path to the directory to create.
 * @return {!Promise<string>} promise that will resolve with the path to the
 *     created directory.
 */
function mkdirp(aPath) {
  return new Promise(function(fulfill, reject) {
    console.log('...creating %s', aPath);
    fs.mkdir(aPath, function(err) {
      if (!err) return fulfill(aPath);

      switch (err.code) {
        case 'EEXIST':
          fulfill(aPath);
          break;

        case 'ENOENT':
          mkdirp(path.dirname(aPath))
              .then(() => mkdirp(aPath))
              .then(fulfill);
          break;

        default:
          reject(err);
          break;
      }
    });
  });
}

/**
 * @return {!Promise<string>} a promise that will resolve with the path to the
 *     dossier jar.
 */
function installDossier() {
  return new Promise(function(fulfill, reject) {
    let buildNodeDir = path.join(PROJECT_ROOT);
    let jar = path.join(buildNodeDir, 'node_modules/js-dossier/dossier.jar');
    fs.stat(jar, function(err) {
      if (!err) return fulfill(jar);

      console.log('Installing dossier...');
      const args = ['install', 'js-dossier'];
      const opts = {cwd: buildNodeDir, stdio: 'inherit'};
      exec('npm', args, opts).then(() => fulfill(jar), reject);
    });
  });
}


/**
 * @return {!Promise<!Array<path>>} a promise for the list of modules to
 *     generate docs for.
 */
function getModules() {
  console.log('Scanning sources...');
  const excludeDirs = [
    path.join(__dirname, 'selenium-webdriver/example'),
    path.join(__dirname, 'selenium-webdriver/lib/atoms'),
    path.join(__dirname, 'selenium-webdriver/lib/firefox'),
    path.join(__dirname, 'selenium-webdriver/lib/safari'),
    path.join(__dirname, 'selenium-webdriver/lib/test'),
    path.join(__dirname, 'selenium-webdriver/lib/tools'),
    path.join(__dirname, 'selenium-webdriver/devtools/generator'),
    path.join(__dirname, 'selenium-webdriver/node_modules'),
    path.join(__dirname, 'selenium-webdriver/test')
  ];
  function scan(dir) {
    return listFiles(dir).then(function(files) {
      return files.filter(f => excludeDirs.indexOf(f) === -1);
    }).then(function(files) {
      return Promise.all(files.map(isDir))
          .then(function(isDir) {
            let jsFiles = files.filter(
                (file, index) => !isDir[index] && file.endsWith('.js'));

            return Promise
                .all(files.filter((f, i) => isDir[i]).map(scan))
                .then(files => jsFiles.concat.apply(jsFiles, files));
          });
    });
  }
  return scan(path.join(__dirname, 'selenium-webdriver'));
}


/**
 * @param {string} path the path to check.
 * @return {!Promise<boolean>} a promise that will resolve with whether the
 *    given path is a directory.
 */
function isDir(path) {
  return new Promise(function(fulfill, reject) {
    fs.stat(path, function(err, stats) {
      if (err) return reject(err);
      fulfill(stats.isDirectory());
    });
  });
}


/**
 * @param {string} dir path to the directory to list.
 * @return {!Promise<!Array<string>>} a promise that will resolve with the list
 *     of files in the directory.
 */
function listFiles(dir) {
  return new Promise(function(fulfill, reject) {
    fs.readdir(dir, function(err, files) {
      if (err) return reject(err);
      files = (files || []).map(f => path.join(dir, f));
      fulfill(files);
    });
  });
}


/**
 * @param {!Array<string>} modules List of files to generate docs for.
 * @return {!Object} the JSON config.
 */
function buildConfig(modules) {
  console.log('Generating dossier config...');
  let webdriver = path.join(__dirname, 'selenium-webdriver');
  let externs = path.join(__dirname, 'externs');
  return {
    output: path.join(
        PROJECT_ROOT, 'build/javascript/node/selenium-webdriver-docs'),
    customPages: [
        {
          name: 'Changes',
          path: path.join(webdriver, 'CHANGES.md')
        }
    ],
    readme: path.join(webdriver, 'README.md'),
    language: 'ES6_STRICT',
    moduleNamingConvention: 'NODE',
    modules: modules,
    // Exclude modules that are considered purely implementation details.
    moduleFilters: [
        path.join(webdriver, 'lib/devmode.js'),
        path.join(webdriver, 'lib/symbols.js')
    ],
    externs: [path.join(externs, 'global.js')],
    externModules: [
        path.join(externs, 'jszip.js'),
        path.join(externs, 'mocha.js'),
        path.join(externs, 'rimraf.js'),
        path.join(externs, 'tmp.js'),
        path.join(externs, 'ws.js'),
        path.join(externs, 'xml2js.js')
    ],
    sourceUrlTemplate:
        'https://github.com/SeleniumHQ/selenium/tree/trunk/'
            + 'javascript/node/selenium-webdriver/%path%#L%line%',
    strict: false
  }
}


/**
 * @param {!Object} config the JSON config to write
 * @return {!Promise<!Object>} a promise that will resolve with the parsed
 *     JSON config.
 */
function writeConfig(config) {
  console.log('Creating output root...');
  return mkdirp(config.output).then(function() {
    let configFile = config.output + '.json';
    console.log('Writing config...');
    return new Promise(function(fulfill, reject) {
      fs.writeFile(configFile, JSON.stringify(config), 'utf8', function(err) {
        if (err) {
          reject(Error(`failed to write config file: ${err}`));
          return;
        }
        fulfill(config);
      });
    });
  });
}


/**
 * @param {!Object} config The json config to use.
 * @return {!Promise<void>} a promise that will resolve when the task is
 *     complete.
 */
function generateDocs(config) {
  return installDossier().then(function(jar) {
    let args = ['-jar', jar, '-c', config.output + '.json'];
    console.log(`Generating ${config.output}...`);
    return exec('java', args, {stdio: 'inherit'});
  });
}


/**
 * Prints the given error and exits the program.
 * @param {!Error} e the error to print.
 */
function die(e) {
  console.error(e.stack);
  process.exit(1);
}


function main() {
  return getModules()
      .then(buildConfig)
      .then(writeConfig)
      .then(generateDocs);
}
module.exports = main;


if (module === require.main) {
  return main().then(() => console.log('DONE!'), die);
}
