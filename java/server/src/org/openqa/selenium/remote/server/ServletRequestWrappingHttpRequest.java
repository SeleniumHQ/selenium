package org.openqa.selenium.remote.server;

import javax.servlet.http.HttpServletRequest;

/**
 * @deprecated Use {@link org.openqa.selenium.grid.web.ServletRequestWrappingHttpRequest}
 */
@Deprecated
public class ServletRequestWrappingHttpRequest
    extends org.openqa.selenium.grid.web.ServletRequestWrappingHttpRequest {

  public ServletRequestWrappingHttpRequest(HttpServletRequest req) {
    super(req);
  }
}
