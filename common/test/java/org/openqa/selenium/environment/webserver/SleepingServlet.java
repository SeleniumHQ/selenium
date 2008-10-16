
package org.openqa.selenium.environment.webserver;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SleepingServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
      String duration = request.getParameter("time");
      long timeout = Long.valueOf(duration) * 1000;

      try {
        Thread.sleep(timeout);
      } catch (InterruptedException e) {
        // Do nothing
      }

      response.setContentType("text/html");

      response.getOutputStream().println("<html><head><title>Done</title><head><body></body></html>");
    }
}
