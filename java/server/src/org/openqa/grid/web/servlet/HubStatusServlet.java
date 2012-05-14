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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.Registry;

/**
 * API to query the hub config remotly.
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
 * if no param is specfied, all params known to the hub are returned.
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
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);
    JSONObject res;
    try {
      res = getResponse(request);
      response.getWriter().print(res);
      response.getWriter().close();
    } catch (JSONException e) {
      throw new GridException(e.getMessage());
    }

  }

  private JSONObject getResponse(HttpServletRequest request) throws IOException, JSONException {
    JSONObject requestJSON = null;
    JSONObject res = new JSONObject();
    res.put("success", true);
    try {
      if (request.getInputStream() != null) {
        BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream()));
        StringBuilder s = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
          s.append(line);
        }
        rd.close();
        String json = s.toString();
        if (json != null && !"".equals(json)) {
          requestJSON = new JSONObject(json);
        }

        JSONArray keys = requestJSON != null ? requestJSON.getJSONArray("configuration")
                              : null;

        Set<String> paramsToReturn;
        if (requestJSON == null || keys.length() == 0) {
          paramsToReturn = getRegistry().getConfiguration().getAllParams().keySet();
        } else {
          paramsToReturn = new HashSet<String>();
          for (int i = 0; i < keys.length(); i++) {
            paramsToReturn.add(keys.getString(i));
          }
        }
        for (String key : paramsToReturn) {

          Object value = getRegistry().getConfiguration().getAllParams().get(key);
          if (value == null) {
            res.put(key, JSONObject.NULL);
          } else {
            res.put(key, value);
          }

        }
      }
    } catch (Exception e) {
      res.put("success", false);
      res.put("msg", e.getMessage());
    }
    return res;

  }
}
