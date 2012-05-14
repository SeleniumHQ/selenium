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

package org.openqa.selenium.server.mock;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * Unlike the MockBrowserLauncher which acts like a real canned browser, the DummyBrowserLauncher
 * does nothing at all. Someone else should issue HTTP requests to the server in order to
 * impersonate the browser when using DummyBrowserLauncher.
 * 
 * @author Dan Fabulich
 * 
 */
public class DummyBrowserLauncher implements BrowserLauncher {

  private static String sessionId;

  public DummyBrowserLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration, String sessionId, String command) {
    DummyBrowserLauncher.sessionId = sessionId;
  }

  /** Returns the sessionId used to create this browser */
  public static String getSessionId() {
    return sessionId;
  }

  /** Clears the sessionId, since it's static */
  public static void clearSessionId() {
    sessionId = null;
  }

  /** noop */
  public void close() {

  }

  /** noop */
  public void launchHTMLSuite(String startURL, String suiteUrl) {

  }

  /** noop */
  public void launchRemoteSession(String url) {

  }

}
