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

package org.openqa.selenium.chrome;

import java.util.List;
import java.util.Map;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumDriverCommandExecutor;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.service.DriverFinder;

/**
 * A {@link WebDriver} implementation that controls an Electron application running on the local
 * machine. Driver lifecycle and discovery are managed by {@link ChromeDriverService}.
 *
 * <p>Casting and Chrome DevTools Protocol commands are not supported on Electron sessions.
 *
 * @see ElectronOptions
 */
public class ElectronDriver extends ChromiumDriver {

  public ElectronDriver(ElectronOptions options) {
    this(options, ClientConfig.defaultConfig());
  }

  public ElectronDriver(ElectronOptions options, ClientConfig clientConfig) {
    this(ChromeDriverService.createDefaultService(), options, clientConfig);
  }

  public ElectronDriver(ChromeDriverService service, ElectronOptions options) {
    this(service, options, ClientConfig.defaultConfig());
  }

  public ElectronDriver(
      ChromeDriverService service, ElectronOptions options, ClientConfig clientConfig) {
    super(
        generateExecutor(service, options, clientConfig),
        options,
        ElectronOptions.CAPABILITY,
        clientConfig);
  }

  private static ChromiumDriverCommandExecutor generateExecutor(
      ChromeDriverService service, ElectronOptions options, ClientConfig clientConfig) {
    Require.nonNull("Driver service", service);
    Require.nonNull("Driver options", options);
    Require.nonNull("Driver clientConfig", clientConfig);
    DriverFinder finder = new DriverFinder(service, options);
    service.setExecutable(finder.getDriverPath());
    return new ChromiumDriverCommandExecutor(service, Map.of(), clientConfig);
  }

  @Override
  public List<Map<String, String>> getCastSinks() {
    throw new UnsupportedOperationException("Casting is not supported on Electron applications");
  }

  @Override
  public String getCastIssueMessage() {
    throw new UnsupportedOperationException("Casting is not supported on Electron applications");
  }

  @Override
  public void selectCastSink(String deviceName) {
    throw new UnsupportedOperationException("Casting is not supported on Electron applications");
  }

  @Override
  public void startDesktopMirroring(String deviceName) {
    throw new UnsupportedOperationException("Casting is not supported on Electron applications");
  }

  @Override
  public void startTabMirroring(String deviceName) {
    throw new UnsupportedOperationException("Casting is not supported on Electron applications");
  }

  @Override
  public void stopCasting(String deviceName) {
    throw new UnsupportedOperationException("Casting is not supported on Electron applications");
  }

  @Override
  public Map<String, Object> executeCdpCommand(String commandName, Map<String, Object> parameters) {
    throw new UnsupportedOperationException(
        "Chrome DevTools Protocol commands are not supported on Electron applications");
  }
}
