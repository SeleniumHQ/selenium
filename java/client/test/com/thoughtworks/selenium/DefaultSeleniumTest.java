/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class DefaultSeleniumTest {

  private static final String prefix = "setContext,com.thoughtworks.selenium.DefaultSeleniumTest: ";

  @Test
  public void testBannerSimple() throws Throwable {
    MyCommandProcessor cp = new MyCommandProcessor();
    DefaultSelenium selenium = new DefaultSelenium(cp);
    selenium.showContextualBanner();
    assertEquals(prefix + "test Banner Simple\n", cp.commands.toString());
  }

  @Test
  public void testMoreComplexExample() throws Throwable {
    MyCommandProcessor cp = new MyCommandProcessor();
    DefaultSelenium selenium = new DefaultSelenium(cp);
    selenium.showContextualBanner();
    assertEquals(prefix + "test More Complex Example\n", cp.commands.toString());
  }

  @Test
  public void testEvenMOREComplexExample() throws Throwable {
    MyCommandProcessor cp = new MyCommandProcessor();
    DefaultSelenium selenium = new DefaultSelenium(cp);
    selenium.showContextualBanner();
    assertEquals(prefix + "test Even MORE Complex Example\n", cp.commands.toString());
  }


  private static class MyCommandProcessor implements CommandProcessor {
    StringBuilder commands = new StringBuilder();

    public String getRemoteControlServerLocation() {
      return "";
    }

    public String doCommand(String command, String[] args) {
      commands.append(command);
      for (int i = 0; i < args.length; i++) {
        String arg = args[i];
        commands.append(",").append(arg);
      }
      commands.append("\n");
      return null;
    }

    public void setExtensionJs(String extensionJs) {
    }


    public void start() {
    }

    public void start(String optionsString) {
    }

    public void start(Object optionsObject) {
    }

    public void stop() {
    }

    public String getString(String string, String[] strings) {
      return null;
    }

    public String[] getStringArray(String string, String[] strings) {
      return new String[0];
    }

    public Number getNumber(String string, String[] strings) {
      return null;
    }

    public Number[] getNumberArray(String string, String[] strings) {
      return new Number[0];
    }

    public boolean getBoolean(String string, String[] strings) {
      return false;
    }

    public boolean[] getBooleanArray(String string, String[] strings) {
      return new boolean[0];
    }
  }
}
