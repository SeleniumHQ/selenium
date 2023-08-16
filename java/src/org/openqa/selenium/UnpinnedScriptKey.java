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

package org.openqa.selenium;

import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.WeakHashMap;

public class UnpinnedScriptKey extends ScriptKey {

  private static final WeakHashMap<JavascriptExecutor, Set<UnpinnedScriptKey>> pinnedScripts =
      new WeakHashMap<>();
  private final String script;
  private String scriptId;
  private final String scriptHandle;

  static UnpinnedScriptKey pin(JavascriptExecutor executor, String script) {
    UnpinnedScriptKey toReturn = new UnpinnedScriptKey(script);
    synchronized (pinnedScripts) {
      pinnedScripts.computeIfAbsent(executor, ignored -> new HashSet<>()).add(toReturn);
    }
    return toReturn;
  }

  static void unpin(JavascriptExecutor executor, UnpinnedScriptKey key) {
    synchronized (pinnedScripts) {
      pinnedScripts.getOrDefault(executor, new HashSet<>()).remove(key);
    }
  }

  static Set<UnpinnedScriptKey> getPinnedScripts(JavascriptExecutor executor) {
    Set<UnpinnedScriptKey> toReturn;
    synchronized (pinnedScripts) {
      toReturn = pinnedScripts.getOrDefault(executor, new HashSet<>());
    }
    return Collections.unmodifiableSet(toReturn);
  }

  public UnpinnedScriptKey(String script) {
    super(script);

    this.scriptHandle = UUID.randomUUID().toString().replace("-", "");
    this.script = script;
  }

  public void setScriptId(String id) {
    this.scriptId = id;
  }

  public String getScriptId() {
    return this.scriptId;
  }

  public String getScript() {
    return script;
  }

  public String getScriptHandle() {
    return scriptHandle;
  }

  public String creationScript() {
    return String.format(
        "function __webdriver_%s(arguments) { %s }", this.scriptHandle, this.script);
  }

  public String executionScript() {
    return String.format("return __webdriver_%s(arguments)", this.scriptHandle);
  }

  public String removalScript() {
    return String.format("__webdriver_%s = undefined", this.scriptHandle);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    if (!super.equals(o)) {
      return false;
    }

    UnpinnedScriptKey that = (UnpinnedScriptKey) o;
    return Objects.equals(this.script, that.script);
  }

  @Override
  public int hashCode() {
    return Objects.hash(super.hashCode(), script);
  }
}
