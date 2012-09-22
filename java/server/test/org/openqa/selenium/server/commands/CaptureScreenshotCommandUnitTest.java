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

import org.easymock.classextension.ConstructorArgs;
import org.junit.After;
import org.junit.Ignore;
import org.junit.Test;

import java.awt.image.BufferedImage;
import java.io.File;

import javax.imageio.ImageIO;

import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class CaptureScreenshotCommandUnitTest {

  private CaptureScreenshotCommand command;
  private String fileName = "test_screenshot.png";
  private File file = new File(fileName);
  private String tempDirName = System.getProperty("java.io.tmpdir");

  @Test
  public void testDumbJUnit() {
    // this test is needed to make JUnit happy since the rest of the tests are disabled temporarily
  }

  @Test
  @Ignore
  public void testExecuteReturnsOKWhencaptureSystemScreenshotSucceeds() throws Exception {
    final ConstructorArgs args;

    args =
        new ConstructorArgs(CaptureScreenshotCommand.class.getConstructor(String.class), fileName);
    command = createMock(CaptureScreenshotCommand.class,
        args,
        CaptureScreenshotCommand.class.getDeclaredMethod("captureSystemScreenshot"));
    command.captureSystemScreenshot();

    replay(command);
    assertEquals("OK", command.execute());
    verify(command);
  }

  @Test
  @Ignore
  public void testExecuteReturnsAnErrorWhencaptureSystemScreenshotRaise() throws Exception {

    final ConstructorArgs args;

    args =
        new ConstructorArgs(CaptureScreenshotCommand.class.getConstructor(String.class), fileName);
    command = createMock(CaptureScreenshotCommand.class,
        args,
        CaptureScreenshotCommand.class.getDeclaredMethod("captureSystemScreenshot"));
    command.captureSystemScreenshot();
    expectLastCall().andThrow(new RuntimeException("an error message"));
    replay(command);

    assertEquals("ERROR: Problem capturing screenshot: an error message", command.execute());
    verify(command);
  }

  // TODO: Mock File, Robot and ImageIO.write to reduce execution time
  @Test
  @Ignore
  public void testTakingScreenshotToSingleFileNameCreatesScreenshotInWorkingDirectory()
      throws Exception {
    command = new CaptureScreenshotCommand(file);
    assertEquals("OK", command.execute());
    assertTrue(file.exists());
  }

  @Test
  @Ignore
  public void testTakingScreenshotToAbsolutePathWithExistingComponentsCreatesScreenshot()
      throws Exception {
    file = new File(tempDirName + File.separator + fileName);
    command = new CaptureScreenshotCommand(file);
    assertEquals("OK", command.execute());
    assertTrue(file.exists());
  }

  @Test
  @Ignore
  public void testTakingScreenshotToAbsolutePathWithPartiallyExistingComponentsCreatesNecessaryDirectories()
      throws Exception {
    file = new File(tempDirName + File.separator + "toBeCreated" + File.separator + fileName);
    command = new CaptureScreenshotCommand(file);
    assertEquals("OK", command.execute());
    assertTrue(file.exists());
  }

  @Test
  @Ignore
  public void testScreenshotIsValidImage() throws Exception {
    testTakingScreenshotToSingleFileNameCreatesScreenshotInWorkingDirectory();
    BufferedImage image = ImageIO.read(file);
    assertNotNull(image);
  }

  @After
  public void tearDown() {
    if (file.exists()) {
      file.delete();
    }
    if (file.getParentFile() != null && file.getParentFile().exists()) {
      file.getParentFile().delete();
    }
  }
}
