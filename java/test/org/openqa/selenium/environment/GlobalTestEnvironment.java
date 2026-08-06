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

package org.openqa.selenium.environment;

import static java.util.Objects.requireNonNull;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;

/** Used to hold a TestEnvironment in a static class-level field. */
public class GlobalTestEnvironment {
  private static final Logger LOG = Logger.getLogger(GlobalTestEnvironment.class.getName());

  @Nullable private static TestEnvironment environment = null;

  public static boolean isSetUp() {
    return environment != null;
  }

  public static TestEnvironment get() {
    return requireNonNull(environment, "Environment not created");
  }

  public static synchronized TestEnvironment getOrCreate(boolean needsSecureServer) {
    if (needsSecureServer && environment != null && !environment.isSecure()) {
      LOG.log(Level.WARNING, "Restarting appServer with secureServer=true");
      environment.stop();
      environment = null;
    }
    if (environment == null) {
      environment = new InProcessTestEnvironment(needsSecureServer);
      environment.assertIsValid();
    }
    return environment;
  }

  public static void stop() {
    if (environment != null) {
      environment.stop();
    }
    environment = null;
  }
}
