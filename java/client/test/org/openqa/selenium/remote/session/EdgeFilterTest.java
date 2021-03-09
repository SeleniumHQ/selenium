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

package org.openqa.selenium.remote.session;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.testing.UnitTests;

import java.util.Map;

@Category(UnitTests.class)
public class EdgeFilterTest {

  @Test
  public void shouldNotFilterOutEdgeCapabilities() {
    Map<String, Object> original = new EdgeOptions().asMap();
    Map<String, Object> filtered = new EdgeFilter().apply(original);
    assertThat(filtered).isEqualTo(original);
  }

  @Test
  public void shouldFilterOutNonEdgeCapabilities() {
    Map<String, Object> original = new ChromeOptions().asMap();
    Map<String, Object> filtered = new EdgeFilter().apply(original);
    assertThat(filtered).isNull();
  }

}
