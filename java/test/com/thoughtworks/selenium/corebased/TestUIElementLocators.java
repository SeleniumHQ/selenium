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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("Not implemented")
public class TestUIElementLocators extends InternalSelenseTestBase {
  @Test
  public void testUIElementLocators() {
    selenium.addScript(getUiMap(), "uimap");
    selenium.open("test_locators.html");
    verifyEquals(selenium.getText("ui=pageset1::linksWithId()"), "this is the first element");
    verifyEquals(selenium.getText("ui=pageset1::linksWithId(index=1)"), "this is the first element");
    verifyTrue(selenium.getText("ui=pageset1::linksWithId(index=2)").matches(
        "^this is the[\\s\\S]*second[\\s\\S]*element$"));
    verifyEquals(selenium.getText("ui=pageset1::linksWithId(index=3)"), "this is the third element");
    verifyEquals(selenium.getText("ui=pageset1::fourthLink()"), "this is the fourth element");
    verifyEquals(selenium.getText("ui=pageset1::fifthLink()"), "this is the fifth element");
    verifyEquals(selenium.getText("ui=pageset1::linksWithId()->//span"), "element");
    verifyEquals(selenium.getText("ui=pageset2::cell(text=theHeaderText)"), "theHeaderText");
    verifyEquals(selenium.getText("ui=pageset2::cell(text=theCellText)"), "theCellText");
    verifyEquals(
        selenium
            .getEval("map.getUISpecifierString(selenium.browserbot.findElement('id=firstChild'), selenium.browserbot.getDocument())"),
        "ui=pageset3::anyDiv()->/child::span");
    selenium.removeScript("uimap");
  }

  private String getUiMap() {
    return "var map = new UIMap();\n"
        + "\n"
        + "map.addPageset({\n"
        + "    name: 'pageset1'\n"
        + "    , description: 'pageset1Desc'\n"
        + "    , paths: [ 'pageset1Path' ]\n"
        + "});\n"
        + "\n"
        + "map.addElement('pageset1', {\n"
        + "    name: 'linksWithId'\n"
        + "    , description: 'link with an id attribute starting with \"id\"'\n"
        + "    , args: [\n"
        + "        {\n"
        + "            name: 'index'\n"
        + "            , description: 'index of the link, starting at 1'\n"
        + "            , defaultValues: []\n"
        + "        }\n"
        + "    ]\n"
        + "    , getLocator: function(args) {\n"
        + "        var indexPred = args.index ? '[' + args.index + ']' : \"\";\n"
        + "        return \"//a[starts-with(@id, 'id')]\" + indexPred;\n"
        + "    }\n"
        + "});\n"
        + "\n"
        + "map.addElement('pageset1', {\n"
        + "    name: 'fourthLink'\n"
        + "    , description: 'the fourth link'\n"
        + "    , locator: 'id=foo:bar'\n"
        + "});\n"
        + "\n"
        + "map.addElement('pageset1', {\n"
        + "    name: 'fifthLink'\n"
        + "    , description: 'the fifth link'\n"
        + "    , xpath: '//a[5]'\n"
        + "});\n"
        + "\n"
        + "map.addPageset({\n"
        + "    name: 'pageset2'\n"
        + "    , description: 'pageset2Desc'\n"
        + "    , paths: [ 'pageset2Path' ]\n"
        + "});\n"
        + "\n"
        + "map.addElement('pageset2', {\n"
        + "    name: 'cell'\n"
        + "    , description: 'a cell in the style table'\n"
        + "    , args: [\n"
        + "        {\n"
        + "            name: 'text'\n"
        + "            , description: 'the text content of the node'\n"
        + "            , defaultValues: []\n"
        + "        }\n"
        + "    ]\n"
        + "    , getLocator: function(args) {\n"
        + "        return \"//table[@class='stylee']/descendant::\"\n"
        + "            + this._contentMap[args.text];\n"
        + "    }\n"
        + "    , _contentMap: {\n"
        + "        'theHeaderText': 'th'\n"
        + "        , 'theCellText': 'td'\n"
        + "    }\n"
        + "});\n"
        + "\n"
        + "map.addPageset({\n"
        + "    name: 'pageset3'\n"
        + "    , description: 'pageset3Desc'\n"
        + "    , pathRegexp: '.*'\n"
        + "});\n"
        + "\n"
        + "map.addElement('pageset3', {\n"
        + "    name: 'anyDiv'\n"
        + "    , description: 'any div element'\n"
        + "    , locator: '//div'\n"
        + "    , getOffsetLocator: function(locatedElement, pageElement) {\n"
        + "        if (pageElement.parentNode == locatedElement) {\n"
        + "            return '/child::' + pageElement.nodeName.toLowerCase();\n"
        + "        }\n"
        + "        return null;\n"
        + "    }\n"
        + "});";
  }
}
