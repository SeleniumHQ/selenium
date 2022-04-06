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

package org.openqa.selenium.devtools.v98;

import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.Events;
import org.openqa.selenium.devtools.idealized.Javascript;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.idealized.log.Log;
import org.openqa.selenium.devtools.idealized.target.Target;
import org.openqa.selenium.devtools.v98.V98Events;
import org.openqa.selenium.devtools.v98.V98Javascript;
import org.openqa.selenium.devtools.v98.V98Log;
import org.openqa.selenium.devtools.v98.V98Network;
import org.openqa.selenium.devtools.v98.V98Target;
import org.openqa.selenium.internal.Require;

public class V98Domains implements Domains {

  private final V98Javascript js;
  private final V98Events events;
  private final V98Log log;
  private final V98Network network;
  private final V98Target target;

  public V98Domains(DevTools devtools) {
    Require.nonNull("DevTools", devtools);
    events = new V98Events(devtools);
    js = new V98Javascript(devtools);
    log = new V98Log();
    network = new V98Network(devtools);
    target = new V98Target();
  }

  @Override
  public Events<?, ?> events() {
    return events;
  }

  @Override
  public Javascript<?, ?> javascript() {
    return js;
  }

  @Override
  public Network<?, ?> network() {
    return network;
  }

  @Override
  public Target target() {
    return target;
  }

  @Override
  public Log log() {
    return log;
  }
}
