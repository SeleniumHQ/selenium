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

package org.openqa.selenium.remote.server;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.Json;

import java.io.IOException;
import java.util.Map;
import java.util.function.Consumer;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LifecycleServlet extends HttpServlet {

  private final Json json = new Json();
  private Consumer<Integer> shutdown = System::exit;

  void setShutdown(Consumer<Integer> shutdown) {
    this.shutdown = shutdown;
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    process(req, resp);
  }

  protected void process(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setContentType("application/json");
    resp.setCharacterEncoding("UTF-8");
    resp.setStatus(200);
    String action = req.getParameter("action");
    if ("shutdown".equalsIgnoreCase(action)) {
      Runnable initiateShutDown = () -> {
        try {
          Thread.sleep(500);
        } catch (InterruptedException e) {
          Map<?, ?> result = ImmutableMap.of("success", false, "msg", e.getMessage());
          write(resp, result);
        }
        shutdown.accept(0);
      };
      Thread isd = new Thread(initiateShutDown);
      isd.setName("initiateShutDown");
      isd.start();
      Map<?, ?> result = ImmutableMap.of("success", true);
      write(resp, result);
    }
    resp.getWriter().close();
  }

  private void write(HttpServletResponse rsp, Map<?,?> data) {
    try {
      json.newOutput(rsp.getWriter()).write(data);
    } catch (IOException e) {
      //gobble exception.
    }
  }

}
