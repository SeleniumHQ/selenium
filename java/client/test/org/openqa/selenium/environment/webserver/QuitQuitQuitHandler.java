package org.openqa.selenium.environment.webserver;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

import com.google.common.base.Charsets;

public class QuitQuitQuitHandler implements HttpHandler {
  public void handleHttpRequest(HttpRequest request, HttpResponse response, HttpControl control)
      throws Exception {
    String res = "<html><head><title>Quitting</title></head><body>Killing JVM</body></html>";
    response
        .header("Content-Type", "text/html; charset=" + Charsets.UTF_8.name())
        .content(res)
        .end();
    System.err.println("Killing JVM");
    System.exit(0);
  }
}
