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

package org.openqa.selenium.devtools.noop;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toSet;

import java.util.Collection;
import java.util.Set;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.devtools.CdpInfo;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.Events;
import org.openqa.selenium.devtools.idealized.Javascript;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.idealized.log.Log;
import org.openqa.selenium.devtools.idealized.target.Target;
import org.openqa.selenium.internal.Require;

public class NoOpDomains implements Domains {

  private static final BuildInfo INFO = new BuildInfo();

  private static final String WARNING =
      "You are using a no-op implementation of the CDP. The most likely reason"
          + " for this is that Selenium was unable to find an implementation of the "
          + "CDP protocol that matches your browser. "
          + "Browser version: %s.%n"
          + "Available CDP implementations: %s.%n"
          + "Please be sure to include an "
          + "implementation on the classpath, possibly by adding a new (maven) "
          + "dependency of `org.seleniumhq.selenium:selenium-devtools-vNN:%s` where "
          + "`NN` matches the major version of the browser you're using.";

  private final String browserVersion;
  private final Collection<CdpInfo> availableCdpImplementations;

  /**
   * @deprecated Use {@link #NoOpDomains(String, Collection)} instead.
   */
  @Deprecated(forRemoval = true)
  public NoOpDomains() {
    this("?", emptyList());
  }

  public NoOpDomains(String browserVersion, Collection<CdpInfo> availableCdpImplementations) {
    this.browserVersion = browserVersion;
    this.availableCdpImplementations =
        Require.nonNull("Available CDP implementations", availableCdpImplementations);
  }

  @Override
  public Events<?, ?> events() {
    throw new DevToolsException(message());
  }

  @Override
  public Javascript<?, ?> javascript() {
    throw new DevToolsException(message());
  }

  @Override
  public Network<?, ?> network() {
    throw new DevToolsException(message());
  }

  @Override
  public Target target() {
    throw new DevToolsException(message());
  }

  @Override
  public Log log() {
    throw new DevToolsException(message());
  }

  @Override
  public void disableAll() {
    throw new DevToolsException(message());
  }

  private String message() {
    Set<Integer> cdpVersions =
        availableCdpImplementations.stream().map(info -> info.getMajorVersion()).collect(toSet());
    return String.format(WARNING, browserVersion, cdpVersions, INFO.getReleaseLabel());
  }
}
