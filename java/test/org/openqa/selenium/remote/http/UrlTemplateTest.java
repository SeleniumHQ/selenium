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

package org.openqa.selenium.remote.http;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.ImmutableMap;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

@Tag("UnitTests")
public class UrlTemplateTest {

  @Test
  public void shouldNotMatchAgainstTemplateThatDoesNotMatch() {
    UrlTemplate.Match match = new UrlTemplate("/session/cake").match("/i/like/peas");

    assertThat(match).isNull();
  }

  @Test
  public void shouldReturnAStraightUrl() {
    UrlTemplate.Match match = new UrlTemplate("/session/cake").match("/session/cake");

    assertThat(match.getUrl()).isEqualTo("/session/cake");
    assertThat(match.getParameters()).isEmpty();
  }

  @Test
  public void shouldExpandParameters() {
    UrlTemplate.Match match = new UrlTemplate("/i/like/{veggie}").match("/i/like/cake");

    assertThat(match.getUrl()).isEqualTo("/i/like/cake");
    assertThat(match.getParameters()).isEqualTo(ImmutableMap.of("veggie", "cake"));
  }

  @Test
  public void itIsFineForTheFirstCharacterToBeAPattern() {
    UrlTemplate.Match match = new UrlTemplate("{cake}/type").match("cheese/type");

    assertThat(match.getUrl()).isEqualTo("cheese/type");
    assertThat(match.getParameters()).isEqualTo(ImmutableMap.of("cake", "cheese"));
  }

  @Test
  public void aNullMatchDoesNotCauseANullPointerExceptionToBeThrown() {
    assertThat(new UrlTemplate("/").match(null)).isNull();
  }
}
