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

package org.openqa.selenium.remote;

import java.util.Set;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;

/** Used to identify a browser based on its name. */
public interface Browser {

  Browser CHROME = new NamedBrowser("chrome", "chrome-headless-shell");
  Browser EDGE = new NamedBrowser("MicrosoftEdge", "msedge");
  Browser HTMLUNIT = new NamedBrowser("htmlunit");
  Browser IE = new NamedBrowser("internet explorer");
  Browser FIREFOX = new NamedBrowser("firefox");
  Browser OPERA = new NamedBrowser("opera");
  Browser SAFARI = new NamedBrowser("safari", "Safari");
  Browser SAFARI_TECH_PREVIEW = new NamedBrowser("Safari Technology Preview");

  String browserName();

  default boolean is(String browserName) {
    return browserName().equals(browserName);
  }

  default boolean is(Capabilities caps) {
    Require.nonNull("Capabilities", caps);
    return is(caps.getBrowserName());
  }

  default String toJson() {
    return browserName();
  }
}

class NamedBrowser implements Browser {
  private final String name;
  private final Set<String> otherNames;

  protected NamedBrowser(String name, String... otherNames) {
    this.name = Require.nonNull("Browser name", name);
    this.otherNames = Set.of(otherNames);
  }

  @Override
  public boolean is(String browserName) {
    return Browser.super.is(browserName) || otherNames.contains(browserName);
  }

  @Override
  public String browserName() {
    return name;
  }

  @Override
  public final String toString() {
    return name;
  }
}
