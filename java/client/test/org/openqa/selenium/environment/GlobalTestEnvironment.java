/*
Copyright 2007-2009 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.environment;

/**
 * Used to hold a TestEnvironment in a static class-level field.
 */
public class GlobalTestEnvironment {

  private static TestEnvironment environment;

  public static boolean isSetUp() {
    return environment != null;
  }

  public static TestEnvironment get() {
    return environment;
  }

  public static void set(TestEnvironment environment) {
    GlobalTestEnvironment.environment = environment;
  }

  public static synchronized TestEnvironment get(
      Class<? extends TestEnvironment> startThisIfNothingIsAlreadyRunning) {
    if (environment == null) {
      try {
        environment = startThisIfNothingIsAlreadyRunning.newInstance();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
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
