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

package org.openqa.selenium.remote;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.testing.UnitTests;

import java.util.UUID;

import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.Dialect.W3C;

@Category(UnitTests.class)
public class JsonToWebElementConverterTest {

  private RemoteWebDriver driver;

  @Before
  public void createIdleDriver() {
    driver = new RemoteWebDriver(cmd -> new Response(), new ImmutableCapabilities()) {
      @Override
      protected void startSession(Capabilities capabilities) {
        // Do nothing
      }
    };
  }

  @Test
  public void shouldConvertShadowRootsToSearchContexts() {
    UUID rootId = UUID.randomUUID();

    Object result = new JsonToWebElementConverter(driver)
      .apply(singletonMap(W3C.getShadowRootElementKey(), rootId.toString()));

    assertThat(result).isInstanceOf(SearchContext.class);
  }

}
