/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium.internal;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Properties;

/**
 * Reads information about how the current application was built from a
 * properties file embedded in the JAR.
 */
public class BuildInfo {

  private static final String BUILD_PROPERTIES_LOCATION = String.format("/%s/build.properties",
      BuildInfo.class.getPackage().getName().replace(".", "/"));

  private static final Properties BUILD_PROPERTIES = loadBuildProperties();

  private static Properties loadBuildProperties() {
    Properties properties = new Properties();

    URL url = BuildInfo.class.getResource(BUILD_PROPERTIES_LOCATION);

    // Just move along if the build.properties file is missing from the jar.
    if (url == null) {
      return properties;
    }

    InputStream stream = null;
    try {
      stream = url.openStream();
      properties.load(stream);
    } catch (IOException ignored) {
      // No worries, we'll just return "unknown" for everything.
    } finally {
      if (stream != null) {
        try {
          stream.close();
        } catch (IOException ignored) {
        }
      }
    }
    return properties;
  }

  /** @return The embedded release label or "unknown". */
  public String getReleaseLabel() {
    return BUILD_PROPERTIES.getProperty("version", "unknown");
  }

  /** @return The embedded build revision or "unknown". */
  public String getBuildRevision() {
    return BUILD_PROPERTIES.getProperty("revision", "unknown");
  }

  /** @return The embedded build time or "unknown". */
  public String getBuildTime() {
    return BUILD_PROPERTIES.getProperty("time", "unknown");
  }

  @Override
  public String toString() {
    return String.format("Build info: version: '%s', revision: '%s', time: '%s'",
        getReleaseLabel(), getBuildRevision(), getBuildTime());
  }
}
