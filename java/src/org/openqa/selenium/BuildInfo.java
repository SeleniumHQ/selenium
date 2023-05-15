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

package org.openqa.selenium;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Properties;

/** Reads information about how the current application was built. */
public class BuildInfo {

  private static final Properties BUILD_PROPERTIES = loadBuildProperties();

  private static Properties loadBuildProperties() {
    Properties properties = new Properties();

    URL resource = BuildInfo.class.getResource("/META-INF/selenium-build.properties");
    try (InputStream is = resource.openStream()) {
      properties.load(is);
    } catch (IOException | NullPointerException ignored) {
      // Do nothing
    }

    return properties;
  }

  /**
   * @return The embedded release label or "unknown".
   */
  public String getReleaseLabel() {
    return read("Selenium-Version");
  }

  /**
   * @return The embedded build revision or "unknown".
   */
  public String getBuildRevision() {
    return read("Build-Revision");
  }

  @Override
  public String toString() {
    return String.format(
        "Build info: version: '%s', revision: '%s'", getReleaseLabel(), getBuildRevision());
  }

  private String read(String propertyName) {
    String value = BUILD_PROPERTIES.getProperty(propertyName);
    if (value == null || value.trim().isEmpty()) {
      return "unknown";
    }
    return value.trim();
  }
}
