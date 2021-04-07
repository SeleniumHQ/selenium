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

import org.openqa.selenium.internal.Require;

import java.net.URI;
import java.util.function.Predicate;
import java.util.function.Supplier;

/**
 * Indicates that a driver supports authenticating to a website in some way.
 *
 * @see Credentials
 * @see UsernameAndPassword
 */
public interface HasAuthentication {

  /**
   * Registers a check for whether a set of {@link Credentials} should be
   * used for a particular site, identified by its URI. If called multiple
   * times, the credentials will be checked in the order they've been added
   * and the first one to match will be used.
   */
  void register(Predicate<URI> whenThisMatches, Supplier<Credentials> useTheseCredentials);

  /**
   * As {@link #register(Predicate, Supplier)} but attempts to apply the
   * credentials for any request for authorization.
   */
  default void register(Supplier<Credentials> alwaysUseTheseCredentials) {
    Require.nonNull("Credentials", alwaysUseTheseCredentials);

    register(uri -> true, alwaysUseTheseCredentials);
  }

}
