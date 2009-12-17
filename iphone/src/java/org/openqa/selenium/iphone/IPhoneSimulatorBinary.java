//
//  IPhoneSimulatorBinary.java
//  IPhoneSimulatorBinary
//
//  Created by Jason Leyba on 12/10/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

package org.openqa.selenium.iphone;

import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.remote.internal.SubProcess;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

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

  /**
   * System property used to specificy which iPhone SDK to run the
   * iPhone Simulator against. If not specified, will default to
   * {@link #DEFAULT_SDK}.
   */
  private static final String IPHONE_SDK_PROPERTY = "webdriver.iphone.sdk";

  /** The default iPhone SDK to use. */
  private static final String DEFAULT_SDK = "2.2.1";

  private static final String SDK_LOCATION_FORMAT =
      "/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs/iPhoneSimulator%s.sdk";

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
    super(new ProcessBuilder("/bin/bash", createRunScript(iWebDriverApp).getAbsolutePath()));
  }

  private static File createRunScript(File executable) throws IOException {
    File tmp = TemporaryFilesystem.createTempDir("webdriver", "iWebDriver");
    tmp.deleteOnExit();

    File script = File.createTempFile("iWebDriver", "runScript", tmp);
    FileWriter writer = new FileWriter(script);

    String sdkRoot = String.format(SDK_LOCATION_FORMAT,
        System.getProperty(IPHONE_SDK_PROPERTY, DEFAULT_SDK));

    writer.write(new StringBuilder()
        .append("#!/bin/bash\n")
        // We need to make sure iWebDriver and the iPhone Simulator are not running before
        // attempting to restart the app.
        .append("/usr/bin/killall \"iWebDriver\" || :\n")
        .append("/usr/bin/killall \"iPhone Simulator\" || :\n")
        .append(String.format("export DYLD_ROOT_PATH=%s\n", sdkRoot))
        .append(String.format("export IPHONE_SIMULATOR_ROOT=%s\n", sdkRoot))
        .append(String.format("export CFFIXED_USER_HOME=%s\n", tmp.getAbsolutePath()))
        // Be a good citizen; make sure we quit when #shutdown() is called.
        .append("trap \"/usr/bin/killall \\\"iWebDriver\\\" || :;\n")
        .append("       /usr/bin/killall \\\"iPhone Simulator\\\" || :\" SIGINT SIGTERM\n")
        .append(String.format("\"%s\" -RegisterForSystemEvents\n", executable.getAbsolutePath()))
        .toString());
    writer.close();
    return script;
  }
}
