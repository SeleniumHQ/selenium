/*
Copyright 2009 Selenium committers

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

package org.openqa.selenium;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.Raster;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

import javax.imageio.ImageIO;

@Ignore(value = {IPHONE})
public class TakesScreenshotTest extends JUnit4TestBase {

  private TakesScreenshot screenshoter;
  private File tempFile = null;

  @Before
  public void setUp() throws Exception {
    assumeTrue(driver instanceof TakesScreenshot);
    screenshoter = (TakesScreenshot) driver;
  }

  @After
  public void tearDown() {
    if (tempFile != null) {
//      // use it locally only to help debugging
//      try {
//        File tmp = File.createTempFile("scr_" + this.testName.getMethodName(), ".png");
//        FileUtils.copyFile(tempFile, tmp);
//        System.out.println("Screenshot image file: " + tmp.getAbsolutePath());
//      } catch (Exception e) {}

      tempFile.delete();
      tempFile = null;
    }
  }

  //
  // TODO(user): test screenshots at guaranteed maximized browsers
  //

  //
  // TODO(user): test screenshots at guaranteed non maximized browsers
  //

  //
  // TODO(user): test screenshots at guaranteed minimized browsers
  //

  //
  // TODO(user): test screenshots at guaranteed fullscreened browsers (WINDOWS platform specific)
  //


  @Test
  public void testSaveScreenshotAsFile() throws Exception {
    driver.get(pages.simpleTestPage);
    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);
  }

  @Test
  public void testCaptureToBase64() throws Exception {
    driver.get(pages.simpleTestPage);
    String screenshot = screenshoter.getScreenshotAs(OutputType.BASE64);
    assertTrue(screenshot.length() > 0);
  }

  @Test
  public void testShouldCaptureScreenshot() throws Exception {
    driver.get(appServer.whereIs("screen/screen.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 5, 5);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  @Ignore(value = {SAFARI, CHROME},
          reason = " SAFARI: take only visible viewport."
                   + " CHROME: (v1) ok, (v2) take only visible viewport."
  )
  public void testShouldCaptureScreenshotWithLongX() throws Exception {
    driver.get(appServer.whereIs("screen/screen_x_long.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 50, 5);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  @Ignore(value = {SAFARI, CHROME},
          reason = " SAFARI: take only visible viewport."
                   + " CHROME: (v1) ok, (v2) take only visible viewport."
  )
  public void testShouldCaptureScreenshotWithLongY() throws Exception {
    driver.get(appServer.whereIs("screen/screen_y_long.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 5, 50);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  @Ignore(value = {IE, FIREFOX, SAFARI},
          reason = "IE9: captured image is cat at driver level. it's not yet supported."
                   + " FF: unable to grab screenshot with too long size (NS_ERROR_FAILURE)."
                   + " SAFARI: take only visible viewport."
                   + " CHROME: (v1) partially black, (v2) take only visible viewport."
                   + ", anothers: untested")
  public void testShouldCaptureScreenshotWithTooLongX() throws Exception {
    driver.get(appServer.whereIs("screen/screen_x_too_long.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 100, 5);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  @Ignore(value = {IE, FIREFOX, SAFARI, CHROME},
          reason = "IE: captured image is cat at driver level. it's not yet supported."
                   + " FF: unable to grab screenshot with too long size (NS_ERROR_FAILURE)."
                   + " SAFARI: take only visible viewport."
                   + " CHROME: (v1) partially black, (v2) take only visible viewport."
                   + ", anothers: untested")
  public void testShouldCaptureScreenshotWithTooLongY() throws Exception {
    driver.get(appServer.whereIs("screen/screen_y_too_long.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 5, 100);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  public void testShouldCaptureScreenshotAtFramePage() throws Exception {
    driver.get(appServer.whereIs("screen/screen_frames.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);
    expectedColors.addAll(getExpectedColors(0xDFDFDF, 1000, 6, 6));

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 5, 5);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  public void testShouldCaptureScreenshotAtIFramePage() throws Exception {
    driver.get(appServer.whereIs("screen/screen_iframes.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);
    expectedColors.addAll(getExpectedColors(0xDFDFDF, 1000, 6, 6));

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 5, 5);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  public void testShouldCaptureScreenshotAtFramePageAfterSwitching() throws Exception {
    driver.get(appServer.whereIs("screen/screen_frames.html"));

    driver.switchTo().frame(driver.findElement(By.id("frame1")));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    System.out.println(tempFile.getAbsolutePath());

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);
    expectedColors.addAll(getExpectedColors(0xDFDFDF, 1000, 6, 6));

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 5, 5);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  public void testShouldCaptureScreenshotAtIFramePageAfterSwitching() throws Exception {
    driver.get(appServer.whereIs("screen/screen_iframes.html"));

    driver.switchTo().frame(driver.findElement(By.id("iframe1")));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);
    expectedColors.addAll(getExpectedColors(0xDFDFDF, 1000, 6, 6));

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 5, 5);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  @Test
  @Ignore(value = {IE, FIREFOX, SAFARI, CHROME},
          reason = "IE9: unable to capture such image due Image initialization failure"
                   + " FF: unable to grab screenshot with too long size (NS_ERROR_FAILURE)."
                   + " SAFARI: take only visible viewport."
                   + " CHROME: (v1) browser oopsed, (v2) untested."
                   + ", anothers: untested")
  public void testShouldCaptureScreenshotWithTooLong() throws Exception {
    //TODO(user): need to understand it's necessary to run volume tests
    //because from my point of view there are not enough memory to init 49*10**8 bytes
    driver.get(appServer.whereIs("screen/screen_too_long.html"));

    tempFile = screenshoter.getScreenshotAs(OutputType.FILE);
    assertTrue(tempFile.exists());
    assertTrue(tempFile.length() > 0);

    BufferedImage screenshot = (BufferedImage) getImage(tempFile);
    assertTrue(screenshot != null);

    Set<String> expectedColors = getExpectedColors(0x0F0F0F, 1000, 6, 6);

    Set<String> actualColors = new HashSet<String>();
    try {
      actualColors = getColors(screenshot, 100, 100);
    } catch (IOException e) {
      fail("Invalid screenshot image");
    }

    compareColors(expectedColors, actualColors);
  }

  private Image getImage(File path)  {
    try {
      InputStream is = new BufferedInputStream(new FileInputStream(path));
      return ImageIO.read(is);
    } catch (FileNotFoundException e) {
      fail("Not existed image screenshot file");
    } catch (IOException e) {
    }
    fail("Invalid image screenshot file");
    return null;
  }

  private Set<String> getExpectedColors(final int initialColor, final int stepColor, final int nX, final int nY) {
    Set<String> colors = new TreeSet<String>();
    int color = 0;
    String hex = "";
    int cnt = 1;
    for (int i = 1; i < nX; i++) {
      for (int j = 1; j < nY; j++) {
        color = initialColor + (cnt * stepColor);
        hex = String.format("#%02x%02x%02x", ((color & 0xFF0000) >> 16), ((color & 0x00FF00) >> 8), ((color & 0x0000FF)));
        colors.add(hex);
        cnt++;
      }
    }

    return colors;
  }

  private Set<String> getColors(BufferedImage image, final int stepX, final int stepY) throws IOException {
    Set<String> colors = new TreeSet<String>();

    int height = image.getHeight();
    int width = image.getWidth();
    assertTrue(width > 0 );
    assertTrue(height > 0 );

    Raster raster = image.getRaster();
    String hex = "";
    int color = 0;
    for (int i = 0; i < width; i = i + stepX) {
      for (int j = 0; j < height; j = j + stepY) {
        hex = String.format("#%02x%02x%02x",
                            (raster.getSample(i, j, 0)),
                            (raster.getSample(i, j, 1)),
                            (raster.getSample(i, j, 2)));
        colors.add(hex);
      }
    }
    return colors;
  }

  private void compareColors(Set<String> expectedColors, Set<String> actualColors) {
    TreeSet<String> c  = new TreeSet<String>(expectedColors);
    c.removeAll(actualColors);
    if (!c.isEmpty()) {
      fail("Unknown expected color is generated: " + c.toString() + ", \n"
           + " actual colors are: " + actualColors.toString());
    }

    if (actualColors.containsAll(expectedColors)) {
      // all is ok
    } else {
      actualColors.removeAll(expectedColors);
      fail("Unknown colors are presented at screenshot: " + actualColors.toString() + " \n"
           + " expected colors are excluded: " + expectedColors.toString());
    }
  }

}
