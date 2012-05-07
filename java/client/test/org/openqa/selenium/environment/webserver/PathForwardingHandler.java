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
