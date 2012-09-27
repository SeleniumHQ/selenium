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


package org.openqa.selenium.server.mock;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.logging.Logger;

/**
 * Base class to perform out-of-thread HTTP requests. We use these to start a request X, then start
 * a request Y, then get the result of request X. (e.g. driver requests "click", browser requests
 * "OK" [requesting more work], server replies "OK" to the driver.)
 * 
 * @author Dan Fabulich
 * @see BrowserRequest
 * @see DriverRequest
 */
public abstract class AsyncHttpRequest {
  _AsyncRunnable runner;
  Thread thread;
  public static final int DEFAULT_TIMEOUT = 30000; // 0 = infinite, good for debugging

  protected AsyncHttpRequest() {
  }

  static Logger log = Logger.getLogger(AsyncHttpRequest.class.getName());

  /** reusable "constructor" to be used by child classes */
  protected static <T extends AsyncHttpRequest> T constructRequest(T request, String name,
      String url, String body, int timeoutInMillis) {
    request.runner = new _AsyncRunnable(url, body, timeoutInMillis);
    request.thread = new Thread(request.runner);  // Thread safety reviewed
    request.thread.setName(name);
    request.thread.start();
    return request;
  }

  /** returns the stringified result of the request, or throws an exception if there was a problem */
  protected String getResult() {
    try {
      thread.join();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
    if (runner.ioex != null) {
      throw new RuntimeException(runner.ioex);
    }
    if (runner.rtex != null) {
      throw new RuntimeException(runner.rtex);
    }
    return runner.resultBody;
  }

  /** Performs the actual request, usually in a spawned thread */
  protected static class _AsyncRunnable implements Runnable {

    String url, requestBody; // Happens-before the thread
    volatile String resultBody;
    final int timeoutInMillis;
    // if an exception is thrown, put it here
    volatile IOException ioex;
    volatile RuntimeException rtex;

    public _AsyncRunnable(String url, String body, int timeoutInMillis) {
      this.url = url;
      this.requestBody = body;
      this.timeoutInMillis = timeoutInMillis;
    }

    /** do the actual request, capturing the result or the exception */
    public void run() {
      try {
        log.info("requesting url " + url);
        log.info("request body " + requestBody);
        resultBody = doBrowserRequest(url, requestBody);
        log.info("request got result: " + resultBody);
      } catch (IOException e) {
        ioex = e;
      } catch (RuntimeException e) {
        rtex = e;
      }

    }

    private String doBrowserRequest(String urlString, String body) throws IOException {
      int responsecode = 200;
      URL result = new URL(urlString);
      HttpURLConnection conn = (HttpURLConnection) result.openConnection();

      conn.setConnectTimeout(timeoutInMillis);
      conn.setReadTimeout(timeoutInMillis);
      conn.setRequestProperty("Content-Type", "application/xml");
      // Send POST output.
      if (body != null) {
        conn.setDoOutput(true);
        OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
        wr.write(body);
        wr.flush();
        wr.close();
      }
      // conn.setInstanceFollowRedirects(false);
      // responsecode = conn.getResponseCode();
      if (responsecode == 301) {
        String pathToServlet = conn.getRequestProperty("Location");
        throw new RuntimeException("Bug! 301 redirect??? " + pathToServlet);
      } else if (responsecode != 200) {
        throw new RuntimeException(conn.getResponseMessage());
      } else {
        InputStream is = conn.getInputStream();
        return stringContentsOfInputStream(is);
      }
    }

    private String stringContentsOfInputStream(InputStream is) throws IOException {
      StringBuffer sb = new StringBuffer();
      InputStreamReader r = new InputStreamReader(is, "UTF-8");
      int c;
      while ((c = r.read()) != -1) {
        sb.append((char) c);
      }
      return sb.toString();
    }

  }

  /**
   * Tests if this request is still active. A thread is alive if it has been started and has not yet
   * died.
   * 
   * @return <code>true</code> if this thread is alive; <code>false</code> otherwise.
   */
  public boolean isAlive() {
    return thread.isAlive();
  }
}
