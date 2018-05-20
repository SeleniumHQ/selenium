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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

import java.util.regex.Pattern;

public class TestTextWhitespace extends InternalSelenseTestBase {
  @Test
  public void testTextWhitespace() {
    selenium.open("../tests/html/test_text_content.html");
    verifyEquals(selenium.getText("nonTextMarkup"),
        "There is non-visible and visible markup here that doesn't change the text content");
    // Match exactly the same space characters
    verifyEquals(
        selenium.getText("spaces"),
        "1 space|2 space|3 space|1 nbsp|2  nbsp|3   nbsp|2  space_nbsp|2  nbsp_space|3   space_nbsp_space|3   nbsp_space_nbsp");
    verifyEquals(selenium.getText("tabcharacter"), "tab character between");
    verifyEquals(selenium.getText("nonVisibleNewlines"), "non visible newlines between");
    verifyTrue(Pattern.compile("visible\\s*newlines\\s*between")
        .matcher(selenium.getText("visibleNewlines")).find());
    verifyNotEquals("visible newlines between", selenium.getText("visibleNewlines"));
    verifyTrue(selenium.getText("paragraphs").matches("^First paragraph[\\s\\S]*Second paragraph$"));
    verifyNotEquals("First paragraph Second paragraph", selenium.getText("paragraphs"));
    verifyTrue(selenium.getText("preformatted").matches("^preformatted[\\s\\S]*newline$"));
    verifyNotEquals("preformatted newline", selenium.getText("preformatted"));
    verifyTrue(selenium
        .getText("mixedMarkup")
        .matches(
            "^visible[\\s\\S]*newlines and markup and non-visible newlines and markup[\\s\\S]*With[\\s\\S]*a paragraph[\\s\\S]*and[\\s\\S]*pre[\\s\\S]*formatted[\\s\\S]*text$"));
    verifyEquals(selenium.getText("empty"), "");
  }
}
