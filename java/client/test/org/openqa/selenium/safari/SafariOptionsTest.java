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

package org.openqa.selenium.safari;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;

import java.util.HashMap;
import java.util.Map;

public class SafariOptionsTest {

  @Test
  public void roundTrippingToCapabilitiesAndBackWorks() {
    SafariOptions expected = new SafariOptions().setUseTechnologyPreview(true);

    // Convert to a Map so we can create a standalone capabilities instance, which we then use to
    // create a new set of options. This is the round trip, ladies and gentlemen.
    SafariOptions seen = new SafariOptions(new ImmutableCapabilities(expected.asMap()));

    assertEquals(expected, seen);
  }

  @Test
  public void canConstructFromCapabilities() {
    Map<String, Object> embeddedOptions = new HashMap<>();
    embeddedOptions.put("technologyPreview", true);

    SafariOptions options = new SafariOptions();
    assertFalse(options.getUseTechnologyPreview());

    options = new SafariOptions(new ImmutableCapabilities(SafariOptions.CAPABILITY, embeddedOptions));
    assertTrue(options.getUseTechnologyPreview());

    embeddedOptions.put("technologyPreview", false);
    options = new SafariOptions(new ImmutableCapabilities(SafariOptions.CAPABILITY, embeddedOptions));
    assertFalse(options.getUseTechnologyPreview());

    options = new SafariOptions(new ImmutableCapabilities("se:safari:techPreview", true));
    assertTrue(options.getUseTechnologyPreview());

    options = new SafariOptions(new ImmutableCapabilities("se:safari:techPreview", false));
    assertFalse(options.getUseTechnologyPreview());
  }

  @Test
  public void newerStyleCapabilityWinsOverOlderStyle() {
    SafariOptions options = new SafariOptions(new ImmutableCapabilities(
        SafariOptions.CAPABILITY, ImmutableMap.of("technologyPreview", false),
        "se:safari:techPreview", true));

    assertTrue(options.getUseTechnologyPreview());
  }

  @Test
  public void settingTechnologyPreviewModeAlsoChangesBrowserName() {
    SafariOptions options = new SafariOptions();
    assertEquals("safari", options.getBrowserName());

    options.setUseTechnologyPreview(true);
    assertEquals("Safari Technology Preview", options.getBrowserName());

    options.setUseTechnologyPreview(false);
    assertEquals("safari", options.getBrowserName());
  }
}
