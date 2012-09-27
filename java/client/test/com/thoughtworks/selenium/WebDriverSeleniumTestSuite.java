/*
Copyright 2011 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package com.thoughtworks.selenium;

import com.thoughtworks.selenium.corebased.SeleniumMouseTest;
import com.thoughtworks.selenium.corebased.TestAddLocationStrategy;
import com.thoughtworks.selenium.corebased.TestAddSelection;
import com.thoughtworks.selenium.corebased.TestCheckUncheck;
import com.thoughtworks.selenium.corebased.TestClickAt;
import com.thoughtworks.selenium.corebased.TestCommandError;
import com.thoughtworks.selenium.corebased.TestComments;
import com.thoughtworks.selenium.corebased.TestCssLocators;
import com.thoughtworks.selenium.corebased.TestEditable;
import com.thoughtworks.selenium.corebased.TestElementIndex;
import com.thoughtworks.selenium.corebased.TestElementOrder;
import com.thoughtworks.selenium.corebased.TestElementPresent;
import com.thoughtworks.selenium.corebased.TestErrorChecking;
import com.thoughtworks.selenium.corebased.TestEval;
import com.thoughtworks.selenium.corebased.TestFailingAssert;
import com.thoughtworks.selenium.corebased.TestFailingVerifications;
import com.thoughtworks.selenium.corebased.TestFramesClick;
import com.thoughtworks.selenium.corebased.TestFramesOpen;
import com.thoughtworks.selenium.corebased.TestFunkEventHandling;
import com.thoughtworks.selenium.corebased.TestGettingValueOfCheckbox;
import com.thoughtworks.selenium.corebased.TestGoBack;
import com.thoughtworks.selenium.corebased.TestHtmlSource;
import com.thoughtworks.selenium.corebased.TestImplicitLocators;
import com.thoughtworks.selenium.corebased.TestLocators;
import com.thoughtworks.selenium.corebased.TestMultiSelect;
import com.thoughtworks.selenium.corebased.TestOpen;
import com.thoughtworks.selenium.corebased.TestOpenInTargetFrame;
import com.thoughtworks.selenium.corebased.TestPatternMatching;
import com.thoughtworks.selenium.corebased.TestPause;
import com.thoughtworks.selenium.corebased.TestQuickOpen;
import com.thoughtworks.selenium.corebased.TestSelect;
import com.thoughtworks.selenium.corebased.TestType;
import com.thoughtworks.selenium.corebased.TestTypeRichText;
import com.thoughtworks.selenium.corebased.TestVerifications;
import com.thoughtworks.selenium.corebased.TestVisibility;
import com.thoughtworks.selenium.corebased.TestWait;
import com.thoughtworks.selenium.corebased.TestWaitForNot;
import com.thoughtworks.selenium.corebased.TestXPathLocators;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    SeleniumMouseTest.class,
    TestAddLocationStrategy.class,
    TestAddSelection.class,
    TestCheckUncheck.class,
    TestClickAt.class,
    TestCommandError.class,
    TestComments.class,
    TestCssLocators.class,
    TestEditable.class,
    TestElementIndex.class,
    TestElementOrder.class,
    TestElementPresent.class,
    TestErrorChecking.class,
    TestEval.class,
    TestFailingAssert.class,
    TestFailingVerifications.class,
    TestFramesClick.class,
    TestFramesOpen.class,
    TestFunkEventHandling.class,
    TestGoBack.class,
    TestHtmlSource.class,
    TestImplicitLocators.class,
    TestLocators.class,
    TestMultiSelect.class,
    TestOpen.class,
    TestOpenInTargetFrame.class,
    TestPatternMatching.class,
    TestPause.class,
    TestQuickOpen.class,
    TestSelect.class,
    // Only passes in firefox
//    TestSubmit.class,
    TestType.class,
    TestTypeRichText.class,
    TestVerifications.class,
    TestVisibility.class,
    TestWait.class,
    TestWaitForNot.class,
    TestXPathLocators.class,
    TestGettingValueOfCheckbox.class
})
public class WebDriverSeleniumTestSuite extends BaseSuite {
  // Empty
}
