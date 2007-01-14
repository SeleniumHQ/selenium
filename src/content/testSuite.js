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
    }
}

