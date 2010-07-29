/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.internal.seleniumemulation;

import java.util.Set;

import com.google.common.collect.Sets;

public class CompoundMutator implements ScriptMutator {
  private Set<ScriptMutator> mutators = Sets.newLinkedHashSet();

  public CompoundMutator(String baseUrl) {
    mutators.add(new VariableDeclaration("selenium", "var selenium = {};"));
    mutators.add(new VariableDeclaration("selenium.browserbot", "selenium.browserbot = {};"));
    mutators.add(new VariableDeclaration("selenium.browserbot.baseUrl", "selenium.browserbot.baseUrl = '" + baseUrl + "';"));
    mutators.add(new MethodDeclaration("selenium.page",
        "if (!selenium.browserbot) { selenium.browserbot = {} }; return selenium.browserbot;"));
    mutators.add(new MethodDeclaration("selenium.browserbot.getCurrentWindow", "return window;"));
    mutators.add(new MethodDeclaration("selenium.page().getCurrentWindow", "return window;"));
    mutators.add(new MethodDeclaration("selenium.browserbot.getDocument", "return document;"));
    mutators.add(new MethodDeclaration("selenium.page().getDocument", "return document;"));
  }

  public void mutate(String script, StringBuilder outputTo) {
    StringBuilder nested = new StringBuilder();

    for (ScriptMutator mutator : mutators) {
      mutator.mutate(script, nested);
    }

    outputTo.append("return eval('");
    outputTo.append(escape(nested.toString()));
    outputTo.append(escape(script));
    outputTo.append("');");
  }

  private String escape(String escapee) {
    return escapee
        .replace("\\", "\\\\")
        .replace("\n", "\\n")
        .replace("'", "\\'");
  }
}
