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

package org.openqa.selenium.firefox;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import com.google.gson.JsonObject;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.IOException;
import java.nio.file.Paths;

public class FirefoxOptionsTest {

  @Test
  public void binaryPathNeedNotExist() {
    try {
      new FirefoxOptions().setBinary("does/not/exist");
    } catch (Exception e) {
      fail("Did not expect to see any exceptions thrown: " + e);
    }
  }

  @Test
  public void canSetBinaryThroughOptions() throws IOException {
    FirefoxOptions options = new FirefoxOptions().setBinary("some/path");

    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals("some/path", caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void shouldKeepAFirefoxBinaryAsABinaryIfSetAsOne() {
    FirefoxBinary binary = new FirefoxBinary();
    FirefoxOptions options = new FirefoxOptions().setBinary(binary);

    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals(binary, caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void stringBasedBinaryRemainsAbsoluteIfSetAsAbsolute() throws IOException {
    JsonObject json = new FirefoxOptions().setBinary("/i/like/cheese").toJson();

    assertEquals("/i/like/cheese", json.getAsJsonPrimitive("binary").getAsString());
  }

  @Test
  public void pathBasedBinaryRemainsAbsoluteIfSetAsAbsolute() throws IOException {
    JsonObject json = new FirefoxOptions().setBinary(Paths.get("/i/like/cheese")).toJson();

    assertEquals("/i/like/cheese", json.getAsJsonPrimitive("binary").getAsString());
  }
}
