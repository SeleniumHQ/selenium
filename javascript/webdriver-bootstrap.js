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
 * @fileoverview Bootstrap file that loads all of the WebDriver scripts in the
 * correct order. Once loaded, pages can use {@code goog.require} statements
 * from Google DocType to load additional files as needed.
 *
 * Example Usage:
 *
 * <html>
 *   <head>
 *     <script src="webdriver-bootstrap.js"></script>
 *     <script>
 *       goog.require('goog.debug.Logger');
 *     </script>
 *     <script>
 *       window.onload = function() {
 *         goog.debug.Logger.getLogger('').info(
 *             'The page has finished loading');
 *       };
 *     </script>
 *   </head>
 *   <body></body>
 * </html>
 * @author jmelyba@gmail.com (Jason Leyba)
 */

(function() {
  // goog.provide will do this for us, but this makes the IDE stop complaining
  // about an undefined symbol.
  window.webdriver = {};

  let scripts = document.getElementsByTagName('script');
  let directoryPath = './';
  let thisFile = 'webdriver-bootstrap.js';

  for (let i = 0; i < scripts.length; i++) {
    let src = scripts[i].src;
    let len = src.length;
    if (src.substr(len - thisFile.length) == thisFile) {
        directoryPath = src.substr(0, len - thisFile.length);
      break;
    }
  }

  // All of the files to load. Files are specified in the order they must be
  // loaded, NOT alphabetical order.
  const webdriverFiles = [
    '../../third_party/closure/goog/base.js',
    'deps.js'
  ];

  for (let j = 0; j < webdriverFiles.length; j++) {
    document.write('<script type="text/javascript" src="' +
        directoryPath + webdriverFiles[j] + '"></script>');
  }
})();
