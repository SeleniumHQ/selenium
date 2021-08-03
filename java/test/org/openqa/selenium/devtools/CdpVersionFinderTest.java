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

package org.openqa.selenium.devtools;

import com.google.common.collect.ImmutableList;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.testing.UnitTests;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;

@Category(UnitTests.class)
public class CdpVersionFinderTest {

  private Map<String, Object> chrome85;
  private Map<String, Object> edge84;

  @Before
  public void setUp() {
    Json json = new Json();
    chrome85 = json.toType(
      "{    \n" +
        "    \"Browser\": \"Chrome/85.0.4183.69\",\n" +
        "    \"Protocol-Version\": \"1.3\",\n" +
        "    \"User-Agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.69 Safari/537.36\",\n" +
        "    \"V8-Version\": \"8.5.210.19\",\n" +
        "    \"WebKit-Version\": \"537.36 (@4554ea1a1171bd8d06951a4b7d9336afe6c59967)\",\n" +
        "    \"webSocketDebuggerUrl\": \"ws://localhost:9222/devtools/browser/c0ef43a1-7bb0-48e3-9cec-d6bb048cb720\"\n" +
        "}",
      MAP_TYPE);

    edge84 = json.toType(
      "{\n" +
        "  \"Browser\": \"Edg/84.0.522.59\",\n" +
        "  \"Protocol-Version\": \"1.3\",\n" +
        "  \"User-Agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59\",\n" +
        "  \"V8-Version\": \"8.4.371.23\",\n" +
        "  \"WebKit-Version\": \"537.36 (@52ea6e40afcc988eef78d29d50f9077893fa1a12)\",\n" +
        "  \"webSocketDebuggerUrl\": \"ws://localhost:9222/devtools/browser/c7922624-12e8-4301-8b08-fa446944c5cc\"\n" +
        "}",
      MAP_TYPE);
  }

  @Test
  public void shouldReturnAnExactMatchIfFound() {
    CdpInfo v84 = new CdpInfo(84, dt -> null){};
    CdpInfo v85 = new CdpInfo(85, dt -> null){};

    CdpVersionFinder finder = new CdpVersionFinder(5, ImmutableList.of(v84, v85));

    Optional<CdpInfo> info = finder.match(chrome85);
    assertThat(info).isEqualTo(Optional.of(v85));

    info = finder.match(edge84);
    assertThat(info).isEqualTo(Optional.of(v84));
  }

  @Test
  public void shouldReturnThePreviousLowestMatchIfNoExactMatchFoundWithinFuzzFactor() {
    CdpInfo v84 = new CdpInfo(84, dt -> null){};

    CdpVersionFinder finder = new CdpVersionFinder(5, ImmutableList.of(v84));

    Optional<CdpInfo> info = finder.match(chrome85);
    assertThat(info).isEqualTo(Optional.of(v84));
  }

  @Test
  public void shouldReturnEmptyIfNothingIsFoundThatMatches() {
    CdpInfo v90 = new CdpInfo(90, dt -> null){};

    CdpVersionFinder finder = new CdpVersionFinder(5, ImmutableList.of(v90));

    assertThat(finder.match(edge84)).isEmpty();
    assertThat(finder.match(chrome85)).isEmpty();
  }

  @Test
  public void canUseBrowserVersionIfNecessary() {
    String chromeVersion = "85.0.4183.69";
    String edgeVersion = "84.0.522.59";

    CdpInfo v84 = new CdpInfo(84, dt -> null){};
    CdpInfo v85 = new CdpInfo(85, dt -> null){};
    CdpVersionFinder finder = new CdpVersionFinder(5, ImmutableList.of(v84, v85));

    Optional<CdpInfo> info = finder.match(chromeVersion);
    assertThat(info).isEqualTo(Optional.of(v85));

    info = finder.match(edgeVersion);
    assertThat(info).isEqualTo(Optional.of(v84));
  }

}
