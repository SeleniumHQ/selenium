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
import com.thoughtworks.selenium.Selenium;

import org.junit.Test;

public class TestCssLocators extends InternalSelenseTestBase {
  @Test
  public void testCssLocators() {

    // Unimplemented features:
    // namespace
    // pseudo element
    // ::first-line
    // ::first-letter
    // ::selection
    // ::before
    // ::after
    // pseudo class including:
    // :nth-of-type
    // :nth-last-of-type
    // :first-of-type
    // :last-of-type
    // :only-of-type
    // :visited
    // :hover
    // :active
    // :focus
    // :indeterminate
    //

    selenium.open("../tests/html/test_locators.html");

    boolean isIe = "true".equals(selenium.getEval("browserVersion.isIE;"));

    // css2 selector test

    // universal selector

    verifyTrue(selenium.isElementPresent("css=*"));

    // only element type

    verifyEquals(selenium.getText("css=p"), "this is the first element in the document");

    verifyEquals(selenium.getText("css=a"), "this is the first element");

    // id selector

    verifyEquals(selenium.getText("css=a#id3"), "this is the third element");

    // attribute selector

    verifyTrue(selenium.isElementPresent("css=input[name]"));

    verifyEquals(selenium.getText("css=a[href=\"#id3\"]"), "this is the third element");

    verifyFalse(selenium.isElementPresent("css=span[selenium:foo]"));

    verifyEquals(selenium.getText("css=a[class~=\"class2\"]"), "this is the fifth element");

    verifyEquals(selenium.getText("css=a[lang|=\"en\"]"), "this is the sixth element");

    // class selector

    verifyTrue(selenium.isElementPresent("css=a.a1"));

    // pseudo class selector

    verifyEquals(selenium.getText("css=th:first-child"), "theHeaderText");

    // descendant combinator

    verifyEquals(selenium.getText("css=div#combinatorTest a"), "and grandson");

    // child combinator

    verifyEquals(selenium.getText("css=div#combinatorTest > span"), "this is a child and grandson");

    // preceding combinator

    verifyEquals(selenium.getText("css=span#firstChild + span"), "another child");

    // css3 selector test

    // attribuite test

    verifyEquals(selenium.getText("css=a[name^=\"foo\"]"), "foobar");

    verifyEquals(selenium.getText("css=a[name$=\"foo\"]"), "barfoo");

    verifyEquals(selenium.getText("css=a[name*=\"zoo\"]"), "foozoobar");

    verifyEquals(selenium.getText("css=a[name*=\"name\"][alt]"), "this is the second element");

    // pseudo class test

    verifyEquals(selenium.getText("css=div#structuralPseudo :nth-child(2n)"), "span2");

    verifyEquals(selenium.getText("css=div#structuralPseudo :nth-child(2)"), "span2");

    verifyEquals(selenium.getText("css=div#structuralPseudo :nth-child(-n+6)"), "span1");

    verifyEquals(selenium.getText("css=div#onlyChild span:only-child"), "only child");

    verifyTrue(selenium.isElementPresent("css=span:empty"));

    // TODO(simon): Re-enable this.
    // verifyEquals(selenium.getText("css=div#targetTest span:target"), "target");

    verifyTrue(selenium.isElementPresent("css=input[type=\"text\"]:enabled"));

    verifyTrue(selenium.isElementPresent("css=input[type=\"text\"]:disabled"));

    verifyTrue(selenium.isElementPresent("css=input[type=\"checkbox\"]:checked"));

    verifyEquals(selenium.getText("css=a:contains(\"zoo\")"), "foozoobar");

    verifyEquals(selenium.getText("css=div#structuralPseudo span:not(:first-child)"), "span2");

    // combinator test

    verifyEquals(selenium.getText("css=div#combinatorTest span#firstChild ~ span"), "another child");

    if (!isIe) {
      verifyEquals(selenium.getText("css=div#structuralPseudo :first-child"), "span1");

      verifyEquals(selenium.getText("css=div#structuralPseudo :last-child"), "div4");

      verifyEquals(selenium.getText("css=div#structuralPseudo :not(span):not(:last-child)"), "div1");
    }

    if (isCapableOfAdvancedSelectors(selenium, isIe)) {
      // Versions of firefox prior to 3.5 don't propogate the lang property.
      verifyEquals(selenium.getText("css=a:lang(en)"), "this is the first element");

      verifyEquals(selenium.getText("css=#linkPseudoTest :link"), "link pseudo test");

      verifyTrue(selenium.isElementPresent("css=html:root"));

      verifyEquals(selenium.getText("css=div#structuralPseudo :nth-last-child(4n+1)"), "span4");

      verifyEquals(selenium.getText("css=div#structuralPseudo :nth-last-child(2)"), "div3");

      verifyEquals(selenium.getText("css=div#structuralPseudo :nth-last-child(-n+6)"), "span3");
    }
  }

  private boolean isCapableOfAdvancedSelectors(Selenium selenium, boolean isIe) {
    String isFirefox = selenium.getEval("browserVersion.isFirefox;");

    String version = selenium.getEval("browserVersion.firefoxVersion");

    if (isIe) {
      return false;
    }

    if (Boolean.valueOf(isFirefox)) {
      return version == null || !version.startsWith("3.0");
    }

    return true;
  }
}
