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

package com.thoughtworks.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.Test;

public class DefaultSeleniumStartErrorHandlingTest {

  @Test
  public void testWrapsConnectionRefusedWithUserFriendlyExceptionMessage() {
    final FailOnStartCommandProcessor failOnStartCommandProcessor;

    failOnStartCommandProcessor = new FailOnStartCommandProcessor("Connection refused: connect");

    try {
      new DefaultSelenium(failOnStartCommandProcessor).start();
      fail("Did not catch RuntimeException as expected");
    } catch (RuntimeException expected) {
      assertTrue(-1 != expected.getMessage().indexOf(
          "Could not contact Selenium Server; have you started it on '' ?"));
      assertTrue(-1 != expected.getMessage().indexOf("Connection refused: connect"));
    }
  }

  @Test
  public void testShouldLeaveOtherExceptionAlone() {
    FailOnStartCommandProcessor failOnStartCommandProcessor;
    failOnStartCommandProcessor =
        new FailOnStartCommandProcessor("some crazy unexpected exception");

    try {
      new DefaultSelenium(failOnStartCommandProcessor).start();
      fail("Did not catch RuntimeException as expected");
    } catch (RuntimeException expected) {
      /* Catching RuntimeException as expected */
      assertTrue(expected.getMessage().contains("Could not start Selenium session: "));
      assertTrue(expected.getMessage().contains("some crazy unexpected exception"));
    }
  }

  private static class FailOnStartCommandProcessor implements CommandProcessor {
    private final String message;

    FailOnStartCommandProcessor(String message) {
      this.message = message;
    }

    @Override
    public void setExtensionJs(String extensionJs) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void start() {
      throw new SeleniumException(message);
    }

    @Override
    public void start(String optionsString) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void start(Object optionsObject) {
      throw new UnsupportedOperationException();
    }

    @Override
    public String getRemoteControlServerLocation() {
      return "";
    }

    @Override
    public String doCommand(String command, String[] args) {
      throw new UnsupportedOperationException();
    }

    @Override
    public boolean getBoolean(String string, String[] strings) {
      throw new UnsupportedOperationException();
    }

    @Override
    public boolean[] getBooleanArray(String string, String[] strings) {
      throw new UnsupportedOperationException();
    }

    @Override
    public Number getNumber(String string, String[] strings) {
      throw new UnsupportedOperationException();
    }

    @Override
    public Number[] getNumberArray(String string, String[] strings) {
      throw new UnsupportedOperationException();
    }

    @Override
    public String getString(String string, String[] strings) {
      throw new UnsupportedOperationException();
    }

    @Override
    public String[] getStringArray(String string, String[] strings) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void stop() {
      throw new UnsupportedOperationException();
    }

  }
}
