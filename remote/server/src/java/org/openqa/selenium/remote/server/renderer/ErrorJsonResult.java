// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.renderer;

import org.openqa.selenium.remote.server.rest.Handler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author simonstewart@google.com (Simon Stewart)
 */
public class ErrorJsonResult extends JsonResult {

  public ErrorJsonResult(String propertyName) {
    super(propertyName);
  }

  public void render(HttpServletRequest request, HttpServletResponse response, Handler handler)
      throws Exception {
    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    super.render(request, response, handler);
  }
}
