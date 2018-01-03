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

package org.openqa.selenium.remote.server.scheduler;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.SessionFactory;

import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;

class FakeSessionFactory implements SessionFactory {

  private final Predicate<Capabilities> predicate;

  public FakeSessionFactory(Predicate<Capabilities> predicate) {
    this.predicate = predicate;
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return predicate.test(capabilities);
  }

  @Override
  public Optional<ActiveSession> apply(
      Set<Dialect> downstreamDialects,
      Capabilities capabilities) {
    return Optional.of(new FakeActiveSession(downstreamDialects, capabilities));
  }
}
