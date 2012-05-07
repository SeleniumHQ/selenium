package org.openqa.selenium.environment.webserver;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

public class RedirectHandler implements HttpHandler {

  private final String destination;

  public RedirectHandler(String destination) {
    this.destination = destination;
  }
  
  public void handleHttpRequest(HttpRequest request, HttpResponse response, HttpControl control)
      throws Exception {
    response
        .status(302)
        .header("Location", destination)
        .end();
  }
}
