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

package org.openqa.grid.web.servlet.api.v1;

import com.google.gson.GsonBuilder;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.RegistryBasedServlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public abstract class RestApiEndpoint extends RegistryBasedServlet {

  RestApiEndpoint() {
    this(null);
  }

  RestApiEndpoint(Registry registry) {
    super(registry);
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException {
    process(req, resp);
  }

  protected void process(HttpServletRequest request, HttpServletResponse response)
    throws IOException {

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(200);

    try {
      response.getWriter().print(new GsonBuilder().setPrettyPrinting().create()
                                     .toJson(getResponse(request.getPathInfo())));
    } catch (RuntimeException e) {
      throw new GridException(e.getMessage());
    } finally {
      response.getWriter().close();
    }
  }

  public abstract Object getResponse(String query);

  boolean isInvalidQuery(String query) {
    return query == null || "/".equals(query);
  }

}
