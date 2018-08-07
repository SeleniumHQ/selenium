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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.net.MediaType;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.selenium.grid.server.ServletRequestWrappingHttpRequest;
import org.openqa.selenium.grid.server.ServletResponseWrappingHttpResponse;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ProxyStatusServlet extends RegistryBasedServlet {

  private final Json json = new Json();

  public ProxyStatusServlet() {
    this(null);
  }

  public ProxyStatusServlet(GridRegistry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) {
    process(
        new ServletRequestWrappingHttpRequest(request),
        new ServletResponseWrappingHttpResponse(response));
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) {
    process(
        new ServletRequestWrappingHttpRequest(request),
        new ServletResponseWrappingHttpResponse(response));
  }

  protected void process(HttpRequest request, HttpResponse response) {
    response.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
    response.setStatus(200);
    try {
      Object res = getResponse(request);
      response.setContent(json.toJson(res).getBytes(UTF_8));
    } catch (Throwable e) {
      throw new GridException(e.getMessage());
    }
  }

  private Map<String, Object> getResponse(HttpRequest request) {
    Map<String, Object> requestJson = null;
    if (!request.getContentString().isEmpty()) {
      requestJson = json.toType(request.getContentString(), MAP_TYPE);
    }

    Map<String, Object> res = new TreeMap<>();
    res.put("success", false);

    // the id can be specified via a param, or in the json request.
    String id;
    if (requestJson == null) {
      id = request.getQueryParameter("id");
    } else {
      if (!requestJson.containsKey("id")) {
        res.put("msg", "you need to specify at least an id when call the node status service.");
        return res;
      }
      id = String.valueOf(requestJson.get("id"));
    }

    try {
      URL u = new URL(id);
      id = "http://" + u.getHost() + ":" + u.getPort();
    } catch (MalformedURLException ignore) {
      // Fall through
    }

    // id is defined from here.
    RemoteProxy proxy = getRegistry().getProxyById(id);
    if (proxy == null) {
      res.put("msg", "Cannot find proxy with ID =" + id + " in the registry.");
      return res;
    }
    res.put("msg", "proxy found !");
    res.put("success", true);
    res.put("id", proxy.getId());
    res.put("request", proxy.getOriginalRegistrationRequest());

    // maybe the request was for more info
    if (requestJson != null) {
      // use basic (= no objects ) reflection to get the extra stuff
      // requested.
      List<String> methods = getExtraMethodsRequested(requestJson);

      List<String> errors = new ArrayList<>();
      for (String method : methods) {
        try {
          Object o = getValueByReflection(proxy, method);
          res.put(method, o);
        } catch (Throwable t) {
          errors.add(t.getMessage());
        }
      }
      if (!errors.isEmpty()) {
        res.put("success", false);
        res.put("errors", errors.toString());
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

  private List<String> getExtraMethodsRequested(Map<String, Object> request) {
    List<String> res = new ArrayList<>();

    for (Map.Entry<String, Object> entry : request.entrySet()) {
      if (!"id".equals(entry.getKey())) {
        res.add(entry.getKey());
      }
    }

    return res;
  }

}
