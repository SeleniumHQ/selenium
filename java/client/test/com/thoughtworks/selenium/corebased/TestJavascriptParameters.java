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

public class TestJavascriptParameters extends InternalSelenseTestBase {
  @Test
  public void testJavascriptParameters() {
    selenium.open("../tests/html/test_store_value.html");
    selenium.type("theText", selenium.getEval("[1,2,3,4,5].join(':')"));
    verifyEquals(selenium.getValue("theText"), "1:2:3:4:5");
    selenium.type(selenium.getEval("'the' + 'Text'"), selenium.getEval("10 * 5"));
    verifyEquals(selenium.getValue("theText"), "50");
    verifyEquals(selenium.getValue("theText"), selenium.getEval("10 + 10 + 10 + 10 + 10"));
    // Check a complex expression
    selenium.type("theText", selenium
        .getEval("\n function square(n) {\n return n * n;\n };\n '25 * 25 = ' + square(25);\n "));
    verifyTrue(selenium.getValue("theText").matches("^25 [\\s\\S]* 25 = 625$"));
    // Demonstrate interation between variable substitution and javascript
    String var1 = "the value";
    selenium.type("theText", selenium.getEval("'${var1}'.toUpperCase()"));
    verifyEquals(selenium.getValue("theText"), "${VAR1}");
    selenium.type("theText", selenium.getEval("'" + var1 + "'.toUpperCase()"));
    verifyEquals(selenium.getValue("theText"), "THE VALUE");
    verifyEquals(selenium.getExpression(selenium.getEval("'" + var1 + "'.toUpperCase()")),
        "THE VALUE");
    verifyTrue(Pattern.compile("TH[Ee] VALUE")
        .matcher(selenium.getExpression(selenium.getEval("selenium.getValue('theText')"))).find());
  }
}
