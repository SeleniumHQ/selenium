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

package org.openqa.selenium.testing.drivers;

import java.io.File;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.build.Build;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.ie.InternetExplorerDriverLogLevel;
import org.openqa.selenium.ie.InternetExplorerDriverService;
import org.openqa.selenium.ie.InternetExplorerOptions;

class LocallyBuiltInternetExplorerDriver extends InternetExplorerDriver {
  public LocallyBuiltInternetExplorerDriver(Capabilities capabilities) {
    super(getService(), new InternetExplorerOptions().merge(capabilities));
  }

  private static InternetExplorerDriverService getService() {
    new Build().of("//cpp/iedriverserver:win32").go();

    InternetExplorerDriverService.Builder builder =
        new InternetExplorerDriverService.Builder()
            .usingDriverExecutable(
                InProject.locate(
                        "build/cpp/Win32/Release/IEDriverServer.exe",
                        "cpp/prebuilt/Win32/Release/IEDriverServer.exe")
                    .toFile())
            .usingAnyFreePort()
            .withLogFile(new File("iedriver.log"))
            .withLogLevel(
                InternetExplorerDriverLogLevel.valueOf(System.getProperty("log_level", "INFO")));
    return builder.build();
  }
}
