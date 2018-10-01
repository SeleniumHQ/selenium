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

public class TestPatternMatching extends InternalSelenseTestBase {
  @Test
  public void testPatternMatching() {
    selenium.open("../tests/html/test_verifications.html");
    verifyTrue(selenium.getValue("theText").matches("^[\\s\\S]*text[\\s\\S]*$"));
    verifyTrue(selenium.getValue("theHidden").matches("^[\\s\\S]* hidden value$"));
    verifyTrue(selenium.getText("theSpan").matches("^[\\s\\S]* span$"));
    verifyTrue(selenium.getSelectedLabel("theSelect").matches("^second [\\s\\S]*$"));
    verifyTrue(join(selenium.getSelectOptions("theSelect"), ',').matches(
        "^first[\\s\\S]*,second[\\s\\S]*,third[\\s\\S]*$"));
    verifyTrue(selenium.getAttribute("theText@class").matches("^[\\s\\S]oo$"));
    verifyTrue(selenium.getValue("theTextarea").matches("^Line 1[\\s\\S]*$"));
    verifyTrue(selenium.getValue("theText").matches("^[a-z ]+$"));
    verifyTrue(Pattern.compile("dd").matcher(selenium.getValue("theHidden")).find());
    verifyFalse(Pattern.compile("DD").matcher(selenium.getValue("theHidden")).find());
    verifyEquals(selenium.getValue("theHidden"), "regexpi:DD");
    verifyTrue(Pattern.compile("span$").matcher(selenium.getText("theSpan")).find());
    verifyTrue(Pattern.compile("second .*").matcher(selenium.getSelectedLabel("theSelect")).find());
    verifyTrue(Pattern.compile("^f").matcher(selenium.getAttribute("theText@class")).find());
    verifyTrue(selenium.getValue("theText").matches("^[a-z ]+$"));
    verifyTrue(Pattern.compile("dd").matcher(selenium.getValue("theHidden")).find());
    verifyTrue(Pattern.compile("span$").matcher(selenium.getText("theSpan")).find());
    verifyTrue(Pattern.compile("second .*").matcher(selenium.getSelectedLabel("theSelect")).find());
    verifyTrue(Pattern.compile("^f").matcher(selenium.getAttribute("theText@class")).find());
    verifyEquals(selenium.getValue("theText"), "the text value");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "second option");
    verifyTrue(Pattern.compile("^first.*?,second option,third*")
        .matcher(join(selenium.getSelectOptions("theSelect"), ',')).find());
  }
}
