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

import java.util.Set;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

import com.google.common.collect.ImmutableSet;

public class PathForwardingHandler implements HttpHandler {

    private final String prefix;
    private final HttpHandler httpHandler;

    private static final Set<Character> PART_DELIMITERS = ImmutableSet.of('/', '?', '#');
    
    public PathForwardingHandler(String prefix, HttpHandler httpHandler) {
      this.prefix = prefix;
      this.httpHandler = httpHandler;
    }

    public void handleHttpRequest(HttpRequest request, HttpResponse response, HttpControl control)
        throws Exception {
      if (request.uri().startsWith(prefix)) {
        String restOfPath = request.uri().substring(prefix.length());
        if (restOfPath.length() == 0 || PART_DELIMITERS.contains(restOfPath.charAt(0))) {
          request.uri(restOfPath);
          httpHandler.handleHttpRequest(request, response, control);
          return;
        }
      }
    control.nextHandler();
  }
}
