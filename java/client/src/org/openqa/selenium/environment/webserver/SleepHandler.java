package org.openqa.selenium.environment.webserver;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

public class SleepHandler implements HttpHandler {

  public void handleHttpRequest(HttpRequest request, HttpResponse response, HttpControl control)
      throws Exception {
    Long secondsToSleep = Long.valueOf(request.queryParam("time"));
    reallySleep(secondsToSleep * 1000);
    
    response
        .content(String.format(
          "<html><head><title>Done</title></head><body>Slept for %ss</body></html>",
          secondsToSleep))
        .end();
  }
  
  private void reallySleep(long ms) {
    long start = System.currentTimeMillis();
    try {
      Thread.sleep(ms);
      while ((System.currentTimeMillis() - start) < ms) {
        Thread.sleep(20);
      }
    } catch (InterruptedException ignore) {
    }
  }
}
