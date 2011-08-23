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

package org.openqa.selenium.android.util;

/**
 * @author berrada@google.com (Dounia Berrada)
 */
public class XPathInstaller {
  public static final String XPATH_FAILED = "_xpath_failed";

  public static String installXPathJs() {
    // The XPath library is installed in the main window. For frames, the
    // main window installs the XPath library in the frame.
    // First it sets the default for the xpath library and expose the installer,
    // then it includes the actual xpath library. It calls
    // window.install() to install it.
    return
        "if (!document.evaluate) {" +
        "  var currentWindow = window;" +
        // We need to run the installation code in the main context
          "  with (window.top) {" +
          "  try {" +
          "    var body = document.getElementsByTagName('body')[0];" +
          "    if (body == undefined) {" +
          "      body = document.createElement('body');" +
          "      document.getElementsByTagName('html')[0].appendChild(body);" +
          "    }" +
          "    var install_tag = document.createElement('script'); " +
          "    install_tag.type = 'text/javascript'; " +
          "    install_tag.innerHTML= 'window.jsxpath = { exportInstaller : true };'; " +
          "    body.appendChild(install_tag);" +
          "    var load_tag = document.createElement('script'); " +
          "    load_tag.type = 'text/javascript'; " +
          "    load_tag.src = 'http://localhost:8080/resources/js'; " +
          "    body.appendChild(load_tag);" +
          "    if (!window.install) {" +
          "      return '" + XPATH_FAILED + ": window.install is undefined!';" +
          "    };" +
          "    window.install(currentWindow);" +
          "    if (!currentWindow.document.evaluate) {" +
          "      return '" + XPATH_FAILED + "_document.evaluate undefined!';"
            + "}" +
          "  } catch (error) {" +
          "    return '" + XPATH_FAILED + "_' + error;" +
          "  }" +
          "  }" +  // with(window.top)
        "};";
  }
}
