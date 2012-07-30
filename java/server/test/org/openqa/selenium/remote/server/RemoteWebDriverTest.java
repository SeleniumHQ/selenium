/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server;

import com.google.common.io.ByteStreams;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class RemoteWebDriverTest extends JUnit4TestBase {

  @Test
  public void testCanCheckServerStatusIndependentlyOfSessions() throws IOException, JSONException {
    if (!(driver instanceof RemoteWebDriver)) {
      System.out.println("Skipping test: driver is not a remote webdriver");
      return;
    }

    RemoteWebDriver remote = (RemoteWebDriver) driver;
    CommandExecutor executor = remote.getCommandExecutor();

    if (!(executor instanceof HttpCommandExecutor)) {
      System.out.println("Skipping test: driver is not using a HttpCommandExecutor");
      return;
    }

    HttpCommandExecutor httpExecutor = (HttpCommandExecutor) executor;
    URL statusUrl = new URL(httpExecutor.getAddressOfRemoteServer() + "/status");
    HttpURLConnection connection = null;
    try {
      System.out.println("Opening connection to " + statusUrl);
      connection = (HttpURLConnection) statusUrl.openConnection();
      connection.connect();

      assertEquals(200, connection.getResponseCode());

      String raw = new String(ByteStreams.toByteArray(connection.getInputStream()));
      JSONObject response = new JSONObject(raw);
      assertEquals(raw, ErrorCodes.SUCCESS, response.getInt("status"));

      JSONObject value = response.getJSONObject("value");
      assertHasKeys(value, "os", "build", "java");
      assertHasKeys(value.getJSONObject("os"), "name", "arch", CapabilityType.VERSION);
      assertHasKeys(value.getJSONObject("build"), CapabilityType.VERSION, "revision", "time");
      assertHasKeys(value.getJSONObject("java"), CapabilityType.VERSION);
    } finally {
      if (connection != null) {
        connection.disconnect();
      }
    }
  }

  private static void assertHasKeys(JSONObject object, String... keys) {
    for (String key : keys) {
      assertTrue("Object does not contain expected key: " + key + " (" + object + ")",
          object.has(key));
    }
  }
}
