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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;

public class SafariDriverService extends DriverService {

  private static final File SAFARI_DRIVER_EXECUTABLE = new File("/usr/bin/safaridriver");

  public SafariDriverService(File executable, int port, ImmutableList<String> args,
                             ImmutableMap<String, String> environment) throws IOException {
    super(executable, port, args, environment);
  }

  public static SafariDriverService createDefaultService(SafariOptions options) {
    if (SAFARI_DRIVER_EXECUTABLE.exists()) {
      return new Builder().usingPort(options.getPort()).build();
    }
    return null;
  }

  public static class Builder extends DriverService.Builder<
    SafariDriverService, SafariDriverService.Builder> {

    protected File findDefaultExecutable() {
      return SAFARI_DRIVER_EXECUTABLE;
    }

    protected ImmutableList<String> createArgs() {
      return ImmutableList.of("--port", String.valueOf(getPort()));
    }

    protected SafariDriverService createDriverService(File exe, int port, ImmutableList<String> args,
                                              ImmutableMap<String, String> environment) {
      try {
        return new SafariDriverService(exe, port, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
