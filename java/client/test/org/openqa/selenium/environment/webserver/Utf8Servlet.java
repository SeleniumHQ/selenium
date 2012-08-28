package org.openqa.selenium.environment.webserver;

import com.google.common.io.ByteStreams;
import com.google.common.io.Closeables;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;

public class Utf8Servlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

    String fileName = this.getServletContext().getRealPath(request.getPathInfo());
    String fileContent = "";

    InputStream is = null;
    try {
      is = new FileInputStream(fileName);
      // Note: Must read the content as UTF8.
      fileContent = new String(ByteStreams.toByteArray(is), Charset.forName("UTF-8"));
    } catch (IOException e) {
      throw new ServletException("Failed to file: " + fileName + " based on request path: " +
          request.getPathInfo() + ", servlet path: " + request.getServletPath() +
          " and context path: " + request.getContextPath());
    } finally {
      Closeables.closeQuietly(is);
    }

    response.setContentType("text/html; charset=UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().println(fileContent);
    response.flushBuffer();
    response.getWriter().close();
  }
}
