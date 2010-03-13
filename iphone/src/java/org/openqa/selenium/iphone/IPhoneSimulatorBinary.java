//
//  IPhoneSimulatorBinary.java
//  IPhoneSimulatorBinary
//
//  Created by Jason Leyba on 12/10/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

package org.openqa.selenium.iphone;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.util.logging.Logger;

import com.google.common.annotations.VisibleForTesting;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.remote.internal.CircularOutputStream;
import org.openqa.selenium.remote.internal.SubProcess;

/**
 * Handles launching the iWebDriver app on the iPhone Simulator in a
 * subprocess.
 *
 * <p>Only one instance of the iPhone Simulator may be run at once, so all
 * other instances will be killed before a new one is started.
 *
 * <p>The iPhone Simulator will be run in a headless mode against the SDK
 * specified by the {@code webdriver.iphone.sdk} system property. A temporary
 * directory will be used as the user home so the application need not be
 * pre-installed.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class IPhoneSimulatorBinary extends SubProcess {
  /* TODO: Figure out how to launch iWebDriver on the simulator in a non-headless mode.
   * (Without using the private iPhoneSimulatorRemoteClient.framework)
   */

  private static final Logger LOG = Logger.getLogger(IPhoneSimulatorBinary.class.getName());

  private static final String IPHONE_LOG_FILE_PROPERTY = "webdriver.iphone.logFile";

  /**
   * System property used to specificy which iPhone SDK to run the
   * iPhone Simulator against. If not specified, will default to
   * {@link #DEFAULT_SDK}.
   */
  private static final String IPHONE_SDK_PROPERTY = "webdriver.iphone.sdk";

  /** The default iPhone SDK to use. */
  private static final String DEFAULT_SDK = "3.1.2";

  private static final String SDK_LOCATION_FORMAT =
      "/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator%s.sdk";

  /**
   * Temporary directory used to store all generated iPhone Simulator scripts.
   */
  private static final File SCRIPT_DIRECTORY =
      TemporaryFilesystem.createTempDir("webdriver", "iWebDriver");

  /**
   * Utility script used to kill the iWebDriver process when
   * {@link #shutdown()} is called. This is necessary since
   * {@link Process#destroy()} sends a {@code SIGKILL} to this binary's
   * sub process so we cannot trap it and explicitly kill iWebDriver.
   */
  private final ProcessBuilder killScript;

  /**
   * Creates a new IPhoneSimulatorBinary that will run the given application on
   * the iPhone Simulator. The simulator will be run using the SDK specified by
   * the {@code webdriver.iphone.sdk} system property.
   *
   * @param iWebDriverApp Path to the executable to run on the simulator. This
   *     file should specify the executable that is an immedidate child of the
   *     {@code iwebDriver.app} directory.
   * @throws IOException If an I/O error occurs.
   */
  public IPhoneSimulatorBinary(File iWebDriverApp) throws IOException {
    super(new ProcessBuilder("/bin/bash", createRunScript(iWebDriverApp).getAbsolutePath()),
        createOutputStream());

    File killScriptFile = createKillScript(iWebDriverApp.getName());
    this.killScript = new ProcessBuilder("/bin/bash", killScriptFile.getAbsolutePath());
  }

  private static OutputStream createOutputStream() {
    String logFileString = System.getProperty(IPHONE_LOG_FILE_PROPERTY);
    File logFile = logFileString == null ? null : new File(logFileString);
    return new CircularOutputStream(logFile);
  }

  private static File createRunScript(File executable) throws IOException {
    String sdkRoot = String.format(SDK_LOCATION_FORMAT,
        System.getProperty(IPHONE_SDK_PROPERTY, DEFAULT_SDK));

    String exe = executable.getCanonicalFile().getAbsolutePath();

    String scriptText = new StringBuilder()
        .append("#!/bin/bash\n")
        // TODO: this will fail spectacularly if the iPhone Simulator is running from Xcode. Need to
        // TODO: write an AppleScript to test if Xcode is running the simulator and to make it stop.
        .append("function shutdown() {\n")
        .append("  echo \"killing iWebDriver...\"\n")
        .append("  /usr/bin/killall \"iWebDriver\" || :\n")
        .append("  echo \"killing iPhone Simulator...\"\n")
        .append("  /usr/bin/killall \"iPhone Simulator\" || :\n")
        .append("}\n")
        // We need to make sure iWebDriver and the iPhone Simulator are not running before
        // attempting to restart the app.
        .append("shutdown\n")
        .append(String.format("export DYLD_ROOT_PATH=%s\n", sdkRoot))
        .append(String.format("export IPHONE_SIMULATOR_ROOT=%s\n", sdkRoot))
        .append(String.format("export CFFIXED_USER_HOME=%s\n", SCRIPT_DIRECTORY.getAbsolutePath()))
        // Be a good citizen; make sure we quit when #shutdown() is called.
        .append("trap \"shutdown\" SIGINT SIGTERM\n")
        .append(String.format("\"%s\" -RegisterForSystemEvents &\n", exe))
        .append("iwebdriver_pid=$!\n")
        .append("echo \"Waiting on iWebDriver (pid=$iwebdriver_pid)\"...\n")
        .append("wait $iwebdriver_pid\n")
        .append("echo \"Finished running iWebDriver (pid=$iwebdriver_pid)\"!\n")
        .toString();

    return writeScript(scriptText);
  }

  private static File createKillScript(String appName) throws IOException {
    // TODO: this will fail spectacularly if the iPhone Simulator is running from Xcode. Need to
    // TODO: write an AppleScript to test if Xcode is running the simulator and to make it stop.
    String scriptText = new StringBuilder()
        .append("#!/bin/bash\n")
        .append("echo \"killing ").append(appName).append("...\"\n")
        .append("/usr/bin/killall \"").append(appName).append("\" || :\n")
        .append("echo \"killing iPhone Simulator...\"\n")
        .append("/usr/bin/killall \"iPhone Simulator\" || :\n")
        .toString();
    return writeScript(scriptText);
  }

  private static File writeScript(String scriptText) throws IOException {
    File scriptFile = File.createTempFile("iWebDriver.", ".script", SCRIPT_DIRECTORY);
    LOG.fine(String.format("%s:\n----------------------------------------------\n%s\n\n",
        scriptFile.getAbsolutePath(), scriptText));
    FileWriter writer = new FileWriter(scriptFile);
    writer.write(scriptText);
    writer.flush();
    writer.close();
    return scriptFile.getCanonicalFile();
  }

  @VisibleForTesting ProcessBuilder getKillScript() {
    return killScript;
  }

  /**
   * Kills iWebDriver and the iPhone Simulator.
   *
   * @see SubProcess#shutdown()
   */
  @Override
  public void shutdown() {
    // This will kill iWebDriver, which will in turn terminate our run script.
    try {
      killScript.start().waitFor();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }

    super.shutdown();
  }
}
