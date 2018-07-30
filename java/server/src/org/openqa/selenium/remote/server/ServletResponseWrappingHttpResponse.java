package org.openqa.selenium.remote.server;

import javax.servlet.http.HttpServletResponse;

/**
 * @deprecated Use {@link org.openqa.selenium.grid.web.ServletResponseWrappingHttpResponse}.
 */
@Deprecated
public class ServletResponseWrappingHttpResponse
    extends org.openqa.selenium.grid.web.ServletResponseWrappingHttpResponse {

  public ServletResponseWrappingHttpResponse(HttpServletResponse resp) {
    super(resp);
  }
}
