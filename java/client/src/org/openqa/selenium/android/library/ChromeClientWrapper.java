/*
Copyright 2011 Software Freedom Conservatory.

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

package org.openqa.selenium.android.library;

import org.openqa.selenium.WebDriverException;

/**
 * This class wraps a chrome client that must have the *same* API as
 * WebChromeClient. This chrome client will be used with the view used
 * by WebDriver to monitor events.
 *
 * <p/>Sample usage:
 * // If the underlying view is a WebView, you can use WebDriver's default
 * // chrome client assuming you don't have any custom bahavior defined in
 * // WebView's WebChromeClient.
 * ChromeClientWrapper chromeClient = new ChromeClientWrapper(
 *     "android.webkit.WebChromeClient",
 *     new DefaultChromeClient());
 *
 * // If the underlying view is a WebView, you can use WebDriver default
 * // chrome client with a custom WebChromeClient that defines the bahavior
 * // you want.
 * class MyCustomChromeClient extends WebChromeClient {
 *   ...
 * }
 *
 * MyCustomChromeClient customChrome = new MyCustomChromeClient();
 * ChromeClientWrapper chromeClient = new ChromeClientWrapper(
 *     "android.webkit.WebChromeClient",
 *     new DefaultChromeClient(customChrome))
 *
 * Note that WebDriver needs the DefaultChromeClient in order to be able
 * to listen to events that happen on the page. If you don't want to use
 * the DefaultChromeClient, you can write your own client under the condition
 * that your client calls all WebDriverChromeClient methods.
 */
public class ChromeClientWrapper implements DriverProvider, ViewProvider {
  private final String className;
  private final Object client;

  /**
   *
   * @param className the fully qualified class name of the client's class.
   * @param client the client to use. Typically this client will be a
   *     WebChromeClient (or extend the latter). if not this client must have
   *     the same API methods as WebChromeClient. Additionally this chrome
   *     client must implement the DriverProvider and ViewProvider interfaces.
   */
  public ChromeClientWrapper(String className, Object client) {
    this.className = className;
    this.client = client;
  }

  /* package */ Class getClassForUnderlyingClient() {
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      throw new WebDriverException("Failed to get class for underlying view with class name: "
          + className, e);
    }
  }

  /* package */ Object getUnderlyingClient() {
    return client;
  }

  public void setDriver(AndroidWebDriver driver) {
    Class[] argsClass = {AndroidWebDriver.class};
    Object[] args = {driver};
    ReflexionHelper.invoke(client, "setDriver", argsClass, args);
  }

  public void setWebDriverView(WebDriverView view) {
    Class[] argsClass = {WebDriverView.class};
    Object[] args = {view};
    ReflexionHelper.invoke(client, "setWebDriverView", argsClass, args);
  }
}
