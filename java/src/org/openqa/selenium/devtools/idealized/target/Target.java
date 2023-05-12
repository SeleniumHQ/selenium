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

package org.openqa.selenium.devtools.idealized.target;

import java.util.List;
import java.util.Optional;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.target.model.SessionID;
import org.openqa.selenium.devtools.idealized.target.model.TargetID;
import org.openqa.selenium.devtools.idealized.target.model.TargetInfo;

public interface Target {

  /** Detaches session with given id. */
  Command<Void> detachFromTarget(Optional<SessionID> sessionId, Optional<TargetID> targetId);

  Command<List<TargetInfo>> getTargets();

  Command<SessionID> attachToTarget(TargetID targetId);

  Command<Void> setAutoAttach();

  Event<TargetID> detached();
}
