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
