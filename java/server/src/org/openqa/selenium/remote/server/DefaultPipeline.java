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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.remote.service.DriverService;

import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Stream;

/**
 * Used to represent the {@link NewSessionPipeline} that is typically used in the
 * {@link SeleniumServer}}.
 */
public class DefaultPipeline {

  private static final Logger LOG = Logger.getLogger(DefaultPipeline.class.getName());

  private DefaultPipeline() {
    // Utility class
  }

  public static NewSessionPipeline.Builder createPipelineWithDefaultFallbacks() {
    // Set up the pipeline to inject
    SessionFactory fallback = Stream.of(
        "org.openqa.selenium.chrome.ChromeDriverService",
        "org.openqa.selenium.firefox.GeckoDriverService",
        "org.openqa.selenium.edge.EdgeDriverService",
        "org.openqa.selenium.ie.InternetExplorerDriverService",
        "org.openqa.selenium.safari.SafariDriverService")
        .filter(name -> {
          try {
            Class.forName(name).asSubclass(DriverService.class);
            return true;
          } catch (ReflectiveOperationException e) {
            return false;
          }
        })
        .findFirst()
        .map(serviceName -> {
          SessionFactory factory = new ServicedSession.Factory(serviceName);
          return (SessionFactory) (dialects, caps) -> {
            LOG.info("Using default factory: " + serviceName);
            return factory.apply(dialects, caps);
          };
        })
        .orElse((dialects, caps) -> Optional.empty());

    return NewSessionPipeline.builder()
        .add(new ActiveSessionFactory())
        .fallback(fallback);
  }
}
