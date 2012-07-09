/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.iphone;

import org.apache.commons.exec.CommandLine;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.Executor;
import org.apache.commons.exec.PumpStreamHandler;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.internal.CircularOutputStream;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Handles launching the iWebDriver app on the iPhone Simulator in a subprocess.
 * 
 * <p>
 * Only one instance of the iPhone Simulator may be run at once, so all other instances will be
 * killed before a new one is started.
 * 
 * <p>
 * The iPhone Simulator will be run against the SDK specified by the {@code webdriver.iphone.sdk}
 * system property. A temporary directory will be used as the user home so the application need not
 * be pre-installed.
 * 
 * @author dawagner@gmail.com (Daniel Wagner-Hall)
 */
public class IPhoneSimulatorBinary {
  private static final String IPHONE_LOG_FILE_PROPERTY = "webdriver.iphone.logFile";

  private final CommandLine commandLine;
  private Integer exitCode = null;

  /**
   * Creates a new IPhoneSimulatorBinary that will run the given application on the iPhone
   * Simulator. The simulator will be run using the SDK specified by the
   * {@code webdriver.iphone.sdk} system property.
   * 
   * @param iWebDriverApp Path to the executable to run on the simulator. This file should specify
   *        the executable that is an immediate child of the {@code iwebDriver.app} directory.
   * @throws IOException If an I/O error occurs.
   */
  public IPhoneSimulatorBinary(File iWebDriverApp) {
	  System.out.println(String.format(
      "%s launch %s", getIphoneSimPath(), iWebDriverApp.getParentFile().getAbsoluteFile()));
    this.commandLine = CommandLine.parse(String.format(
      "%s launch %s", getIphoneSimPath(), iWebDriverApp.getParentFile().getAbsoluteFile()));
  }

  protected static String getIphoneSimPath() {
    String filename = "iphonesim";
    File parentDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("webdriver", "libs");
    try {
      FileHandler.copyResource(parentDir, IPhoneSimulatorBinary.class, filename);
      File file = new File(parentDir, filename);
      FileHandler.makeExecutable(file);
      return file.getAbsolutePath();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }
  
  private static OutputStream createOutputStream() {
    String logFileString = System.getProperty(IPHONE_LOG_FILE_PROPERTY);
    File logFile = logFileString == null ? null : new File(logFileString);
    return new CircularOutputStream(logFile);
  }

  public void launch() {
    Executor executor = new DefaultExecutor();
    executor.setStreamHandler(new PumpStreamHandler(createOutputStream()));
    try {
      exitCode = executor.execute(commandLine);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
  
  public boolean isRunning() {
    return exitCode != null && exitCode == 0;
   }

  public void shutdown() {
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
      getOutputIgnoringExecutor().execute(killCommandLine);
    } catch (Exception ignored) {
    }
    // Wait until the process really quits (nothing is bound to port 3001)
    // TODO something other than Thread.sleep
    // client = new HttpClientFactory().getHttpClient();
    try {
		Thread.sleep(5000);
	} catch (InterruptedException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
    exitCode = null;
  }

  private static Executor getOutputIgnoringExecutor() {
    Executor executor = new DefaultExecutor();
    executor.setStreamHandler(new PumpStreamHandler(null, null));
    return executor;
  }
}
