/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.environment.webserver;

import org.seleniumhq.jetty7.util.log.Logger;

public class NullLogger implements Logger {
  public void disableLogging() {
    System.setProperty("org.eclipse.jetty.util.log.class", NullLogger.class.getName());
  }

  public boolean isDebugEnabled() {
    return false;
  }

  public void setDebugEnabled(boolean b) {
  }

  public void debug(String s, Object... o) {
  }

  public void debug(String s, Throwable throwable) {
  }

  public void debug(Throwable throwable) {
  }

  public void info(String s, Object... o) {
  }

  public void info(String s, Throwable throwable) {
  }

  public void info(Throwable throwable) {
  }

  public void warn(String s, Object... o) {
  }

  public void warn(String s, Throwable throwable) {
  }

  public void warn(Throwable throwable) {
  }

  public void ignore(Throwable throwable) {
  }

  public Logger getLogger(String s) {
    return this;
  }

  public String getName() {
    return NullLogger.class.getName();
  }
}
