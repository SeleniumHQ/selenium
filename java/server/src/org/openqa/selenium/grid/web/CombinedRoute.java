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

package org.openqa.selenium.grid.web;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.remote.http.HttpRequest;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

public class CombinedRoute extends Route<CombinedRoute> {

  public static final Logger LOG = Logger.getLogger(Route.class.getName());
  private final List<Routes> factories;

  CombinedRoute(List<Routes> factories) {
    this.factories = ImmutableList.copyOf(factories);
  }

  @Override
  protected void validate() {
    // No-op
  }

  @Override
  protected CommandHandler newHandler(HttpRequest request) {
    for (Routes factory : factories) {
      try {
        Optional<CommandHandler> handler = factory.match(request);
        if (handler.isPresent()) {
          return handler.get();
        }
      } catch (IllegalArgumentException e) {
        LOG.warning(e.getMessage());
        // ignore and carry on
      }
    }
    return getFallback();
  }

}
