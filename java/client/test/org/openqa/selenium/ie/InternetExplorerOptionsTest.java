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

package org.openqa.selenium.ie;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.ie.InternetExplorerDriver.INITIAL_BROWSER_URL;
import static org.openqa.selenium.ie.InternetExplorerDriver.INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.util.Map;

@RunWith(JUnit4.class)
public class InternetExplorerOptionsTest {

  @Test
  public void shouldAllowACapabilityToBeSet() {
    InternetExplorerOptions options = new InternetExplorerOptions();
    options.setCapability("cheese", "cake");

    assertEquals(options.toString(), "cake", options.asMap().get("cheese"));
  }

  @Test
  public void shouldMirrorCapabilitiesForIeProperly() {
    String expected = "http://cheese.example.com";
    InternetExplorerOptions options = new InternetExplorerOptions()
        .withInitialBrowserUrl(expected);

    Map<String, ?> map = options.asMap();

    assertEquals(options.toString(), expected, map.get(INITIAL_BROWSER_URL));
    assertEquals(
        options.toString(),
        expected,
        ((Map<?, ?>) map.get("se:ieOptions")).get(INITIAL_BROWSER_URL));
  }

  @Test
  public void shouldMirrorCapabilitiesFromPassedInIeOptions() {
    InternetExplorerOptions toMirror = new InternetExplorerOptions()
        .introduceFlakinessByIgnoringSecurityDomains();

    // This is damn weird.
    InternetExplorerOptions options = new InternetExplorerOptions();
    options.setCapability("se:ieOptions", toMirror);

    assertTrue(options.is(INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS));
  }

  @Test
  public void shouldPopulateIeOptionsFromExistingCapabilitiesWhichLackThem() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS, true);

    InternetExplorerOptions options = new InternetExplorerOptions(caps);

    assertTrue(options.is(INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS));

    Map<?, ?> remoteOptions = (Map<?, ?>) options.getCapability("se:ieOptions");

    assertEquals(
        options.toString(),
        true,
        remoteOptions.get(INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS));
  }

  @Test
  public void shouldSurviveASerializationRoundTrip() {
    InternetExplorerOptions options = new InternetExplorerOptions()
        .withInitialBrowserUrl("http://www.cheese.com")
        .addCommandSwitches("--cake");

    String json = new BeanToJsonConverter().convert(options);
    System.out.println("json = " + json);
    Capabilities capabilities = new JsonToBeanConverter().convert(Capabilities.class, json);

    assertEquals(options, capabilities);

    InternetExplorerOptions freshOptions = new InternetExplorerOptions(capabilities);

    assertEquals(options, freshOptions);
  }
}
