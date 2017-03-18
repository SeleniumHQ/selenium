/*
 * Copyright 2015 Samit Badle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Creating public gists on GitHub
 */
function GitHub() {
}

/**
 * Create a gist with the given description, content and optionally a filename and returns a deferred that gives the url of the created gist
 *
 * @param description description of the gist
 * @param content content of the gist
 * @param [filename]  optional filename for the content
 * @returns {Deferred} deferred which on success provides the gist url
 */
GitHub.createGist = function(description, content, filename) {
  var files = {};
  files[filename || 'file'] = content;
  return this.createGistWithFiles(description, files);
};

/**
 * Create a gist with the given description and a set of files and returns a deferred that gives the url of the created gist
 *
 * @param description description of the gist
 * @param {object.<string,string>} files an object with each key is the filename and value is the content
 * @returns {Deferred} deferred which on success provides the gist url
 */
GitHub.createGistWithFiles = function(description, files) {
  var gistFiles = {};
  for (var file in files) {
    gistFiles[file] = {
      content: files[file]
    };
  }
  var data = {
    description: description,
    public: true,
    files: gistFiles
  };
  return new Deferred(function(deferred) {
    HTTP.post('https://api.github.com/gists', data, {}, function(response, success, status) {
      if (response && (status == "201")) {
        var result = JSON.parse(response);
        if (result.html_url) {
          deferred.resolve(result.html_url);
          return;
        }
      }
      deferred.reject(response, success, status);
    });
  });
};
