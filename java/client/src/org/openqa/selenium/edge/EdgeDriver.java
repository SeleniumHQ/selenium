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
package org.openqa.selenium.edge;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumDriverCommandExecutor;
import org.openqa.selenium.internal.Require;

/**
 * A {@link WebDriver} implementation that controls an Edge browser running on the local machine.
 * It requires an <code>edgedriver</code> executable to be available in PATH.
 *
 * @see <a href="https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/">Microsoft WebDriver</a>
 */
public class EdgeDriver extends ChromiumDriver {

  public EdgeDriver() { this(new EdgeOptions()); }

  public EdgeDriver(EdgeOptions options) {
    this(new EdgeDriverService.Builder().build(), options);
  }

  public EdgeDriver(EdgeDriverService service) {
    this(service, new EdgeOptions());
  }

  public EdgeDriver(EdgeDriverService service, EdgeOptions options) {
    super(new ChromiumDriverCommandExecutor("ms", service), Require.nonNull("Driver options", options), EdgeOptions.CAPABILITY);
  }

  @Deprecated
  public EdgeDriver(Capabilities capabilities) {
    this(new EdgeDriverService.Builder().build(), new EdgeOptions().merge(capabilities));
  }
}
