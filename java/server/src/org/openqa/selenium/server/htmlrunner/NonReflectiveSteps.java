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


import com.google.common.base.Supplier;
import com.google.common.base.Suppliers;
import com.google.common.collect.ImmutableMap;

import com.thoughtworks.selenium.SeleneseTestBase;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.webdriven.ElementFinder;
import com.thoughtworks.selenium.webdriven.JavascriptLibrary;
import com.thoughtworks.selenium.webdriven.commands.SeleniumSelect;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.WrapsDriver;

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
      LOG.info(locator);
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
}
