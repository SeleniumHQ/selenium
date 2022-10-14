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

package org.openqa.selenium.devtools.v106;

import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.devtools.idealized.Events;
import org.openqa.selenium.devtools.idealized.Javascript;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.idealized.log.Log;
import org.openqa.selenium.devtools.idealized.target.Target;
import org.openqa.selenium.devtools.v106.V106Events;
import org.openqa.selenium.devtools.v106.V106Javascript;
import org.openqa.selenium.devtools.v106.V106Log;
import org.openqa.selenium.devtools.v106.V106Network;
import org.openqa.selenium.devtools.v106.V106Target;
import org.openqa.selenium.internal.Require;

public class V106Domains implements Domains {

  private final V106Javascript js;
  private final V106Events events;
  private final V106Log log;
  private final V106Network network;
  private final V106Target target;

  public V106Domains(DevTools devtools) {
    Require.nonNull("DevTools", devtools);
    events = new V106Events(devtools);
    js = new V106Javascript(devtools);
    log = new V106Log();
    network = new V106Network(devtools);
    target = new V106Target();
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
