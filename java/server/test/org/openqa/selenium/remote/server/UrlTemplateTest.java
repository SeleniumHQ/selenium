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

package org.openqa.selenium.remote.server;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;

public class UrlTemplateTest {

  @Test
  public void shouldNotMatchAgainstTemplateThatDoesNotMatch() {
    UrlTemplate.Match match = new UrlTemplate("/session/cake").match("/i/like/peas");

    assertNull(match);
  }

  @Test
  public void shouldReturnAStraightUrl() {
    UrlTemplate.Match match = new UrlTemplate("/session/cake").match("/session/cake");

    assertEquals("/session/cake", match.getUrl());
    assertEquals(ImmutableMap.of(), match.getParameters());
  }

  @Test
  public void shouldExpandParameters() {
    UrlTemplate.Match match = new UrlTemplate("/i/like/{veggie}").match("/i/like/cake");

    assertEquals("/i/like/cake", match.getUrl());
    assertEquals(ImmutableMap.of("veggie", "cake"), match.getParameters());
  }

  @Test
  public void itIsFineForTheFirstCharacterToBeAPattern() {
    UrlTemplate.Match match = new UrlTemplate("{cake}/type").match("cheese/type");

    assertEquals("cheese/type", match.getUrl());
    assertEquals(ImmutableMap.of("cake", "cheese"), match.getParameters());
  }
}
