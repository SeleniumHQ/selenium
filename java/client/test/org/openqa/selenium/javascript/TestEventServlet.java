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


package org.openqa.selenium.javascript;

import com.google.common.io.CharStreams;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class TestEventServlet extends HttpServlet implements TestEventSupplier {

  private final BlockingQueue<TestEvent> pendingResults =
      new LinkedBlockingQueue<TestEvent>();

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    String raw = CharStreams.toString(req.getReader());

    JSONObject json;
    try {
      json = new JSONObject(raw);
    } catch (JSONException e) {
      throw new ServletException(e);
    }

    pendingResults.offer(new TestEvent(json));
  }

  public TestEvent getTestEvent(long time, TimeUnit unit) throws InterruptedException {
    return pendingResults.poll(time, unit);
  }
}
