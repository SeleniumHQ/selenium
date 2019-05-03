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

package org.openqa.selenium.server.htmlrunner;


import com.google.common.base.Suppliers;
import com.google.common.collect.ImmutableMap;

import com.thoughtworks.selenium.SeleneseTestBase;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.webdriven.ElementFinder;
import com.thoughtworks.selenium.webdriven.JavascriptLibrary;
import com.thoughtworks.selenium.webdriven.commands.SeleniumSelect;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsDriver;

import java.util.function.Supplier;
import java.util.logging.Logger;

class NonReflectiveSteps {
  private static final Logger LOG = Logger.getLogger("Selenium Core Step");

  private static Supplier<ImmutableMap<String, CoreStepFactory>> STEPS =
    Suppliers.memoize(NonReflectiveSteps::build);

  public ImmutableMap<String, CoreStepFactory> get() {
    return STEPS.get();
  }

  private static ImmutableMap<String, CoreStepFactory> build() {
    ImmutableMap.Builder<String, CoreStepFactory> steps = ImmutableMap.builder();

    CoreStepFactory nextCommandFails = (locator, value) ->
      (selenium, state) -> new NextCommandFails(state.expand(locator));
    steps.put("assertErrorOnNext", nextCommandFails);
    steps.put("assertFailureOnNext", nextCommandFails);

    steps.put("sendKeys", SendKeys::new);

    steps.put(
      "verifyErrorOnNext",
      (locator, value) -> (selenium, state) -> new VerifyNextCommandFails(state.expand(locator)));
    steps.put(
      "verifyFailureOnNext",
      (locator, value) -> (selenium, state) -> new VerifyNextCommandFails(state.expand(locator)));

    class SelectedOption implements CoreStep {

      private final String locator;
      private final String value;
      private final NextStepDecorator onFailure;

      public SelectedOption(String locator, String value, NextStepDecorator onFailure) {
        this.locator = locator;
        this.value = value;
        this.onFailure = onFailure;
      }

      @Override
      public NextStepDecorator execute(Selenium selenium, TestState state) {
        JavascriptLibrary library = new JavascriptLibrary();
        ElementFinder finder = new ElementFinder(library);
        SeleniumSelect select = new SeleniumSelect(
          library,
          finder,
          ((WrapsDriver) selenium).getWrappedDriver(),
          locator);

        WebElement element = select.findOption(value);
        if (element == null) {
          return onFailure;
        }
        return NextStepDecorator.IDENTITY;
      }
    }

    steps.put(
      "assertSelected",
      ((locator, value) -> new SelectedOption(
        locator,
        value,
        NextStepDecorator.ASSERTION_FAILED(value + " not selected"))));
    steps.put(
      "verifySelected",
      ((locator, value) -> new SelectedOption(
        locator,
        value,
        NextStepDecorator.VERIFICATION_FAILED(value + " not selected"))));

    steps.put("echo", ((locator, value) -> (selenium, state) -> {
      LOG.finest(locator);
      return NextStepDecorator.IDENTITY;
    }));

    steps.put("pause", ((locator, value) -> (selenium, state) -> {
      try {
        long timeout = Long.parseLong(state.expand(locator));
        Thread.sleep(timeout);
        return NextStepDecorator.IDENTITY;
      } catch (NumberFormatException e) {
        return NextStepDecorator.ERROR(
          new SeleniumException("Unable to parse timeout: " + state.expand(locator)));
      } catch (InterruptedException e) {
        System.exit(255);
        throw new CoreRunnerError("We never get this far");
      }
    }));

    steps.put("store", (((locator, value) -> ((selenium, state) -> {
      state.store(state.expand(locator), state.expand(value));
      return NextStepDecorator.IDENTITY;
    }))));

    return steps.build();
  }

  private static class NextCommandFails extends NextStepDecorator {
    private final String assertion;

    public NextCommandFails(String assertion) {
      this.assertion = assertion;
    }

    @Override
    public NextStepDecorator evaluate(CoreStep nextStep, Selenium selenium, TestState state) {
      NextStepDecorator actualResult = nextStep.execute(selenium, state);

      Throwable cause = actualResult.getCause();
      if (cause == null) {
        return NextStepDecorator.ASSERTION_FAILED("Expected command to fail");
      }

      if (!(cause instanceof SeleniumException)) {
        return actualResult;
      }

      try {
        SeleneseTestBase.assertEquals(assertion, cause.getMessage());
        return NextStepDecorator.IDENTITY;
      } catch (AssertionError e) {
        return NextStepDecorator.ASSERTION_FAILED(e.getMessage());
      }
    }

    @Override
    public boolean isOkayToContinueTest() {
      return true;
    }
  }

  private static class VerifyNextCommandFails extends NextStepDecorator {
    private final String assertion;

    public VerifyNextCommandFails(String assertion) {
      this.assertion = assertion;
    }

    @Override
    public NextStepDecorator evaluate(CoreStep nextStep, Selenium selenium, TestState state) {
      NextStepDecorator actualResult = nextStep.execute(selenium, state);

      Throwable cause = actualResult.getCause();
      if (cause == null) {
        return NextStepDecorator.VERIFICATION_FAILED("Expected command to fail");
      }

      if (!(cause instanceof SeleniumException)) {
        return actualResult;
      }

      try {
        SeleneseTestBase.assertEquals(assertion, cause.getMessage());
        return NextStepDecorator.IDENTITY;
      } catch (AssertionError e) {
        return NextStepDecorator.VERIFICATION_FAILED(e.getMessage());
      }
    }

    @Override
    public boolean isOkayToContinueTest() {
      return true;
    }
  }

  private static class SendKeys implements CoreStep {

    private final String locator;
    private final String value;

    private SendKeys(String locator, String value) {
      this.locator = locator;
      this.value = value;
    }

    @Override
    public NextStepDecorator execute(Selenium selenium, TestState state) {
      String value = state.expand(this.value);

      value = value.replace("${KEY_ALT}", Keys.ALT);
      value = value.replace("${KEY_CONTROL}", Keys.CONTROL);
      value = value.replace("${KEY_CTRL}", Keys.CONTROL);
      value = value.replace("${KEY_META}", Keys.META);
      value = value.replace("${KEY_COMMAND}", Keys.COMMAND);
      value = value.replace("${KEY_SHIFT}", Keys.SHIFT);

      value = value.replace("${KEY_BACKSPACE}", Keys.BACK_SPACE);
      value = value.replace("${KEY_BKSP}", Keys.BACK_SPACE);
      value = value.replace("${KEY_DELETE}", Keys.DELETE);
      value = value.replace("${KEY_DEL}", Keys.DELETE);
      value = value.replace("${KEY_ENTER}", Keys.ENTER);
      value = value.replace("${KEY_EQUALS}", Keys.EQUALS);
      value = value.replace("${KEY_ESCAPE}", Keys.ESCAPE);
      value = value.replace("${KEY_ESC}", Keys.ESCAPE);
      value = value.replace("${KEY_INSERT}", Keys.INSERT);
      value = value.replace("${KEY_INS}", Keys.INSERT);
      value = value.replace("${KEY_PAUSE}", Keys.PAUSE);
      value = value.replace("${KEY_SEMICOLON}", Keys.SEMICOLON);
      value = value.replace("${KEY_SPACE}", Keys.SPACE);
      value = value.replace("${KEY_TAB}", Keys.TAB);

      value = value.replace("${KEY_LEFT}", Keys.LEFT);
      value = value.replace("${KEY_UP}", Keys.UP);
      value = value.replace("${KEY_RIGHT}", Keys.RIGHT);
      value = value.replace("${KEY_DOWN}", Keys.DOWN);
      value = value.replace("${KEY_PAGE_UP}", Keys.PAGE_UP);
      value = value.replace("${KEY_PGUP}", Keys.PAGE_UP);
      value = value.replace("${KEY_PAGE_DOWN}", Keys.PAGE_DOWN);
      value = value.replace("${KEY_PGDN}", Keys.PAGE_DOWN);
      value = value.replace("${KEY_END}", Keys.END);
      value = value.replace("${KEY_HOME}", Keys.HOME);

      value = value.replace("${KEY_NUMPAD0}", Keys.NUMPAD0);
      value = value.replace("${KEY_N0}", Keys.NUMPAD0);
      value = value.replace("${KEY_NUMPAD1}", Keys.NUMPAD1);
      value = value.replace("${KEY_N1}", Keys.NUMPAD1);
      value = value.replace("${KEY_NUMPAD2}", Keys.NUMPAD2);
      value = value.replace("${KEY_N2}", Keys.NUMPAD2);
      value = value.replace("${KEY_NUMPAD3}", Keys.NUMPAD3);
      value = value.replace("${KEY_N3}", Keys.NUMPAD3);
      value = value.replace("${KEY_NUMPAD4}", Keys.NUMPAD4);
      value = value.replace("${KEY_N4}", Keys.NUMPAD4);
      value = value.replace("${KEY_NUMPAD5}", Keys.NUMPAD5);
      value = value.replace("${KEY_N5}", Keys.NUMPAD5);
      value = value.replace("${KEY_NUMPAD6}", Keys.NUMPAD6);
      value = value.replace("${KEY_N6}", Keys.NUMPAD6);
      value = value.replace("${KEY_NUMPAD7}", Keys.NUMPAD7);
      value = value.replace("${KEY_N7}", Keys.NUMPAD7);
      value = value.replace("${KEY_NUMPAD8}", Keys.NUMPAD8);
      value = value.replace("${KEY_N8}", Keys.NUMPAD8);
      value = value.replace("${KEY_NUMPAD9}", Keys.NUMPAD9);
      value = value.replace("${KEY_N9}", Keys.NUMPAD9);
      value = value.replace("${KEY_ADD}", Keys.ADD);
      value = value.replace("${KEY_NUM_PLUS}", Keys.ADD);
      value = value.replace("${KEY_DECIMAL}", Keys.DECIMAL);
      value = value.replace("${KEY_NUM_PERIOD}", Keys.DECIMAL);
      value = value.replace("${KEY_DIVIDE}", Keys.DIVIDE);
      value = value.replace("${KEY_NUM_DIVISION}", Keys.DIVIDE);
      value = value.replace("${KEY_MULTIPLY}", Keys.MULTIPLY);
      value = value.replace("${KEY_NUM_MULTIPLY}", Keys.MULTIPLY);
      value = value.replace("${KEY_SEPARATOR}", Keys.SEPARATOR);
      value = value.replace("${KEY_SEP}", Keys.SEPARATOR);
      value = value.replace("${KEY_SUBTRACT}", Keys.SUBTRACT);
      value = value.replace("${KEY_NUM_MINUS}", Keys.SUBTRACT);

      value = value.replace("${KEY_F1}", Keys.F1);
      value = value.replace("${KEY_F2}", Keys.F2);
      value = value.replace("${KEY_F3}", Keys.F3);
      value = value.replace("${KEY_F4}", Keys.F4);
      value = value.replace("${KEY_F5}", Keys.F5);
      value = value.replace("${KEY_F6}", Keys.F6);
      value = value.replace("${KEY_F7}", Keys.F7);
      value = value.replace("${KEY_F8}", Keys.F8);
      value = value.replace("${KEY_F9}", Keys.F9);
      value = value.replace("${KEY_F10}", Keys.F10);
      value = value.replace("${KEY_F11}", Keys.F11);
      value = value.replace("${KEY_F12}", Keys.F12);

      selenium.typeKeys(locator, value);

      return NextStepDecorator.IDENTITY;
    }
  }
}
