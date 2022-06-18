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

package org.openqa.selenium.support.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.support.ui.Quotes.escape;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

@Tag("UnitTests")
public class QuotesTest {
  @Test
  public void shouldConvertAnUnquotedStringIntoOneWithQuotes() {
    assertThat(escape("foo")).isEqualTo("\"foo\"");
  }

  @Test
  public void shouldConvertAStringWithATickIntoOneWithQuotes() {
    assertThat(escape("f'oo")).isEqualTo("\"f'oo\"");
  }

  @Test
  public void shouldConvertAStringWithAQuotIntoOneWithTicks() {
    assertThat(escape("f\"oo")).isEqualTo("'f\"oo'");
  }

  @Test
  public void shouldProvideConcatenatedStringsWhenStringToEscapeContainsTicksAndQuotes() {
    assertThat(escape("f\"o'o")).isEqualTo("concat(\"f\", '\"', \"o'o\")");
  }

  /**
   * Tests that Quotes.escape returns concatenated strings when the given
   * string contains a tick and and ends with a quote.
   */
  @Test
  public void shouldProvideConcatenatedStringsWhenStringEndsWithQuote() {
    assertThat(escape(
        "Bar \"Rock'n'Roll\"")).isEqualTo("concat(\"Bar \", '\"', \"Rock'n'Roll\", '\"')");
  }
}
