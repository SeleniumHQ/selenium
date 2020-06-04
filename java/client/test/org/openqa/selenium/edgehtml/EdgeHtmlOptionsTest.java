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

package org.openqa.selenium.edgehtml;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Map;

public class EdgeHtmlOptionsTest {

  @Test
  public void testDefaultOptions() {
    EdgeHtmlOptions options = new EdgeHtmlOptions();
    assertThat(options.asMap())
        .containsEntry(CapabilityType.BROWSER_NAME, BrowserType.EDGE)
        .containsEntry(EdgeHtmlOptions.USE_CHROMIUM, false);
  }

  @Test
  public void canMergeWithoutChangingOriginalObject() {
    EdgeHtmlOptions options = new EdgeHtmlOptions();
    Map<String, Object> before = options.asMap();
    EdgeHtmlOptions merged = options.merge(
        new ImmutableCapabilities(CapabilityType.PAGE_LOAD_STRATEGY, PageLoadStrategy.NONE));
    // TODO: assertThat(merged).isNotSameAs(options);
    // TODO: assertThat(options.asMap()).isEqualTo(before);
    assertThat(merged.getCapability(CapabilityType.PAGE_LOAD_STRATEGY)).isEqualTo(PageLoadStrategy.NONE);
  }

}