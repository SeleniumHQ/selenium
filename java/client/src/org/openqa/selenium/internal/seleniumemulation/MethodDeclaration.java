/*
Copyright 2010 Selenium committers

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

import java.util.regex.Pattern;

public class MethodDeclaration implements ScriptMutator {
  private final Pattern pattern;
  private final String function;

  public MethodDeclaration(String raw, String result) {
    String base = raw.replace(".", "\\s*\\.\\s*");

    pattern = Pattern.compile(".*" + base + "\\s*\\(\\s*\\).*");

    function = raw + " = function() { " + result + " }";
  }

  public void mutate(String script, StringBuilder outputTo) {
    if (!pattern.matcher(script).matches()) {
      return;
    }

    outputTo.append(function);
  }
}
