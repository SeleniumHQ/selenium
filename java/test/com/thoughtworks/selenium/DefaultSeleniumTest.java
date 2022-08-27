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


import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class DefaultSeleniumTest {

  private static final String prefix = "setContext,com.thoughtworks.selenium.DefaultSeleniumTest: ";

  @Test
  public void testBannerSimple() {
    MyCommandProcessor cp = new MyCommandProcessor();
    DefaultSelenium selenium = new DefaultSelenium(cp);
    selenium.showContextualBanner();
    assertEquals(prefix + "test Banner Simple\n", cp.commands.toString());
  }

  @Test
  public void testMoreComplexExample() {
    MyCommandProcessor cp = new MyCommandProcessor();
    DefaultSelenium selenium = new DefaultSelenium(cp);
    selenium.showContextualBanner();
    assertEquals(prefix + "test More Complex Example\n", cp.commands.toString());
  }

  @Test
  public void testEvenMOREComplexExample() {
    MyCommandProcessor cp = new MyCommandProcessor();
    DefaultSelenium selenium = new DefaultSelenium(cp);
    selenium.showContextualBanner();
    assertEquals(prefix + "test Even MORE Complex Example\n", cp.commands.toString());
  }


  private static class MyCommandProcessor implements CommandProcessor {
    StringBuilder commands = new StringBuilder();

    @Override
    public String getRemoteControlServerLocation() {
      return "";
    }

    @Override
    public String doCommand(String command, String[] args) {
      commands.append(command);
      for (int i = 0; i < args.length; i++) {
        String arg = args[i];
        commands.append(",").append(arg);
      }
      commands.append("\n");
      return null;
    }

    @Override
    public void setExtensionJs(String extensionJs) {
    }


    @Override
    public void start() {
    }

    @Override
    public void start(String optionsString) {
    }

    @Override
    public void start(Object optionsObject) {
    }

    @Override
    public void stop() {
    }

    @Override
    public String getString(String string, String[] strings) {
      return null;
    }

    @Override
    public String[] getStringArray(String string, String[] strings) {
      return new String[0];
    }

    @Override
    public Number getNumber(String string, String[] strings) {
      return null;
    }

    @Override
    public Number[] getNumberArray(String string, String[] strings) {
      return new Number[0];
    }

    @Override
    public boolean getBoolean(String string, String[] strings) {
      return false;
    }

    @Override
    public boolean[] getBooleanArray(String string, String[] strings) {
      return new boolean[0];
    }
  }
}
