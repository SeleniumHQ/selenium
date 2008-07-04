package org.openqa.selenium.remote.server.renderer;

import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.Renderer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class JsonResult implements Renderer {

  protected String propertyName;

  public JsonResult(String propertyName) {
    if (propertyName.startsWith(":")) {
      this.propertyName = propertyName.substring(1);
    } else {
      this.propertyName = propertyName;
    }
  }

  public void render(HttpServletRequest request, HttpServletResponse response, Handler handler)
      throws Exception {
    Object result = request.getAttribute(propertyName);

    String json = new BeanToJsonConverter().convert(result);

    int length = json == null ? 0 : json.getBytes().length;

    response.setContentLength(length);
    response.setContentType("application/json");
    response.getWriter().append(json).flush();
  }
}
