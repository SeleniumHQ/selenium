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

package com.thoughtworks.selenium.webdriven.commands;

import com.thoughtworks.selenium.Wait;
import com.thoughtworks.selenium.webdriven.ScriptMutator;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class WaitForCondition extends SeleneseCommand<Void> {

  private final ScriptMutator mutator;

  public WaitForCondition(ScriptMutator mutator) {
    this.mutator = mutator;
  }

  @Override
  protected Void handleSeleneseCommand(final WebDriver driver, String script,
      final String timeout) {
    StringBuilder builder = new StringBuilder();
    mutator.mutate(script, builder);
    final String modified = builder.toString();

    new Wait() {
      @Override
      public boolean until() {
        Object result = ((JavascriptExecutor) driver).executeScript(modified);

        // Although the conditions should return a boolean, JS has a loose
        // definition of "true" Try and meet that definition.
        if (result == null) {
          return false;
        } else if (result instanceof String) {
          return !"".equals(result);
        } else if (result instanceof Boolean) {
          return (Boolean) result;
        } else {
          return true;
        }
      }
    }.wait("Failed to resolve " + script, Long.valueOf(timeout));

    return null;
  }
}
