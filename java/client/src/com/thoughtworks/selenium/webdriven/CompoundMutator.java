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

package com.thoughtworks.selenium.webdriven;

import java.util.ArrayList;
import java.util.List;

/**
 * A class that collects together a group of other mutators and applies them in the order they've
 * been added to any script that needs modification. Any JS to be executed will be wrapped in an
 * "eval" block so that a meaningful return value can be created.
 */
public class CompoundMutator implements ScriptMutator {
  // The ordering of mutators matters
  private final List<ScriptMutator> mutators = new ArrayList<>();

  public CompoundMutator(String baseUrl) {
    addMutator(new VariableDeclaration("selenium", "var selenium = {};"));
    addMutator(new VariableDeclaration("selenium.browserbot", "selenium.browserbot = {};"));
    addMutator(new VariableDeclaration(
        "selenium.browserbot.baseUrl", "selenium.browserbot.baseUrl = '" + baseUrl + "';"));
    addMutator(new VariableDeclaration(
        "browserVersion", "var browserVersion = {};"));
    addMutator(new VariableDeclaration(
        "browserVersion.isFirefox",
        "browserVersion.isFirefox = navigator.userAgent.indexOf('Firefox') != -1 || " +
            "navigator.userAgent.indexOf('Namoroka') != -1 " +
            "|| navigator.userAgent.indexOf('Shiretoko') != -1;"));
    addMutator(new VariableDeclaration(
        "browserVersion.isGecko",
        "browserVersion.isGecko = navigator.userAgent.indexOf('Firefox') != -1 || " +
            "navigator.userAgent.indexOf('Namoroka') != -1 " +
            "|| navigator.userAgent.indexOf('Shiretoko') != -1;"));
    addMutator(new VariableDeclaration(
        "browserVersion.firefoxVersion",
        "var r = /.*[Firefox|Namoroka|Shiretoko]\\/([\\d\\.]+).*/.exec(navigator.userAgent);" +
            "browserVersion.firefoxVersion = r ? r[1] : '';"));
    addMutator(new VariableDeclaration(
        "browserVersion.isIE",
        "browserVersion.isIE = navigator.appName == 'Microsoft Internet Explorer';"));

    addMutator(new FunctionDeclaration("selenium.page",
        "if (!selenium.browserbot) { selenium.browserbot = {} }; return selenium.browserbot;"));
    addMutator(new FunctionDeclaration("selenium.browserbot.getCurrentWindow", "return window;"));
    addMutator(new FunctionDeclaration("selenium.browserbot.getUserWindow", "return window;"));
    addMutator(new FunctionDeclaration("selenium.page().getCurrentWindow", "return window;"));
    addMutator(new FunctionDeclaration("selenium.browserbot.getDocument", "return document;"));
    addMutator(new FunctionDeclaration("selenium.page().getDocument", "return document;"));

    JavascriptLibrary library = new JavascriptLibrary();

    addMutator(new SeleniumMutator("selenium.getText",
        library.getSeleniumScript("getText.js")));
    addMutator(new SeleniumMutator("selenium.isElementPresent",
        library.getSeleniumScript("isElementPresent.js")));
    addMutator(new SeleniumMutator("selenium.isTextPresent",
        library.getSeleniumScript("isTextPresent.js")));
    addMutator(new SeleniumMutator("selenium.isVisible",
        library.getSeleniumScript("isVisible.js")));
    addMutator(new SeleniumMutator("selenium.browserbot.findElement",
        library.getSeleniumScript("findElement.js")));
  }

  public void addMutator(ScriptMutator mutator) {
    mutators.add(mutator);
  }

  @Override
  public void mutate(String script, StringBuilder outputTo) {
    StringBuilder nested = new StringBuilder();

    for (ScriptMutator mutator : mutators) {
      mutator.mutate(script, nested);
    }
    nested.append(script);

    outputTo.append("return eval('");
    outputTo.append(escape(nested.toString()));
    outputTo.append("');");
  }

  private String escape(String escapee) {
    return escapee
        .replace("\\", "\\\\")
        .replace("\n", "\\n")
        .replace("'", "\\'");
  }
}
