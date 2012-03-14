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
 * This class wraps a view client that must have the *same* API as
 * WebViewClient. The underlying client will be used by WebDriver to listen to
 * interesting events on the page.
 *
 * <p/>Sample usage:
 * // If the underlying view is a WebView you can use WebDriver's default
 * // view client DefaultViewClient as follow.
 * ViewClientWrapper viewWrapper = new ViewClientWrapper(
 *     "android.webkit.WebViewClient", new DefaultViewClient());
 *
 * // If the underlying view is a WebView and it has custom WebViewClient
 * // settings, use the DefaultViewClient as follow:
 * class MyCustomClient extends WebViewClient {
 *   ...
 * }
 *
 * MyCustomClient myClient = new MyCustomClient();
 * ViewClientWrapper viewWrapper = new ViewClientWrapper(
 *     "android.webkit.WebViewClient", new DefaultViewClient(myClient));
 */
public class ViewClientWrapper implements DriverProvider {
  private final String className;
  private final Object client;

  /**
   *
   * @param className the fully qualified class name of the client's 
   *     class name.
   * @param client the client to use. Typically this client will be a
   *     WebViewClient (or extend the latter). If not this client must have
   *     the same API as WebViewClient. Additionally this client view must
   *     implement the DriverProvider interface.
   */
  public ViewClientWrapper(String className, Object client) {
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
    try {
      ((DefaultViewClient)client).setDriver(driver);
    } catch (ClassCastException e) {
      Class[] argsClass = {AndroidWebDriver.class};
      Object[] args = {driver};
      ReflexionHelper.invoke(client, "setDriver", argsClass, args);
    }
  }
}
