package org.openqa.selenium.javascript;

import com.google.common.base.Joiner;
import com.google.common.io.CharStreams;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class ResultsServlet extends HttpServlet {

  private final BlockingQueue<ResultSet> pendingResults =
      new LinkedBlockingQueue<ResultSet>();

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    String raw = Joiner.on("").join(CharStreams.readLines(req.getReader()));

    JSONObject json;
    try {
      json = new JSONObject(raw);
    } catch (JSONException e) {
      throw new ServletException(e);
    }

    pendingResults.offer(new ResultSet(json));
  }

  public ResultSet getResultSet(long time, TimeUnit unit) throws InterruptedException {
    return pendingResults.poll(time, unit);
  }
}
