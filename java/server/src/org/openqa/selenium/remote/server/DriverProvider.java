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
package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;

/**
 * Classes that implement this interface are used by {org.openqa.selenium.remote.server.DriverFactory}
 * to create new driver instances associated with specific set of capabilities.
 *
 * When a driver factory registers a driver provider it checks ability of the provider to create
 * instances by a call to its isDriverAvailable method. Default driver provide implementation
 * checks for presence of the driver class in the classpath. Other driver provider classes may
 * perform more sophisticated verification.
 *
 * If the driver provides is verified successfully it is registered as the driver provider
 * associated with the capabilities returned by getProvidedCapabilities method.
 *
 * Selenium Server trusts the driver providers, it does not check that a driver provider actually
 * creates driver instances that have the specified capabilities.
 */
public interface DriverProvider {

  /**
   * The provider "promises" that created driver instances will have (at least) this set of
   * capabilities. The grid uses this information to match the capabilities requested by the client
   * against the capabilities provided by all registered providers to pick the "best" one.
   * @return capabilities provided
   */
  Capabilities getProvidedCapabilities();

  /**
   * Checks if the provider can create driver instance with the desired capabilities.
   *
   * @param capabilities desired capabilities to check if the provider can create a driver instance
   * @return true if the provider can create driver instance with the desired capabilities.
   */
  boolean canCreateDriverInstanceFor(Capabilities capabilities);

  /**
   * Creates a new driver instance. The specified capabilities are to be passed to the driver
   * constructor.
   *
   * @param capabilities Capabilities are to be passed to the driver constructor.
   * @return A new driver instance
   */
  WebDriver newInstance(Capabilities capabilities);
}
