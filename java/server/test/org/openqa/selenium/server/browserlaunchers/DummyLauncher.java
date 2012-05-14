/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.browserlaunchers.BrowserLauncher;

/**
 * A teeny tiny no-op launcher to get a non-null launcher for testing.
 * 
 * @author jbevan@google.com (Jennifer Bevan)
 */
public class DummyLauncher implements BrowserLauncher {

  private boolean closed;

  public DummyLauncher() {
    closed = true;
  }

  /**
   * noop
   */
  public void close() {
    closed = true;
  }

  /**
   * noop
   */
  public void launchHTMLSuite(String startURL, String suiteUrl) {
    closed = false;
  }

  protected boolean isClosed() {
    return closed;
  }

  protected void setOpen() {
    closed = false;
  }

  public void launchRemoteSession(String url) {
    closed = false;
  }
}
