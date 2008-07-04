package org.openqa.selenium.remote.server.renderer;

import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.Renderer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class EmptyResult implements Renderer {

  public void render(HttpServletRequest request, HttpServletResponse response, Handler handler)
      throws Exception {
    response.setStatus(HttpServletResponse.SC_NO_CONTENT);
  }
}
