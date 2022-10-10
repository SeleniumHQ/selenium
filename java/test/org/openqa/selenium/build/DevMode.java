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

package org.openqa.selenium.build;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

public class DevMode {

  // There is absolutely no way that this is going to be fragile. No way. Nada. Nope.
  private static final List<Supplier<Boolean>> DEV_MODE_CHECKS = Arrays.asList(
      // Check for IntelliJ
      () -> {
        if (System.getProperty("java.class.path", "").contains("idea_rt.jar")) {
          return true;
        }
        try {
          Class.forName("com.intellij.rt.execution.CommandLineWrapper");
          return true;
        } catch (ReflectiveOperationException e) {
          return false;
        }
      },

      // Check for Eclipse
      () -> {
        try {
          Class.forName("org.eclipse.jdt.internal.junit4.runner.JUnit4TestLoader");
          return true;
        } catch (ReflectiveOperationException e) {
          return false;
        }
      },

      // Allow someone to set a system property
      () -> Boolean.getBoolean("selenium.dev-mode")
  );

  public static boolean isInDevMode() {
    return DEV_MODE_CHECKS.stream().map(Supplier::get).reduce(Boolean::logicalOr).orElse(false);
  }
}
