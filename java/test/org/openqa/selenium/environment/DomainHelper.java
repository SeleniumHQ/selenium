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

package org.openqa.selenium.environment;

import com.google.common.net.InetAddresses;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.internal.Require;

public class DomainHelper {

  private final AppServer appServer;

  public DomainHelper(AppServer appServer) {
    this.appServer = appServer;
  }

  public String getUrlForFirstValidHostname(String path) {
    Require.precondition(
        isValidHostname(appServer.getHostName()),
        "Expected valid hostname but was %s",
        appServer.getHostName());
    return appServer.whereIs(path);
  }

  public String getSecureUrlForFirstValidHostname(String path) {
    Require.precondition(
        isValidHostname(appServer.getHostName()),
        "Expected valid hostname but was %s",
        appServer.getHostName());
    return appServer.whereIsSecure(path);
  }

  public String getUrlForSecondValidHostname(String path) {
    Require.precondition(
        isValidHostname(appServer.getAlternateHostName()),
        "Expected valid hostname but was %s",
        appServer.getAlternateHostName());
    return appServer.whereElseIs(path);
  }

  public boolean checkIsOnValidHostname() {
    boolean correct = getHostName() != null && isValidHostname(getHostName());
    if (!correct) {
      System.out.println(
          "Skipping test: unable to find domain name to use, hostname: " + getHostName());
    }
    return correct;
  }

  public boolean checkIsOnValidSubDomain() {
    boolean correct = getHostName() != null && isValidSubDomain(getHostName());

    if (!correct) {
      System.out.println(
          "Skipping test: unable to find sub domain name to use, hostname: " + getHostName());
    }
    return correct;
  }

  public boolean checkHasValidAlternateHostname() {
    String hostname = appServer.getAlternateHostName();
    boolean correct = getHostName() != null && isValidHostname(hostname);
    if (!correct) {
      System.out.println(
          "Skipping test: unable to find alternate domain name to use, hostname: " + hostname);
    }
    return correct;
  }

  private boolean isValidSubDomain(String hostname) {
    /*
     * /etc/hosts needs to have e.g.
     *
     * 127.0.0.1       sub.selenium.tests
     *
     */
    return hostname.split("\\.").length >= 3;
  }

  public boolean isValidHostname(String hostname) {
    // Strip the IPv6 zone index, if present. For example, "fe80::1%eth0" becomes "fe80::1".
    int zoneIndexStart = hostname.indexOf('%');
    if (zoneIndexStart >= 0) {
      hostname = hostname.substring(0, zoneIndexStart);
    }
    return !InetAddresses.isInetAddress(hostname) && !"localhost".equals(hostname);
  }

  public String getHostName() {
    return appServer.getHostName();
  }
}
