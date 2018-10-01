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

public class TestStore extends InternalSelenseTestBase {
  @Test
  public void testStore() {
    selenium.open("../tests/html/test_verifications.html");
    String storedHiddenValue = selenium.getValue("theHidden");
    String storedSpanText = selenium.getText("theSpan");
    String storedTextClass = selenium.getAttribute("theText@class");
    String storedTitle = selenium.getTitle();
    String textVariable = "PLAIN TEXT";
    String javascriptVariable = selenium.getEval("'Pi ~= ' +\n (Math.round(Math.PI * 100) / 100)");
    selenium.open("../tests/html/test_store_value.html");
    selenium.type("theText", storedHiddenValue);
    verifyEquals(selenium.getValue("theText"), "the hidden value");
    selenium.type("theText", storedSpanText);
    verifyEquals(selenium.getValue("theText"), "this is the span");
    selenium.type("theText", storedTextClass);
    verifyEquals(selenium.getValue("theText"), "foo");
    selenium.type("theText", textVariable);
    verifyEquals(selenium.getValue("theText"), "PLAIN TEXT");
    selenium.type("theText", javascriptVariable);
    verifyEquals(selenium.getValue("theText"), "Pi ~= 3.14");
    selenium.type("theText", storedTitle);
    verifyEquals(selenium.getValue("theText"), "theTitle");
    // Test multiple output variables in a single expression
    selenium.type("theText", "'" + storedHiddenValue + "'_'" + storedSpanText + "'");
    verifyEquals(selenium.getValue("theText"), "'the hidden value'_'this is the span'");
    // backward compatibility
    selenium.open("../tests/html/test_just_text.html");
    String storedBodyText = selenium.getBodyText();
    selenium.open("../tests/html/test_store_value.html");
    verifyEquals(selenium.getValue("theText"), "");
    selenium.type("theText", storedBodyText);
    verifyEquals(selenium.getValue("theText"), "This is the entire text of the page.");
    verifyEquals(selenium.getExpression(storedBodyText), "This is the entire text of the page.");
  }
}
