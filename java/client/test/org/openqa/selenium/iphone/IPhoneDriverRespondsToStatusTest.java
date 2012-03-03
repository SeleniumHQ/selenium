/*
Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.iphone;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class IPhoneDriverRespondsToStatusTest extends JUnit4TestBase {

  @Test
  public void testCanCheckServerStatusIndependentlyOfSessions() throws IOException, JSONException {
    if (!(driver instanceof IPhoneDriver)) {
      System.out.println("Skipping test: driver is not a IPhoneDriver");
      return;
    }

    RemoteWebDriver remote = (RemoteWebDriver) driver;
    CommandExecutor executor = remote.getCommandExecutor();

    Command command = new Command(null, DriverCommand.STATUS);
    System.out.println("Executing status command.");
    Response res = executor.execute(command);
    assertEquals(0, res.getStatus());
    String raw = (String) res.getValue();
    System.out.println("RAW:");
    System.out.println(raw);
    JSONObject response = new JSONObject(raw);

    JSONObject value = response.getJSONObject("value");
    assertHasKeys(value, "os"/*, "build"*/);
    assertHasKeys(value.getJSONObject("os"), "name", "arch", CapabilityType.VERSION);
    // build is not currently in response, is a TODO
    //assertHasKeys(value.getJSONObject("build"), CapabilityType.VERSION, "revision", "time");
  }

  private static void assertHasKeys(JSONObject object, String... keys) {
    for (String key : keys) {
      assertTrue("Object does not contain expected key: " + key + " (" + object + ")",
          object.has(key));
    }
  }
}
