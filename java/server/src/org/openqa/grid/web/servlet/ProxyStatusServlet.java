// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.grid.web.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ProxyStatusServlet extends RegistryBasedServlet {

  private static final long serialVersionUID = 7653463271803124556L;

  public ProxyStatusServlet() {
    this(null);
  }

  public ProxyStatusServlet(Registry registry) {
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

  protected void process(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    JsonObject res;
    try {
      res = getResponse(request);
      response.getWriter().print(res);
      response.getWriter().close();
    } catch (JsonSyntaxException e) {
      throw new GridException(e.getMessage());
    }
  }

  private JsonObject getResponse(HttpServletRequest request) throws IOException {
    JsonObject requestJSON = null;
    if (request.getInputStream() != null) {
      BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream()));
      StringBuilder s = new StringBuilder();
      String line;
      while ((line = rd.readLine()) != null) {
        s.append(line);
      }
      rd.close();
      String json = s.toString();
      if (!"".equals(json)) {
        requestJSON = new JsonParser().parse(json).getAsJsonObject();
      }
    }

    JsonObject res = new JsonObject();
    res.addProperty("success", false);

    // the id can be specified via a param, or in the json request.
    String id;
    if (requestJSON == null) {
      id = request.getParameter("id");
    } else {
      if (!requestJSON.has("id")) {
        res.addProperty("msg",
                        "you need to specify at least an id when call the node status service.");
        return res;
      }
      id = requestJSON.get("id").getAsString();
    }

    try {
      URL u = new URL(id);
      id = "http://" + u.getHost() + ":" + u.getPort();
    } catch (MalformedURLException ignore) {}

    // id is defined from here.
    RemoteProxy proxy = getRegistry().getProxyById(id);
    if (proxy == null) {
      res.addProperty("msg", "Cannot find proxy with ID =" + id + " in the registry.");
      return res;
    }
    res.addProperty("msg", "proxy found !");
    res.addProperty("success", true);
    res.addProperty("id", proxy.getId());
    res.add("request", proxy.getOriginalRegistrationRequest().toJson());

    // maybe the request was for more info
    if (requestJSON != null) {
      // use basic (= no objects ) reflexion to get the extra stuff
      // requested.
      List<String> methods = getExtraMethodsRequested(requestJSON);

      List<String> errors = new ArrayList<>();
      for (String method : methods) {
        try {
          Object o = getValueByReflection(proxy, method);
          res.add(method, new Gson().toJsonTree(o));
        } catch (Throwable t) {
          errors.add(t.getMessage());
        }
      }
      if (!errors.isEmpty()) {
        res.addProperty("success", false);
        res.addProperty("errors", errors.toString());
      }
    }
    return res;
  }

  private Object getValueByReflection(RemoteProxy proxy, String method) {
    Class<?>[] argsClass = new Class[] {};
    try {
      Method m = proxy.getClass().getDeclaredMethod(method, argsClass);
      return m.invoke(proxy);
    } catch (Throwable e) {
      throw new RuntimeException(e.getClass() + " - " + e.getMessage());
    }
  }

  private List<String> getExtraMethodsRequested(JsonObject request) {
    List<String> res = new ArrayList<>();

    for (Map.Entry<String, JsonElement> entry : request.entrySet()) {
      if (!"id".equals(entry.getKey())) {
        res.add(entry.getKey());
      }
    }

    return res;
  }

}
