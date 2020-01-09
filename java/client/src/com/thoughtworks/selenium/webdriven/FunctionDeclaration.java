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

import java.util.regex.Pattern;

/**
 * Models a function declaration. That is, it provides an implementation of a particular Javascript
 * function.
 */
public class FunctionDeclaration implements ScriptMutator {
  private final Pattern pattern;
  private final String function;

  /**
   * @param raw The original function (eg: "selenium.isElementPresent")
   * @param result The body of the function implementation.
   */
  public FunctionDeclaration(String raw, String result) {
    String base = raw.replace(".", "\\s*\\.\\s*");

    pattern = Pattern.compile(".*" + base + "\\s*\\(\\s*\\).*");

    function = raw + " = function() { " + result + " }; ";
  }

  @Override
  public void mutate(String script, StringBuilder outputTo) {
    if (!pattern.matcher(script).matches()) {
      return;
    }

    outputTo.append(function);
  }

}
