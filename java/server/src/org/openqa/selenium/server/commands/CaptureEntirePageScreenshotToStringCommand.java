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


package org.openqa.selenium.server.commands;

import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.server.IOHelper;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 * Capture a screenshot of the in-browser canvas. The entire web page is rendered not just the
 * current viewport.
 * 
 * Only works for Firefox in Chrome mode for now.
 * 
 * Return a base 64 encoded PNG screenshot of of current page.
 */
public class CaptureEntirePageScreenshotToStringCommand extends Command {

  public static final String ID = "captureEntirePageScreenshotToString";
  private static final Logger log = Logger.getLogger(CaptureScreenshotToStringCommand.class
      .getName());

  private final String kwargs;
  private final String sessionId;


  public CaptureEntirePageScreenshotToStringCommand(String kwargs, String sessionId) {
    this.kwargs = kwargs;
    this.sessionId = sessionId;
  }


  /**
   * Capture a screenshot of the in-browser canvas. The entire web page is rendered not just the
   * current viewport.
   * 
   * @return a base 64 encoded PNG screenshot of of current page.
   */
  @Override
  public String execute() {
    final String filePath;
    InputStream inputStream = null;

    filePath = screenshotFilePath();
    log.fine("Capturing page screenshot for session " + sessionId + " under '" + filePath + "'");
    capturePageScreenshot(filePath);

    try {
      return "OK," + new Base64Encoder().encode(IOHelper.readFile(filePath));
    } catch (IOException e) {
      return "ERROR: " + e;
    } finally {
      IOHelper.close(inputStream);
    }

  }

  public String capturePageScreenshot(String filePath) {
    final SeleniumCoreCommand pageScreenshotCommand;
    final List<String> args;

    args = new ArrayList<String>(2);
    args.add(filePath);
    args.add(kwargs);

    pageScreenshotCommand = new SeleniumCoreCommand(
        SeleniumCoreCommand.CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID, args, sessionId);
    pageScreenshotCommand.execute();

    return null;
  }

  public String screenshotFilePath() {
    final File screenshotDir;

    screenshotDir = screenshotDirectory();
    return screenshotDir + "/page-screenshot-" + sessionId + ".png";
  }


  public File screenshotDirectory() {
    final File screenshotDir;

    screenshotDir = new File(LauncherUtils.customProfileDir(sessionId), "screenshots");
    if (!screenshotDir.exists()) {
      screenshotDir.mkdirs();
    }
    return screenshotDir;
  }

}
