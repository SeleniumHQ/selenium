/*
Copyright 2007-2010 Selenium committers

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

package org.openqa.selenium.iphone;

import java.io.File;
import java.io.FileWriter;

import org.apache.commons.exec.CommandLine;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.Executor;
import org.apache.commons.exec.PumpStreamHandler;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestName;
import org.openqa.selenium.NoDriverAfterTest;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.fail;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 * @author dawagner@gmail.com (Daniel Wagner-Hall)
 */

public class IPhoneSimulatorCommandExecutorTest extends JUnit4TestBase {
  @Rule public TestName name = new TestName();
  
  @NoDriverAfterTest
  @Test
  public void testShouldDetectThatTheIPhoneSimulatorHasUnexpectedlyShutdown() throws Exception {
    if (!(driver instanceof IPhoneSimulatorDriver)) {
      System.out.println(String.format(
          "[%s] Skipping test; requires current driver to be a %s, but instead is a %s",
          name.getMethodName(), IPhoneSimulatorDriver.class.getName(), driver.getClass().getName()));
      return;
    }

    killIphoneSimulatorProcesses();

    try {
      driver.get(pages.simpleTestPage);
      fail("Should have thrown a " +
          IPhoneSimulatorCommandExecutor.IPhoneSimulatorNotRunningException.class.getName());
    } catch (Exception expected) {
      // Do nothing
    }
  }
  
  private void killIphoneSimulatorProcesses() {
    try {
      File scriptFile = File.createTempFile("iWebDriver.kill.", ".script");
      FileWriter writer = new FileWriter(scriptFile);
      writer.write("ps ax | grep 'iPhone Simulator' | grep -v grep | awk '{print $1}' | xargs kill");
      writer.flush();
      writer.close();
      FileHandler.makeExecutable(scriptFile);
      CommandLine killCommandLine = CommandLine.parse(scriptFile.getAbsolutePath());
      Executor executor = new DefaultExecutor();
      executor.setStreamHandler(new PumpStreamHandler(null, null));
      executor.execute(killCommandLine);
      // need to wait for the port to free up
      // TODO same as needs to be done in IPhoneSimulatorBinary
      Thread.sleep(5000);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
