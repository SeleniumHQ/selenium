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

import org.openqa.selenium.server.RobotRetriever;

import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

/**
 * Captures a full screen shot of the current screen using the java.awt.Robot class.
 */
public class CaptureScreenshotCommand extends Command {

  public static final String ID = "captureScreenshot";
  private static final Logger log = Logger.getLogger(CaptureScreenshotCommand.class.getName());

  private final File file;

  public CaptureScreenshotCommand(String fileName) {
    this(new File(fileName));
  }

  CaptureScreenshotCommand(File file) {
    this.file = file;
  }

  private void createNecessaryDirectories() {
    File parentDir = file.getParentFile();
    if (parentDir != null && !parentDir.exists()) {
      parentDir.mkdirs();
    }
  }

  @Override
  public String execute() {
    try {
      captureSystemScreenshot();
      return "OK";
    } catch (Exception e) {
      log.log(Level.SEVERE, "Problem capturing screenshot", e);
      return "ERROR: Problem capturing screenshot: " + e.getMessage();
    }
  }

  public void captureSystemScreenshot() throws IOException, InterruptedException,
      ExecutionException, TimeoutException {
    final BufferedImage bufferedImage;
    final Rectangle captureSize;
    final Robot robot;

    robot = RobotRetriever.getRobot();
    captureSize = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
    bufferedImage = robot.createScreenCapture(captureSize);
    createNecessaryDirectories();
    ImageIO.write(bufferedImage, "png", this.file);
  }


}
