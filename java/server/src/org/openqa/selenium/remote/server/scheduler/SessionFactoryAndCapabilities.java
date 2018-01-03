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

import static java.util.logging.Level.WARNING;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.SessionFactory;

import java.util.Optional;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

class SessionFactoryAndCapabilities {

  private final Logger LOG = Logger.getLogger(SessionFactory.class.getName());

  private final ScheduledSessionFactory factory;
  private final Capabilities capabilities;

  SessionFactoryAndCapabilities(ScheduledSessionFactory factory, Capabilities capabilities) {
    this.factory = factory;
    this.capabilities = capabilities;
  }

  public ScheduledSessionFactory getSessionFactory() {
    return factory;
  }

  public Optional<ActiveSession> newSession(Set<Dialect> downstreamDialects) {
    try {
      return factory.apply(downstreamDialects, capabilities);
    } catch (SessionNotCreatedException e) {
      LOG.log(WARNING, "Session not created: " + e.getMessage(), e);
    } catch (Throwable e) {
      LOG.log(WARNING, "Session not created for unexpected reason: " + e.getMessage(), e);
    }
    return Optional.empty();
  }
}
