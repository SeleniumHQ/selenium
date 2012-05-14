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


package org.openqa.selenium.environment.webserver;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;
import org.webbitserver.helpers.Base64;

public class BasicAuthHandler implements HttpHandler {

  private final String validCredentials;

  /**
   * @param validCredentials username:password
   */
  public BasicAuthHandler(String validCredentials) {
    this.validCredentials = validCredentials;
  }

  public void handleHttpRequest(HttpRequest request, HttpResponse response, HttpControl control)
      throws Exception {
    if (isAuthorized(request.header("Authorization"))) {
      response
          .header("Content-Type", "text/html")
          .content("<h1>authorized</h1>")
          .end();
    } else {
      response
          .status(401)
          .header("WWW-Authenticate", "Basic realm=\"basic-auth-test\"")
          .content("Not authorized")
          .end();
    }
  }

  private boolean isAuthorized(String auth) {
    if (auth != null) {
      final int index = auth.indexOf(' ');

      if (index > 0) {
        final String credentials = new String(Base64.decode(auth.substring(index)));
        return validCredentials.equals(credentials);
      }
    }

    return false;
  }
  
}
