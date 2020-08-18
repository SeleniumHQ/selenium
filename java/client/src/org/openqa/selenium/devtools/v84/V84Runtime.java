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

package org.openqa.selenium.devtools.v84;

import com.google.common.collect.ImmutableList;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.runtime.RuntimeDomain;
import org.openqa.selenium.devtools.idealized.runtime.model.RemoteObject;
import org.openqa.selenium.devtools.v84.runtime.model.ConsoleAPICalled;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class V84Runtime implements RuntimeDomain {
  @Override
  public Command<Void> enable() {
    return org.openqa.selenium.devtools.v84.runtime.Runtime.enable();
  }

  @Override
  public Event<org.openqa.selenium.devtools.idealized.runtime.model.ConsoleAPICalled> consoleAPICalled() {
    return new Event<>(
      org.openqa.selenium.devtools.v84.runtime.Runtime.consoleAPICalled().getMethod(),
      input -> {
        ConsoleAPICalled v84 = input.read(ConsoleAPICalled.class);
        long ts = new BigDecimal(v84.getTimestamp().toJson()).longValue();

        List<Object> modifiedArgs = v84.getArgs().stream()
          .map(obj -> new RemoteObject(
            obj.getType().toString(),
            obj.getValue().orElse(null)))
          .map(obj -> (Object) obj)
          .collect(ImmutableList.toImmutableList());

        return new org.openqa.selenium.devtools.idealized.runtime.model.ConsoleAPICalled(
          v84.getType().toString(),
          Instant.ofEpochMilli(ts),
          modifiedArgs);
      }
    );
  }
}
