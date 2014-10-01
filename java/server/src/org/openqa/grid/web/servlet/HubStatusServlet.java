/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.grid.web.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSlot;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * API to query the hub config remotely.
 * 
 * use the API by sending a GET to grid/api/hub/
 * with the content of the request in JSON,specifying the 
 * parameters you're interesting in, for instance, to get 
 * the timeout of the hub and the registered servlets :
 * 
 * {"configuration":
 *      [
 *      "timeout",
 *      "servlets"
 *      ]
 * }
 * 
 * if no param is specified, all params known to the hub are returned.
 * 
 * {"configuration": []  }
 *
 */
public class HubStatusServlet extends RegistryBasedServlet {

  public HubStatusServlet() {
    super(null);
  }

  public HubStatusServlet(Registry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
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
    JsonObject res = new JsonObject();
    res.addProperty("success", true);
    try {
      if (request.getInputStream() != null) {
        JsonObject requestJSON = getRequestJSON(request);
        JsonArray keys = requestJSON != null
                         ? requestJSON.get("configuration").getAsJsonArray()
                         : null;

        Set<String> paramsToReturn;
        Registry registry = getRegistry();
        Map<String,Object> allParams = registry.getConfiguration().getAllParams();

        if (requestJSON == null || keys.size() == 0) {
          paramsToReturn = allParams.keySet();
        } else {
          paramsToReturn = new HashSet<String>();
          for (int i = 0; i < keys.size(); i++) {
            paramsToReturn.add(keys.get(i).getAsString());
          }
        }

        if (paramsToReturn.contains("newSessionRequestCount")) {
          res.addProperty("newSessionRequestCount", registry.getNewSessionRequestCount());
          paramsToReturn.remove("newSessionRequestCount");
        }

        if (paramsToReturn.contains("slotCounts")) {
          res.add("slotCounts", getSlotCounts());
          paramsToReturn.remove("slotCounts");
        }

        for (String key : paramsToReturn) {
          Object value = allParams.get(key);
          if (value == null) {
            res.add(key, JsonNull.INSTANCE);
          } else {
            res.add(key, new Gson().toJsonTree(value));
          }

        }
      }
    } catch (Exception e) {
      res.remove("success");
      res.addProperty("success", false);
      res.addProperty("msg", e.getMessage());
    }
    return res;

  }

  private JsonObject getSlotCounts() {
    int freeSlots = 0;
    int totalSlots = 0;

    for (RemoteProxy proxy : getRegistry().getAllProxies()) {
      for (TestSlot slot : proxy.getTestSlots()) {
        if (slot.getSession() == null) {
          freeSlots += 1;
        }

        totalSlots += 1;
      }
    }

    JsonObject result = new JsonObject();

    result.addProperty("free", freeSlots);
    result.addProperty("total", totalSlots);

    return result;
  }

  private JsonObject getRequestJSON(HttpServletRequest request) throws IOException {
    JsonObject requestJSON = null;
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
    return requestJSON;
  }
}
