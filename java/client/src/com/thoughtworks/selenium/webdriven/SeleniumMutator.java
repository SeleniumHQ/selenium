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
 * Add a function backed by the closure-based implementation of Selenium Core.
 */
public class SeleniumMutator implements ScriptMutator {
  private final Pattern pattern;
  private final String method;
  private final String atom;

  public SeleniumMutator(String method, String atom) {
    String raw = ".*" + method.replace(".", "\\s*\\.\\s*") + ".*";
    this.pattern = Pattern.compile(raw);
    this.method = method;
    this.atom = atom;
  }

  @Override
  public void mutate(String script, StringBuilder appendTo) {
    if (!pattern.matcher(script).matches()) {
      return;
    }

    // Alias the raw atom and set "this" to be the pre-declared selenium object.
    appendTo.append(String.format("%s = function() { return (%s).apply(null, arguments);};",
        method, atom));
  }
}
