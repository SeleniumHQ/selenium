package org.openqa.grid.e2e.node;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.RegistryBasedServlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Beacuse re-use is discouraged in the CFB
*/
public class SlowServlet extends RegistryBasedServlet {
  private static final long serialVersionUID = 7653463271803124556L;

  public SlowServlet() {
    this(null);
  }

  public SlowServlet(Registry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    try {
      Thread.sleep(100000);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);

    response.getOutputStream().write("OK".getBytes());
    response.getOutputStream().flush();
  }
}
