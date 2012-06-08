package org.openqa.selenium.android.server;

import org.openqa.selenium.remote.server.HttpStatusCodes;
import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;


public class HealthzHandler implements HttpHandler {

  @Override
  public void handleHttpRequest(HttpRequest httpRequest, HttpResponse httpResponse,
                                HttpControl httpControl) throws Exception {
    if (!"GET".equals(httpRequest.method())) {
      httpResponse.status(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      httpResponse.end();
      return;
    }

    httpResponse.header("Content-Type", "text/plain");
    httpResponse.content("{status: 0}");
    httpResponse.end();
  }
}
