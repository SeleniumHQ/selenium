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

package org.openqa.selenium.remote;

import java.util.function.Consumer;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.module.LogInspector;

@Beta
class RemoteScript implements Script {
  private final BiDi biDi;
  private final LogInspector logInspector;

  public RemoteScript(WebDriver driver) {
    this.biDi = ((HasBiDi) driver).getBiDi();
    this.logInspector = new LogInspector(driver);
  }

  @Override
  public long addConsoleMessageHandler(Consumer<ConsoleLogEntry> consumer) {
    return this.logInspector.onConsoleEntry(consumer);
  }

  @Override
  public void removeConsoleMessageHandler(long id) {
    this.biDi.removeListener(id);
  }

  @Override
  public long addJavaScriptErrorHandler(Consumer<JavascriptLogEntry> consumer) {
    return this.logInspector.onJavaScriptException(consumer);
  }

  @Override
  public void removeJavaScriptErrorHandler(long id) {
    this.biDi.removeListener(id);
  }
}
