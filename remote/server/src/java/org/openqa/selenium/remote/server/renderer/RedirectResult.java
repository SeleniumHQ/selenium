package org.openqa.selenium.remote.server.renderer;

import org.openqa.selenium.remote.PropertyMunger;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.Renderer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class RedirectResult implements Renderer {

  private final String url;

  public RedirectResult(String url) {
    this.url = url;
  }

  public void render(HttpServletRequest request, HttpServletResponse response, Handler handler)
      throws Exception {
    StringBuilder builder = new StringBuilder();

    builder.append(request.getServletPath());

    String[] urlParts = url.split("/");
    for (String part : urlParts) {
      if (part.length() == 0) {
        continue;
      }

      builder.append("/");
      if (part.startsWith(":")) {
        builder.append(get(handler, part));
      } else {
        builder.append(part);
      }
    }

    response.sendRedirect(builder.toString());
  }

  private String get(Handler handler, String part) throws Exception {
    if (part.length() < 1) {
      return "";
    }

    String propertyName = part.substring(1);

    Object value = PropertyMunger.get(propertyName, handler);
    return value == null ? "" : String.valueOf(value);
  }
}
