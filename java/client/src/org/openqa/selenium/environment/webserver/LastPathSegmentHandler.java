package org.openqa.selenium.environment.webserver;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;

public class LastPathSegmentHandler implements HttpHandler {

    private final Charset CHARSET = Charsets.UTF_8;

    public void handleHttpRequest(HttpRequest request, HttpResponse response, HttpControl control) {
        String segment = getLastPathPart(request.uri());

        String body = String.format(
            "<html><head><title>Page%s</title></head>" +
            "<body>Page number <span id=\"pageNumber\">%s</span>" +
            "<p><a href=\"../xhtmlTest.html\" target=\"_top\">top</a>" +
            "</body></html>", segment, segment);

        response
            .charset(CHARSET)
            .header("Content-Type", "text/html; charset=" + CHARSET.name())
            .header("Content-Length", body.length())
            .content(body)
            .end();
    }

    private String getLastPathPart(String uri) {
      String[] parts;
      try {
        parts = new URI(uri).getPath().split("/");
      } catch (URISyntaxException e) {
        throw Throwables.propagate(e);
      }
      return parts[parts.length - 1];
    }
}

