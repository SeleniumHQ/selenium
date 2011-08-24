package org.openqa.selenium.environment.webserver;

import org.openqa.selenium.internal.Base64Encoder;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class BasicAuth extends HttpServlet {
  private static final String CREDENTIALS = "test:test";
  private final Base64Encoder base64 = new Base64Encoder();

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    if (isAuthorized(req.getHeader("Authorization"))) {
      resp.setHeader("Content-Type", "text/html");
      resp.getWriter().write("<h1>authorized</h1>");
    } else {
      resp.setHeader("WWW-Authenticate", "Basic realm=\"basic-auth-test\"");
      resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
  }

  private boolean isAuthorized(String auth) {
    if (auth != null) {
      final int index = auth.indexOf(' ');

      if (index > 0) {
        final String credentials = new String(base64.decode(auth.substring(index)));
        return CREDENTIALS.equals(credentials);
      }
    }

    return false;
  }
}
