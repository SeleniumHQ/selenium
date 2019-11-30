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

package org.openqa.selenium.testing;

import org.junit.AssumptionViolatedException;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.openqa.selenium.json.Json;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

public class NotificationRule extends TestWatcher {

  private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
  private String notificationUrl = System.getenv("DASHBOARD_URL");
  private String jobId = System.getenv("TRAVIS_JOB_ID");

  private static OkHttpClient client = new OkHttpClient();

  private String id;
  private long startedAt;

  @Override
  protected void starting(Description description) {
    super.starting(description);
    if (notificationUrl != null && jobId != null) {
      Map<String, Object> map = new HashMap<>();
      map.put("name", description.getDisplayName());
      map.put("testclass", description.getClassName());
      map.put("testcase", description.getMethodName());
      map.put("job_id", jobId);
      startedAt = System.currentTimeMillis();
      map.put("started_at", startedAt);
      id = notify(map, notificationUrl);
    }
  }

  @Override
  protected void succeeded(Description description) {
    long finishedAt = System.currentTimeMillis();
    if (id != null && notificationUrl != null && jobId != null) {
      Map<String, Object> map = new HashMap<>();
      map.put("id", id);
      map.put("testclass", description.getClassName());
      map.put("testcase", description.getMethodName());
      map.put("job_id", jobId);
      map.put("result", "passed");
      map.put("started_at", startedAt);
      map.put("finished_at", finishedAt);
      notify(map, notificationUrl + "/" + id);
    }
    super.succeeded(description);
  }

  @Override
  protected void failed(Throwable e, Description description) {
    long finishedAt = System.currentTimeMillis();
    if (id != null && notificationUrl != null && jobId != null) {
      Map<String, Object> map = new HashMap<>();
      map.put("id", id);
      map.put("testclass", description.getClassName());
      map.put("testcase", description.getMethodName());
      map.put("job_id", jobId);
      map.put("result", "failed");
      map.put("exception", e.getClass().getName());
      map.put("message", e.getMessage());
      map.put("stacktrace", stacktraceToString(e));
      map.put("started_at", startedAt);
      map.put("finished_at", finishedAt);
      notify(map, notificationUrl + "/" + id);
    }
    super.succeeded(description);
  }

  @Override
  protected void skipped(AssumptionViolatedException e, Description description) {
    long finishedAt = System.currentTimeMillis();
    if (id != null && notificationUrl != null && jobId != null) {
      Map<String, Object> map = new HashMap<>();
      map.put("id", id);
      map.put("testclass", description.getClassName());
      map.put("testcase", description.getMethodName());
      map.put("job_id", jobId);
      map.put("result", "skipped");
      map.put("exception", e.getClass().getName());
      map.put("message", e.getMessage());
      map.put("stacktrace", stacktraceToString(e));
      map.put("started_at", startedAt);
      map.put("finished_at", finishedAt);
      notify(map, notificationUrl + "/" + id);
    }
    super.succeeded(description);
  }

  private String stacktraceToString(Throwable e) {
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    e.printStackTrace(pw);
    return sw.toString();
  }

  private String notify(Map<String, Object> map, String notificationUrl) {
    try {
      RequestBody body = RequestBody.create(JSON, new Json().toJson(map));
      Request request = new Request.Builder()
          .url(notificationUrl).post(body).build();

      try (Response response = client.newCall(request).execute()) {
        if (response.isSuccessful()) {
          return response.body().string().replace("\"", "");
        } else {
          return null;
        }
      }
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

}