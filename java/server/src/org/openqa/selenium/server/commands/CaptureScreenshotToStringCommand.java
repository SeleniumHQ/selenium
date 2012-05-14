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

import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.server.RobotRetriever;

import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

/**
 * Captures a full screen shot of the current screen using the java.awt.Robot class. and returns it
 * as a base 64 encoded PNG image.
 */
public class CaptureScreenshotToStringCommand {

  public static final String ID = "captureScreenshotToString";
  private static final Logger log = Logger.getLogger(CaptureScreenshotToStringCommand.class
      .getName());


  public String execute() {
    try {
      return "OK," + captureAndEncodeSystemScreenshot();
    } catch (Exception e) {
      log.log(Level.SEVERE, "Problem capturing a screenshot to string", e);
      return "ERROR: Problem capturing a screenshot to string: " + e.getMessage();
    }
  }


  public String captureAndEncodeSystemScreenshot() throws InterruptedException, ExecutionException,
      TimeoutException, IOException {
    final ByteArrayOutputStream outStream;
    final BufferedImage bufferedImage;
    final Rectangle captureSize;
    final byte[] encodedData;
    final Robot robot;

    robot = RobotRetriever.getRobot();
    captureSize = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
    bufferedImage = robot.createScreenCapture(captureSize);
    outStream = new ByteArrayOutputStream();
    ImageIO.write(bufferedImage, "png", outStream);

    return new Base64Encoder().encode(outStream.toByteArray());
  }
}
