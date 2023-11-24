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

package org.openqa.selenium.environment.webserver;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.NetworkUtils;

public interface AppServer {

  String getHostName();

  String getAlternateHostName();

  String whereIs(String relativeUrl);

  String whereElseIs(String relativeUrl);

  String whereIsSecure(String relativeUrl);

  String whereIsWithCredentials(String relativeUrl, String user, String password);

  String create(Page page);

  void start();

  void stop();

  static String detectHostname() {
    String hostnameFromProperty = System.getenv("HOSTNAME");
    return hostnameFromProperty == null ? "localhost" : hostnameFromProperty;
  }

  static String detectAlternateHostname() {
    String alternativeHostnameFromProperty = System.getenv("ALTERNATIVE_HOSTNAME");
    if (alternativeHostnameFromProperty != null) {
      return alternativeHostnameFromProperty;
    }

    NetworkUtils networkUtils = new NetworkUtils();
    try {
      return networkUtils.getNonLoopbackAddressOfThisMachine();
    } catch (WebDriverException e) {
      return networkUtils.getPrivateLocalAddress();
    }
  }
}
