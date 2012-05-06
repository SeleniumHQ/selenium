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
