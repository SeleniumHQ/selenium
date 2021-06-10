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

package org.openqa.selenium.devtools.v88;

import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.Events;
import org.openqa.selenium.devtools.idealized.Javascript;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.idealized.log.Log;
import org.openqa.selenium.devtools.idealized.target.Target;
import org.openqa.selenium.internal.Require;

public class V88Domains implements Domains {

  private final V88Javascript js;
  private final V88Events events;
  private final V88Log log;
  private final V88Network network;
  private final V88Target target;

  public V88Domains(DevTools devtools) {
    Require.nonNull("DevTools", devtools);
    events = new V88Events(devtools);
    js = new V88Javascript(devtools);
    log = new V88Log();
    network = new V88Network(devtools);
    target = new V88Target();
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
