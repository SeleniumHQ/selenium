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

package org.openqa.selenium.safari;

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.remote.Browser.SAFARI_TECH_PREVIEW;

public class SafariTechPreviewDriverService extends DriverService {

  /**
   * System property that defines the location of the tech preview safaridriver executable that
   * will be used by the {@link #createDefaultService() default service}.
   */
  public static final String TP_SAFARI_DRIVER_EXE_PROPERTY = "webdriver.tp.safari.driver";

  private static final File TP_SAFARI_DRIVER_EXECUTABLE =
    new File("/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver");

  public SafariTechPreviewDriverService(
    File executable,
    int port,
    List<String> args,
    Map<String, String> environment) throws IOException {
    super(executable, port, DEFAULT_TIMEOUT, args, environment);
  }

  public SafariTechPreviewDriverService(
    File executable,
    int port,
    Duration timeout,
    List<String> args,
    Map<String, String> environment) throws IOException {
    super(executable, port, timeout, args, environment);
  }

  public static SafariTechPreviewDriverService createDefaultService() {
    return new Builder().build();
  }

  @Override
  protected void waitUntilAvailable() {
    try {
      PortProber.waitForPortUp(getUrl().getPort(), (int) getTimeout().toMillis(), MILLISECONDS);
    } catch (RuntimeException e) {
      throw new WebDriverException(e);
    }
  }

  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<
    SafariTechPreviewDriverService, SafariTechPreviewDriverService.Builder> {

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (SAFARI_TECH_PREVIEW.browserName().equals(capabilities.getBrowserName())) {
        score++;
      }

      return score;
    }

    @Override
    protected File findDefaultExecutable() {
      File exe;
      if (System.getProperty(TP_SAFARI_DRIVER_EXE_PROPERTY) != null) {
        exe = new File(System.getProperty(TP_SAFARI_DRIVER_EXE_PROPERTY));
      } else {
        exe = TP_SAFARI_DRIVER_EXECUTABLE;
      }

      if (!exe.isFile()) {
        throw new WebDriverException("Unable to find driver executable: " + exe);
      }

      return exe;
    }

    @Override
    protected List<String> createArgs() {
      return Arrays.asList("--port", String.valueOf(getPort()));
    }

    @Override
    protected SafariTechPreviewDriverService createDriverService(
      File exe,
      int port,
      Duration timeout,
      List<String> args,
      Map<String, String> environment) {
      try {
        return new SafariTechPreviewDriverService(exe, port, timeout, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
