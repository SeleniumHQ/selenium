package org.openqa.selenium.remote.server.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface Renderer {

  void render(HttpServletRequest request, HttpServletResponse response, Handler handler)
      throws Exception;
}
