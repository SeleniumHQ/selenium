package org.openqa.selenium.v1;

import org.seleniumhq.jetty7.http.HttpFields;

import java.io.IOException;
import java.util.Calendar;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This servlet prints out the current time, but instructs the browser to cache the result.
 */
public class CachedContentServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    setAlwaysCacheHeaders(resp);
    
    resp.setHeader("Content-Type", "text/html");
    resp.getWriter().write("<html><body>" + System.currentTimeMillis() + "</body></html>");
  }

  /**
   * Sets all the don't-cache headers on the HttpResponse
   */
  private void setAlwaysCacheHeaders(HttpServletResponse resp) {
    resp.setHeader("Cache-Control", "max-age=29723626");
    Calendar calendar = Calendar.getInstance();
    calendar.add(Calendar.YEAR, 1);
    resp.setHeader("Expires", HttpFields.formatDate(calendar.getTimeInMillis()));
    resp.setHeader("Last-Modified", HttpFields.__01Jan1970);
    resp.setHeader("Pragma", "");
    resp.setHeader("ETag", "foo");
  }

}
