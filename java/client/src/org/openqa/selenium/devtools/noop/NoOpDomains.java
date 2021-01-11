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

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.Events;
import org.openqa.selenium.devtools.idealized.Javascript;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.idealized.log.Log;
import org.openqa.selenium.devtools.idealized.target.Target;

public class NoOpDomains implements Domains {

  private static BuildInfo INFO = new BuildInfo();

  private final static String WARNING = String.format(
    "You are using a no-op implementation of the CDP. The most likely reason" +
    " for this is that Selenium was unable to find an implementation of the " +
    "CDP protocol that matches your browser. Please be sure to include an " +
    "implementation on the classpath, possibly by adding a new (maven) " +
    "dependency of `org.seleniumhq.selenium:selenium-devtools-vNN:%s` where " +
    "`NN` matches the major version of the browser you're using.",
    INFO.getReleaseLabel());

  @Override
  public Events<?, ?> events() {
    throw new DevToolsException(WARNING);
  }

  @Override
  public Javascript<?, ?> javascript() {
    throw new DevToolsException(WARNING);
  }

  @Override
  public Network<?, ?> network() {
    throw new DevToolsException(WARNING);
  }

  @Override
  public Target target() {
    throw new DevToolsException(WARNING);
  }

  @Override
  public Log log() {
    throw new DevToolsException(WARNING);
  }

  @Override
  public void disableAll() {
    throw new DevToolsException(WARNING);
  }
}
