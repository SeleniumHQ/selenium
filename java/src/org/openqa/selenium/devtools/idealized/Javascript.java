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

package org.openqa.selenium.devtools.idealized;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.internal.Require;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

public abstract class Javascript<SCRIPTID, BINDINGCALLED> {

  private final DevTools devtools;
  private final Map<String, ScriptId> pinnedScripts = new HashMap<>();
  private final Set<String> bindings = new HashSet<>();

  public Javascript(DevTools devtools) {
    this.devtools = Require.nonNull("DevTools", devtools);
  }

  public void disable() {
    devtools.send(disableRuntime());
    devtools.send(disablePage());

    pinnedScripts.values().forEach(id -> removeScriptToEvaluateOnNewDocument(id.getActualId()));

    pinnedScripts.clear();
  }

  protected abstract Command<Void> disablePage();

  protected abstract Command<Void> disableRuntime();

  public ScriptId pin(String exposeScriptAs, String script) {
    Require.nonNull("Script name", exposeScriptAs);
    Require.nonNull("Script", script);

    if (pinnedScripts.containsKey(script)) {
      return pinnedScripts.get(script);
    }

    devtools.send(enableRuntime());

    devtools.send(doAddJsBinding(exposeScriptAs));

    devtools.send(enablePage());

    SCRIPTID id = devtools.send(addScriptToEvaluateOnNewDocument(script));
    ScriptId scriptId = new ScriptId(id);

    pinnedScripts.put(script, scriptId);

    return scriptId;
  }

  public void addBindingCalledListener(Consumer<String> listener) {
    Require.nonNull("Listener", listener);

    devtools.send(enableRuntime());

    devtools.addListener(
      bindingCalledEvent(),
      event -> {
        String payload = extractPayload(event);
        listener.accept(payload);
      }
    );
  }

  public void addJsBinding(String scriptName) {
    Require.nonNull("Script name", scriptName);
    bindings.add(scriptName);
    doAddJsBinding(scriptName);
  }

  public void removeJsBinding(String scriptName) {
    Require.nonNull("Script name", scriptName);
    bindings.remove(scriptName);
    doRemoveJsBinding(scriptName);
  }

  protected abstract Command<Void> enableRuntime();

  protected abstract Command<Void> doAddJsBinding(String scriptName);

  protected abstract Command<Void> doRemoveJsBinding(String scriptName);

  protected abstract Command<Void> enablePage();

  protected abstract Command<SCRIPTID> addScriptToEvaluateOnNewDocument(String script);

  protected abstract Command<Void> removeScriptToEvaluateOnNewDocument(SCRIPTID id);

  protected abstract Event<BINDINGCALLED> bindingCalledEvent();

  protected abstract String extractPayload(BINDINGCALLED event);
}
