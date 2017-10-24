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

import java.util.Set;

/**
 * Some implementations of WebDriver, notably those that support native testing, need the ability
 * to switch between the native and web-based contexts. This can be achieved by using this
 * interface.
 */
public interface ContextAware {

  /**
   * Switch the focus of future commands for this driver to the context with the given name.
   *
   * @param name The name of the context as returned by {@link #getContextHandles()}.
   * @return This driver focused on the given window.
   * @throws NoSuchContextException If the context cannot be found.
   */
  WebDriver context(String name);

  /**
   * Return a set of context handles which can be used to iterate over all contexts of this
   * WebDriver instance
   *
   * @return A set of context handles which can be used to iterate over available contexts.
   */
  Set<String> getContextHandles();

  /**
   * Return an opaque handle to this context that uniquely identifies it within this driver
   * instance. This can be used to switch to this context at a later date
   *
   * @return The current context handle
   */
  String getContext();
}
