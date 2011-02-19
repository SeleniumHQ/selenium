/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

import org.junit.Test;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class BrowserOptionsTest {

  @Test
  public void shouldNotAttemptToCastAFileToAString() {
    File expected = new File("cheese");
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("file", expected);

    File seen = BrowserOptions.getFile(caps, "file");

    assertEquals(expected, seen);
  }


  @Test
  public void shouldConvertStringToFile() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability("file", "cheese");

    File seen = BrowserOptions.getFile(caps, "file");

    assertNotNull(seen);
    assertEquals("cheese", seen.getName());
  }

}
