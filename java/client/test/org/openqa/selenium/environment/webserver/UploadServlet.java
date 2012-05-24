package org.openqa.selenium.environment.webserver;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * A simple file upload servlet that just sends back the file contents to the client.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class UploadServlet extends HttpServlet {

  @Override
  protected void doPost(HttpServletRequest request,
      HttpServletResponse response)
      throws ServletException, IOException {
    response.setContentType("text/html");
    response.setStatus(HttpServletResponse.SC_OK);

    File file = (File) request.getAttribute("upload");
    file.deleteOnExit();

    int length = (int) file.length();
    byte[] buffer = new byte[length];
    InputStream in = new FileInputStream(file);
    in.read(buffer, 0, length);
    String content = new String(buffer, "UTF-8");
    in.close();

    // Slow down the upload so we can verify WebDriver waits.
    try {
      Thread.sleep(2500);
    } catch (InterruptedException ignored) {
    }
    response.getWriter().write(content);
    response.getWriter().write(
        "<script>window.top.window.onUploadDone();</script>");
    response.setStatus(HttpServletResponse.SC_OK);
  }
}
