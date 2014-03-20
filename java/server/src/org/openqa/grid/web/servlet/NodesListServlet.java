package org.openqa.grid.web.servlet;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSlot;
import org.seleniumhq.jetty7.http.HttpStatus;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * <em>NodesListServlet</em> allows to get unique capabilities across all
 * nodes registered with a hub in a form of JSON.
 */
public class NodesListServlet extends RegistryBasedServlet {

  private static final long serialVersionUID = -8341100480181618402L;

  public NodesListServlet() {
    this(null);
  }

  public NodesListServlet(Registry registry) {
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
    response.setStatus(HttpStatus.OK_200);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    try {
      response.getWriter().print(getJSONResponse());
      response.getWriter().close();
    } catch (Exception e) {
      throw new GridException(e.getMessage());
    }
  }

  private JSONObject getJSONResponse() throws JSONException {
    return new JSONObject().put("nodes", getNodes());
  }

  /*
   * Returns a JSONObject describes a grid node.
   * key is node id and value contains additional node attributes
   */
  private JSONObject getNodes() throws JSONException {
    JSONObject nodes = new JSONObject();
    for (RemoteProxy remoteProxy : getRegistry().getAllProxies()) {
      nodes.put(remoteProxy.getId(), this.getNodeCapabilities(remoteProxy));
    }

    return nodes;
  }

  private JSONObject getNodeCapabilities(RemoteProxy remoteProxy) throws JSONException {
    JSONObject oneNode = new JSONObject();
    JSONArray capabilities = new JSONArray();
    List<String> uniqueCapabilitiesList = new ArrayList<String>();

    for (TestSlot testSlot : remoteProxy.getTestSlots()) {
      String capabilitiesAsString = testSlot.getCapabilities().toString();
      if (!uniqueCapabilitiesList.contains(capabilitiesAsString)) {
        uniqueCapabilitiesList.add(capabilitiesAsString);
        capabilities.put(testSlot.getCapabilities());
      }
    }

    oneNode.put("id", remoteProxy.getId());
    oneNode.put("capabilities", capabilities);
    oneNode.put("configuration", remoteProxy.getConfig());

    return oneNode;
  }
}
