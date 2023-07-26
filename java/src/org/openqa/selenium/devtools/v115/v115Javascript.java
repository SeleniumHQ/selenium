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

package org.openqa.selenium.devtools.v115;

import java.util.Optional;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.Javascript;
import org.openqa.selenium.devtools.v115.page.Page;
import org.openqa.selenium.devtools.v115.page.model.ScriptIdentifier;
import org.openqa.selenium.devtools.v115.runtime.Runtime;
import org.openqa.selenium.devtools.v115.runtime.model.BindingCalled;

public class v115Javascript extends Javascript<ScriptIdentifier, BindingCalled> {

  public v115Javascript(DevTools devtools) {
    super(devtools);
  }

  @Override
  protected Command<Void> enableRuntime() {
    return Runtime.enable();
  }

  @Override
  protected Command<Void> disableRuntime() {
    return Runtime.disable();
  }

  @Override
  protected Command<Void> doAddJsBinding(String scriptName) {
    return Runtime.addBinding(scriptName, Optional.empty(), Optional.empty());
  }

  @Override
  protected Command<Void> doRemoveJsBinding(String scriptName) {
    return Runtime.removeBinding(scriptName);
  }

  @Override
  protected Command<Void> enablePage() {
    return Page.enable();
  }

  @Override
  protected Command<Void> disablePage() {
    return Page.disable();
  }

  @Override
  protected Command<ScriptIdentifier> addScriptToEvaluateOnNewDocument(String script) {
    return Page.addScriptToEvaluateOnNewDocument(script, Optional.empty(), Optional.empty());
  }

  @Override
  protected Command<Void> removeScriptToEvaluateOnNewDocument(ScriptIdentifier id) {
    return Page.removeScriptToEvaluateOnNewDocument(id);
  }

  @Override
  protected Event<BindingCalled> bindingCalledEvent() {
    return Runtime.bindingCalled();
  }

  @Override
  protected String extractPayload(BindingCalled event) {
    return event.getPayload();
  }
}
