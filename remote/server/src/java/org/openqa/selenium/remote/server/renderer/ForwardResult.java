package org.openqa.selenium.remote.server.renderer;

import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.Renderer;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ForwardResult implements Renderer {

  private final String to;

  public ForwardResult(String to) {
    this.to = to;
  }

  public void render(HttpServletRequest request, HttpServletResponse response, Handler handler)
      throws Exception {

    RequestDispatcher dispatcher = request.getRequestDispatcher(to);
    dispatcher.forward(request, response);
  }

}
