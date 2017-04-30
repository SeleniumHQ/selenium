package org.openqa.selenium.testing;

import com.google.gson.Gson;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.junit.AssumptionViolatedException;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

public class NotificationRule extends TestWatcher {

  private String notificationUrl = System.getenv("DASHBOARD_URL");
  private String jobId = System.getenv("TRAVIS_JOB_ID");

  private Long id;
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
      notify(map, notificationUrl);
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
      notify(map, notificationUrl);
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
      map.put("stacktrace", stacktraceToString(e));
      map.put("started_at", startedAt);
      map.put("finished_at", finishedAt);
      notify(map, notificationUrl);
    }
    super.succeeded(description);
  }

  private String stacktraceToString(Throwable e) {
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    e.printStackTrace(pw);
    return sw.toString();
  }

  private Long notify(Map<String, Object> map, String notificationUrl) {
    try {
      CloseableHttpClient httpClient = HttpClients.createDefault();
      HttpPost httpPost = new HttpPost(notificationUrl);
      httpPost.setHeader("Content-Type", "application/json");
      httpPost.setEntity(new StringEntity(new Gson().toJson(map)));
      CloseableHttpResponse response = httpClient.execute(httpPost);
      String body = EntityUtils.toString(response.getEntity());
      return Long.parseLong(body);

    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

}
