/*
 * Copyright 2005 Shinya Kasatani
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

function TestSuite() {
    this.tests = [];
}

TestSuite.TEST_SUITE_DIRECTORY_PREF = "testSuiteDirectory";

TestSuite.load = function() {
    return showFilePicker(window, Editor.getString("chooseTestSuite"),
                          Components.interfaces.nsIFilePicker.modeOpen,
                          TestSuite.TEST_SUITE_DIRECTORY_PREF,
                          function(fp) { return TestSuite.loadFile(fp.file); });
}

TestSuite.loadFile = function(file) {
    var suite = this.loadInputStream(FileUtils.openFileInputStream(file));
    suite.file = file;
    return suite;
}

TestSuite.loadInputStream = function(input) {
    var content = FileUtils.getUnicodeConverter("UTF-8").ConvertToUnicode(input.read(input.available()));
    input.close();
    if (/(<table[\s>][\s\S]*?<\/table>)/i.test(content)) {
        var suite = new TestSuite();
        var tableContent = RegExp.$1;
        var pattern = /<tr[\s>][\s\S]*?<\/tr>/i;
        var linkPattern = /<a\s[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]+)<\/a>/i;
        var rest = tableContent;
        var r;
        while ((r = pattern.exec(rest)) != null) {
            var row = r[0];
            if (linkPattern.test(row)) {
                var filename = RegExp.$1;
                var title = RegExp.$2;
                suite.tests.push(new TestSuite.TestCase(suite, filename, title));
            }
            rest = rest.substr(r.index + row.length);
        }
        return suite;
    } else {
        throw "Failed to load test suite: <table> tag not found"
    }
}

// TODO make this configurable
TestSuite.header = 
    "<html>\n" +
    "<head>\n" +
    '  <meta content="text/html; charset=UTF-8" http-equiv="content-type">' + "\n" +
    "  <title>Test Suite</title>\n" +
    "</head>\n" +
    "<body><table><tbody>\n";

TestSuite.footer = 
    "</tbody></table></body>\n</html>\n";

TestSuite.prototype = {
    addTestCaseFromContent: function(content) {
        var testCase = new TestSuite.TestCase(this);
        testCase.content = content;
        this.tests.push(testCase);
    },

    save: function() {
        if (!this.file) {
            var self = this;
            return showFilePicker(window, Editor.getString("chooseTestSuite"),
                           Components.interfaces.nsIFilePicker.modeSave,
                           TestSuite.TEST_SUITE_DIRECTORY_PREF,
                           function(fp) {
                               self.file = fp.file;
                               return self.save();
                           });
        }
        var output = FileUtils.openFileOutputStream(this.file);
        var converter = FileUtils.getUnicodeConverter("UTF-8");
        var content = TestSuite.header;
        for (var i = 0; i < this.tests.length; i++) {
            content += this.tests[i].format();
        }
        content += TestSuite.footer;
        var text = converter.ConvertFromUnicode(content);
        output.write(text, text.length);
        var fin = converter.Finish();
        if (fin.length > 0) {
            output.write(fin, fin.length);
        }
        output.close();
        return true;
    },

    generateNewTestCaseTitle: function() {
        if (this.tests.some(function(test) { return /^Untitled/.test(test.getTitle()) })) {
            var max = 1;
            this.tests.forEach(function(test) {
                    if (/^Untitled (\d+)/.test(test.getTitle())) {
                        max = parseInt(RegExp.$1);
                    }
                });
            return "Untitled " + (max + 1);
        } else {
            return "Untitled";
        }
    }
}

TestSuite.TestCase = function(testSuite, filename, title) {
    this.testSuite = testSuite;
    this.filename = filename;
    this.title = title;
}

TestSuite.TestCase.prototype = {
    getFile: function() {
        if (!this.testSuite.file) return null;
        var file = FileUtils.getFile(this.testSuite.file.parent.path);
        //alert(file + " " + this.filename);
        file.appendRelativePath(this.filename);
        return file;
    },

    getRelativeFilePath: function() {
        if (this.content) {
            return this._computeRelativePath(this.testSuite.file, this.content.file);
        } else {
            return this.filename;
        }
    },

    _computeRelativePath: function(fromFile, toFile) {
        var from = this._splitPath(fromFile.parent);
        var to = this._splitPath(toFile);
        var result = [];
        for (var base = 0; base < from.length && base < to.length; base++) {
            if (from[base] != to[base]) {
                break;
            }
        }
        for (var i = from.length - 1; i >= base; i--) {
            result.push("..");
        }
        for (var i = base; i < to.length; i++) {
            result.push(to[i]);
        }
        return result.join("/");
    },

    _splitPath: function(file) {
        var result = [];
        while (file && file.path != "/") {
            result.unshift(file.leafName);
            file = file.parent;
        }
        return result;
    },

    getFilePath: function() {
        if (this.content) {
            return this.content.filename;
        } else {
            return this.filename;
        }
    },

    getTitle: function() {
        if (this.content && this.content.name) {
            return this.content.name;
        } else {
            return this.title;
        }
    },
    
    format: function() {
        return "<tr><td><a href=\"" + this.getRelativeFilePath() + "\">" +
            this.getTitle() + "</a></td></tr>\n";
    }
}

