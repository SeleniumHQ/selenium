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

import java.util.Optional;

/**
 * Describes, in general terms, a webdriver instance. This allows services to query the system at
 * run time and offer instances of particular {@link WebDriver} subclasses should they be available.
 */
@Beta
public interface WebDriverInfo {

  /**
   * @return A human-readable name that describes the browser.
   */
  String getDisplayName();

  /**
   * Describes the smallest set of {@link Capabilities} that could be used to create an instance of
   * this {@link WebDriver} implementation.
   * <p>
   * Note, this set does not need to be exhaustive: the only requirement is that if
   * {@link #isAvailable()} returns {@code true}, the returned {@link Capabilities} can be passed to
   * {@link #createDriver(Capabilities)} and a session will be created.
   *
   * @return The smallest set of {@link Capabilities} required to create an instance of this
   *   {@link WebDriver} implementation.
   */
  Capabilities getCanonicalCapabilities();

  /**
   * @return Whether a call to {@link #createDriver(Capabilities)} would succeed if given
   * {@code capabilities}.
   */
  boolean isSupporting(Capabilities capabilities);

  /**
   * @return Whether the driver has enabled the CDP interface.
   */
  boolean isSupportingCdp();

  /**
   * Often, a {@link WebDriver} instance needs one or more supporting files or executables to be
   * present (such as a vendor-provided executable which speaks the WebDriver Protocol). This means
   * that even though the driver classes might be present in Java, it would make no sense to attempt
   * to instantiate the driver itself.
   *
   * @return Whether or not the prerequisites required for this {@link WebDriver} are present.
   */
  boolean isAvailable();

  /**
   * Some browsers require all the resources of the current system in order to run (for example,
   * Safari on iOS) and so do not support multiple simultaneous sessions on the same system. Other
   * browsers can create isolated state for each new {@link WebDriver} instance.
   * <p>
   * The count of simultaneous sessions is typically 1, some multiple of the available number of
   * cores, or {@link Integer#MAX_VALUE} if the number is unbounded or no-one cares.
   */
  int getMaximumSimultaneousSessions();

  /**
   * Creates a new instance of the {@link WebDriver} implementation. The instance must be killed by
   * sending the "quit" command. If the instance cannot be created because {@link #isAvailable()} is
   * {@code false}, then {@link Optional#empty()} is returned. Otherwise, an attempt to start the
   * session is made and the result returned.
   */
  Optional<WebDriver> createDriver(Capabilities capabilities) throws SessionNotCreatedException;
}
