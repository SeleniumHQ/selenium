/*
Copyright 2006-2012 Selenium committers
Copyright 2006-2012 Software Freedom Conservancy

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

package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.server.DefaultRemoteCommand;
import org.openqa.selenium.server.RemoteCommand;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.logging.Logger;

public class MockBrowserLauncher implements BrowserLauncher, Runnable {

  private static final String DANGEROUS_TEXT = "&%?\\+|,%*";
  private static final String JAPANESE_TEXT = "\u307E\u3077";
  private static final String CHINESE_TEXT = "\u4E2D\u6587";
  private static final String KOREAN_TEXT = "\uC5F4\uC5D0";
  private static final String ROMANCE_TEXT =
      "\u00FC\u00F6\u00E4\u00DC\u00D6\u00C4 \u00E7\u00E8\u00E9 \u00BF\u00F1 \u00E8\u00E0\u00F9\u00F2";
  static Logger log = Logger.getLogger(MockBrowserLauncher.class.getName());
  private final String sessionId;
  private Thread browser;
  private volatile boolean interrupted = false;
  private final String uniqueId;
  private int sequenceNumber = 0;
  private final RemoteControlConfiguration configuration;
  private final Capabilities browserOptions;

  public MockBrowserLauncher(Capabilities browserOptions, RemoteControlConfiguration configuration,
      String sessionId, String command) {
    this.sessionId = sessionId;
    this.uniqueId = "mock";
    this.configuration = configuration;
    this.browserOptions = browserOptions;
  }

  public void launchHTMLSuite(String startURL, String suiteUrl) {

  }

  public void close() {
    interrupted = true;
    browser.interrupt();

  }

  public void run() {
    try {
      String startURL =
          "http://localhost:" + configuration.getPortDriversShouldContact() +
              "/selenium-server/driver/?sessionId=" + sessionId + "&uniqueId=" + uniqueId;
      String commandLine =
          doBrowserRequest(startURL + "&seleniumStart=true&sequenceNumber=" + sequenceNumber++,
              "START");
      while (!interrupted) {
        log.info("MOCK: " + commandLine);
        RemoteCommand sc = DefaultRemoteCommand.parse(commandLine);
        String result = doCommand(sc);
        if (browserOptions.is("browserSideLog") && !interrupted) {
          for (int i = 0; i < 3; i++) {
            doBrowserRequest(startURL + "&logging=true&sequenceNumber=" + sequenceNumber++,
                "logLevel=debug:dummy log message " + i + "\n");
          }
        }
        if (!interrupted) {
          commandLine = doBrowserRequest(startURL + "&sequenceNumber=" + sequenceNumber++, result);
        }
      }
      log.info("MOCK: interrupted, exiting");
    } catch (Exception e) {
      RuntimeException re = new RuntimeException("Exception in mock browser", e);
      re.printStackTrace();
      throw re;
    }
  }

  private String doCommand(RemoteCommand sc) {
    String command = sc.getCommand();
    if (command.equals("getAllButtons")) {
      return "OK,";
    } else if (command.equals("getAllLinks")) {
      return "OK,1";
    } else if (command.equals("getAllFields")) {
      return "OK,1,2,3";
    } else if (command.equals("getWhetherThisFrameMatchFrameExpression")) {
      return "OK,true";
    } else if ("dangerous-labels".equals(sc.getField()) && command.equals("getSelectOptions")) {
      return "OK,veni\\, vidi\\, vici,c:\\\\foo\\\\bar,c:\\\\I came\\, I \\\\saw\\\\\\, I conquered";

    } else if (command.startsWith("getText")) {
      if ("romance".equals(sc.getField())) {
        return "OK," + ROMANCE_TEXT;
      } else if ("korean".equals(sc.getField())) {
        return "OK," + KOREAN_TEXT;
      } else if ("chinese".equals(sc.getField())) {
        return "OK," + CHINESE_TEXT;
      } else if ("japanese".equals(sc.getField())) {
        return "OK," + JAPANESE_TEXT;
      } else if ("dangerous".equals(sc.getField())) {
        return "OK," + DANGEROUS_TEXT;
      }
    }
    else if (command.startsWith("get")) {
      return "OK,x";
    } else if (command.startsWith("isTextPresent")) {
      if (ROMANCE_TEXT.equals(sc.getField())) {
        return "OK,true";
      } else if (KOREAN_TEXT.equals(sc.getField())) {
        return "OK,true";
      } else if (CHINESE_TEXT.equals(sc.getField())) {
        return "OK,true";
      } else if (JAPANESE_TEXT.equals(sc.getField())) {
        return "OK,true";
      } else if (DANGEROUS_TEXT.equals(sc.getField())) {
        return "OK,true";
      }
      return "OK,false";
    }
    else if (command.startsWith("is")) {
      return "OK,true";
    }
    return "OK";
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

  private String doBrowserRequest(String url, String body) throws IOException {
    int responsecode = 200;
    URL result = new URL(url);
    HttpURLConnection conn = (HttpURLConnection) result.openConnection();

    conn.setRequestProperty("Content-Type", "application/xml");
    // Send POST output.
    conn.setDoOutput(true);
    OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream(), "UTF-8");
    wr.write(body);
    wr.flush();
    wr.close();
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

  /**
   * Note that the browserConfigurationOptions object is ignored; This browser configuration is not
   * supported for IE
   */
  public void launchRemoteSession(String url) {
    browser = new Thread(this); // Thread safety reviewed
    browser.setName("mockbrowser");
    if (null != url) {
      browser.start();
    } else {
      log.info("launching a mock unresponsive browser");
    }
  }

}
