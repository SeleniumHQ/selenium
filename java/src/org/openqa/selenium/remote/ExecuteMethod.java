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

import static java.util.Objects.requireNonNull;
import static java.util.Objects.requireNonNullElse;

import java.util.Map;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

/**
 * An encapsulation of {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(String,
 * Object...)}.
 */
@NullMarked
public interface ExecuteMethod {
  /**
   * Execute the given command on the remote webdriver server. Any exceptions will be thrown by the
   * underlying execute method.
   *
   * @param commandName The remote command to execute
   * @param parameters The parameters to execute that command with
   * @return The result of {@link Response#getValue()}.
   */
  @Nullable Object execute(String commandName, @Nullable Map<String, ?> parameters);

  /**
   * Execute the given command and return the default value if the command return null.
   *
   * @return non-nullable value of type T.
   */
  @SuppressWarnings("unchecked")
  default <T> T execute(String commandName, @Nullable Map<String, ?> parameters, T defaultValue) {
    return (T) requireNonNullElse(execute(commandName, parameters), defaultValue);
  }

  /**
   * Execute the given command and cast the returned value to T.
   *
   * @return non-nullable value of type T.
   */
  @SuppressWarnings("unchecked")
  default <T> T executeAs(String commandName, @Nullable Map<String, ?> parameters) {
    return (T) requireNonNull(execute(commandName, parameters));
  }

  /**
   * Execute the given command without parameters and cast the returned value to T.
   *
   * @return non-nullable value of type T.
   */
  @SuppressWarnings("unchecked")
  default <T> T execute(String commandName) {
    return (T) requireNonNull(execute(commandName, null));
  }
}
