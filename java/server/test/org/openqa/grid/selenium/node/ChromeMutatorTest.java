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

package org.openqa.grid.selenium.node;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.openqa.selenium.chrome.ChromeOptions.CAPABILITY;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.chrome.ChromeOptions;

import java.util.Map;

public class ChromeMutatorTest {

  private final ImmutableCapabilities defaultConfig = new ImmutableCapabilities(
      "browserName", "chrome",
      "chrome_binary", "binary");
  @Test
  public void shouldDoNothingIfBrowserNameIsNotChrome() {
    ImmutableCapabilities caps = new ImmutableCapabilities("browserName", "cake");

    ImmutableCapabilities seen = new ChromeMutator(defaultConfig).apply(caps);

    // Make sure we return exactly the same instance of the capabilities, and not just a copy.
    assertSame(caps, seen);
  }

  @Test
  public void shouldDoNothingIfCapabilitiesUsedToConfigureMutatorAreNotChromeBased() {
    ImmutableCapabilities config = new ImmutableCapabilities(
        "browserName", "foo",
        CAPABILITY, ImmutableMap.of("binary", "cake"));

    ImmutableCapabilities caps = new ImmutableCapabilities("browserName", "chrome");
    ImmutableCapabilities seen = new FirefoxMutator(config).apply(caps);

    assertSame(caps, seen);
  }

  @Test
  public void shouldInjectBinaryIfNotSpecified() {
    ImmutableCapabilities caps = new ImmutableCapabilities(new ChromeOptions());
    ImmutableCapabilities seen = new ChromeMutator(defaultConfig).apply(caps);

    @SuppressWarnings("unchecked")
    Map<String, Object> options = (Map<String, Object>) seen.getCapability(CAPABILITY);

    assertEquals(
        options.get("binary"),
        defaultConfig.getCapability("chrome_binary"));
  }
}
