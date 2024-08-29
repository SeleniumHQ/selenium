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

package org.openqa.selenium.devtools.v128;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.ConverterFunctions;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.browser.model.BrowserContextID;
import org.openqa.selenium.devtools.idealized.target.model.SessionID;
import org.openqa.selenium.devtools.idealized.target.model.TargetID;
import org.openqa.selenium.devtools.v128.target.Target;
import org.openqa.selenium.devtools.v128.target.model.TargetInfo;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class v128Target implements org.openqa.selenium.devtools.idealized.target.Target {

  @Override
  public Command<Void> detachFromTarget(
      Optional<SessionID> sessionId, Optional<TargetID> targetId) {
    return Target.detachFromTarget(
        sessionId.map(
            id -> new org.openqa.selenium.devtools.v128.target.model.SessionID(id.toString())),
        targetId.map(
            id -> new org.openqa.selenium.devtools.v128.target.model.TargetID(id.toString())));
  }

  @Override
  public Command<List<org.openqa.selenium.devtools.idealized.target.model.TargetInfo>>
      getTargets() {
    Function<JsonInput, List<TargetInfo>> mapper =
        ConverterFunctions.map("targetInfos", new TypeToken<List<TargetInfo>>() {}.getType());

    return new Command<>(
        Target.getTargets(Optional.empty()).getMethod(),
        Map.of(),
        input -> {
          List<TargetInfo> infos = mapper.apply(input);
          return infos.stream()
              .map(
                  info ->
                      new org.openqa.selenium.devtools.idealized.target.model.TargetInfo(
                          new TargetID(info.getTargetId().toString()),
                          info.getType(),
                          info.getTitle(),
                          info.getUrl(),
                          info.getAttached(),
                          info.getOpenerId().map(id -> new TargetID(id.toString())),
                          info.getBrowserContextId()
                              .map(id -> new BrowserContextID(id.toString()))))
              .collect(Collectors.toUnmodifiableList());
        });
  }

  @Override
  public Command<SessionID> attachToTarget(TargetID targetId) {
    Function<JsonInput, org.openqa.selenium.devtools.v128.target.model.SessionID> mapper =
        ConverterFunctions.map(
            "sessionId", org.openqa.selenium.devtools.v128.target.model.SessionID.class);

    return new Command<>(
        "Target.attachToTarget",
        Map.of(
            "targetId",
            new org.openqa.selenium.devtools.v128.target.model.TargetID(targetId.toString()),
            "flatten",
            true),
        input -> {
          org.openqa.selenium.devtools.v128.target.model.SessionID id = mapper.apply(input);
          return new SessionID(id.toString());
        });
  }

  @Override
  public Command<Void> setAutoAttach() {
    return Target.setAutoAttach(true, false, Optional.of(true), Optional.empty());
  }

  @Override
  public Event<TargetID> detached() {
    return new Event<>(
        "Target.detachedFromTarget",
        input -> {
          Function<JsonInput, org.openqa.selenium.devtools.v128.target.model.TargetID> converter =
              ConverterFunctions.map(
                  "targetId", org.openqa.selenium.devtools.v128.target.model.TargetID.class);
          return new TargetID(converter.apply(input).toString());
        });
  }
}
