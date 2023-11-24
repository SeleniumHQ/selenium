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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;

/** Used to identify a browser based on its name. */
public interface Browser {

  Browser CHROME = () -> "chrome";
  Browser EDGE =
      new Browser() {
        @Override
        public String browserName() {
          return "MicrosoftEdge";
        }

        @Override
        public boolean is(String browserName) {
          return browserName().equals(browserName) || "msedge".equals(browserName);
        }
      };
  Browser HTMLUNIT = () -> "htmlunit";
  Browser IE = () -> "internet explorer";
  Browser FIREFOX = () -> "firefox";
  Browser OPERA =
      new Browser() {
        @Override
        public String browserName() {
          return "opera";
        }

        @Override
        public boolean is(String browserName) {
          return browserName().equals(browserName);
        }
      };
  Browser SAFARI =
      new Browser() {
        @Override
        public String browserName() {
          return "safari";
        }

        public boolean is(String browserName) {
          return browserName().equals(browserName) || "Safari".equals(browserName);
        }
      };
  Browser SAFARI_TECH_PREVIEW =
      new Browser() {
        @Override
        public String browserName() {
          return "Safari Technology Preview";
        }

        public boolean is(String browserName) {
          return browserName().equals(browserName);
        }
      };

  String browserName();

  default boolean is(String browserName) {
    return browserName().equals(browserName);
  }

  default boolean is(Capabilities caps) {
    Require.nonNull("Capabilities", caps);
    return is(caps.getBrowserName());
  }

  default String toJson() {
    return browserName();
  }
}
