package org.openqa.grid.web.servlet;

import org.json.JSONArray;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSlot;
import org.seleniumhq.jetty7.http.HttpStatus;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <em>GridCapabilitiesServlet</em> allows to get unique capabilities across all
 * nodes registered with a hub in a form of JSON.
 */
public class GridCapabilitiesServlet extends RegistryBasedServlet {

  private static final long serialVersionUID = -8341100480181618402L;

  public GridCapabilitiesServlet() {
    this(null);
  }

  public GridCapabilitiesServlet(Registry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    process(request, response);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    JSONArray responseJSON = new JSONArray();
    List<String> capabilitiesAsStringList = new ArrayList<String>();

    for (RemoteProxy remoteProxy : getRegistry().getAllProxies()) {
      for (TestSlot testSlot : remoteProxy.getTestSlots()) {
        String capabilitiesAsString = testSlot.getCapabilities().toString();

        if (!capabilitiesAsStringList.contains(capabilitiesAsString)) {
          capabilitiesAsStringList.add(capabilitiesAsString);
          responseJSON.put(testSlot.getCapabilities());
        }
      }
    }

    int responseStatus = (responseJSON.length() == 0) ? HttpStatus.NO_CONTENT_204 : HttpStatus.OK_200;

    response.setStatus(responseStatus);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    PrintWriter printWriter = response.getWriter();
    printWriter.print(responseJSON);
    printWriter.flush();
  }
}
