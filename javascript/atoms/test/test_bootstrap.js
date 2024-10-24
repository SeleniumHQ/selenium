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
 * from Google Closure to load additional files as needed.
 *
 * Example Usage:
 *
 * <html>
 *   <head>
 *     <script src="test_bootstrap.js"></script>
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
 */

(function() {
  window.errors = [];
  window.onerror = function() { window.errors.push(arguments); console.log(arguments); };
  var scripts = document.getElementsByTagName('script');
  var directoryPath = './';
  var thisFile = 'test_bootstrap.js';

  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    var len = src.length;
    if (src.substr(len - thisFile.length) == thisFile) {
      directoryPath = src.substr(0, len - thisFile.length);
      break;
    }
  }

  // All the files to load. Files are specified in the order they must be
  // loaded, NOT alphabetical order.
  var files = [
    '../../../third_party/closure/goog/base.js',
    'deps.js'
  ];

  if (location.pathname.lastIndexOf('/filez/_main/javascript/', 0) === 0) {
    directoryPath = '';
    files = [
      '/filez/com_google_javascript_closure_library/closure/goog/base.js',
      '/filez/_main/javascript/atoms/deps.js',
    ];
  }

  for (var j = 0; j < files.length; j++) {
    document.write('<script type="text/javascript" src="' +
        directoryPath + files[j] + '"></script>');
  }
})();
