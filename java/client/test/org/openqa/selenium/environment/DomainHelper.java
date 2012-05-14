/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.environment;

import org.openqa.selenium.environment.webserver.AppServer;

import com.google.common.base.Preconditions;

public class DomainHelper {

  private AppServer appServer;

  public DomainHelper(AppServer appServer) {
    this.appServer = appServer;
  }

  public String getUrlForFirstValidHostname(String path) {
    Preconditions.checkArgument(
      isValidHostname(appServer.getHostName()),
      "Expected valid hostname but was %s",
      appServer.getHostName());
    return appServer.whereIs(path);
  }

  public String getUrlForSecondValidHostname(String path) {
    Preconditions.checkArgument(
      isValidHostname(appServer.getAlternateHostName()),
      "Expected valid hostname but was %s",
      appServer.getHostName());
    return appServer.whereElseIs(path);
  }

  public boolean checkIsOnValidHostname() {
    boolean correct = getHostName() != null && isValidHostname(getHostName());
    if (!correct) {
      System.out.println("Skipping test: unable to find domain name to use, hostname: " + getHostName());
    }
    return correct;
  }

  public boolean checkIsOnValidSubDomain() {
    boolean correct = getHostName() != null && isValidSubDomain(getHostName());

    if (!correct) {
      System.out.println("Skipping test: unable to find sub domain name to use, hostname: " + getHostName());
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

  private boolean isIpv4Address(String string) {
    return string.matches("\\d{1,3}(?:\\.\\d{1,3}){3}");
  }

  public boolean isValidHostname(String hostname) {
    return !isIpv4Address(hostname) && !"localhost".equals(hostname);
  }

  public String getHostName() {
    return appServer.getHostName();
  }
}
