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
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.script.RemoteValue;

@Beta
public interface Script {

  /**
   * @deprecated Subscription ids are now represented as {@link String}. Use {@link
   *     #addConsoleMessageListener(Consumer)} instead.
   */
  @Deprecated(since = "4.46", forRemoval = true)
  long addConsoleMessageHandler(Consumer<ConsoleLogEntry> consumer);

  /**
   * @deprecated Subscription ids are now represented as {@link String}. Use {@link
   *     #removeConsoleMessageListener(String)} instead.
   */
  @Deprecated(since = "4.46", forRemoval = true)
  void removeConsoleMessageHandler(long id);

  String addConsoleMessageListener(Consumer<ConsoleLogEntry> consumer);

  void removeConsoleMessageListener(String id);

  /**
   * @deprecated Subscription ids are now represented as {@link String}. Use {@link
   *     #addJavaScriptErrorListener(Consumer)} instead.
   */
  @Deprecated(since = "4.46", forRemoval = true)
  long addJavaScriptErrorHandler(Consumer<JavascriptLogEntry> consumer);

  /**
   * @deprecated Subscription ids are now represented as {@link String}. Use {@link
   *     #removeJavaScriptErrorListener(String)} instead.
   */
  @Deprecated(since = "4.46", forRemoval = true)
  void removeJavaScriptErrorHandler(long id);

  String addJavaScriptErrorListener(Consumer<JavascriptLogEntry> consumer);

  void removeJavaScriptErrorListener(String id);

  /**
   * @deprecated Subscription ids are now represented as {@link String}. Use {@link
   *     #addDomMutationListener(Consumer)} instead.
   */
  @Deprecated(since = "4.46", forRemoval = true)
  long addDomMutationHandler(Consumer<DomMutation> event);

  /**
   * @deprecated Subscription ids are now represented as {@link String}. Use {@link
   *     #removeDomMutationListener(String)} instead.
   */
  @Deprecated(since = "4.46", forRemoval = true)
  void removeDomMutationHandler(long id);

  String addDomMutationListener(Consumer<DomMutation> event);

  void removeDomMutationListener(String id);

  String pin(String script);

  void unpin(String id);

  RemoteValue execute(String script, Object... args);
}
