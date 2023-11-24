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

package org.openqa.selenium.devtools.v85;

import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.Events;
import org.openqa.selenium.devtools.idealized.Javascript;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.idealized.log.Log;
import org.openqa.selenium.devtools.idealized.target.Target;
import org.openqa.selenium.internal.Require;

public class V85Domains implements Domains {

  private final V85Javascript js;
  private final V85Events events;
  private final V85Log log;
  private final V85Network network;
  private final V85Target target;

  public V85Domains(DevTools devtools) {
    Require.nonNull("DevTools", devtools);
    events = new V85Events(devtools);
    js = new V85Javascript(devtools);
    log = new V85Log();
    network = new V85Network(devtools);
    target = new V85Target();
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
