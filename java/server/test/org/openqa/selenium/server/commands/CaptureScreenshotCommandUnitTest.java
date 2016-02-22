// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


package org.openqa.selenium.server.commands;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import org.junit.After;
import org.junit.Ignore;
import org.junit.Test;

import java.awt.image.BufferedImage;
import java.io.File;

import javax.imageio.ImageIO;

public class CaptureScreenshotCommandUnitTest {

  private CaptureScreenshotCommand command;
  private String fileName = "test_screenshot.png";
  private File file = new File(fileName);
  private String tempDirName = System.getProperty("java.io.tmpdir");

  @Test
  public void testExecuteReturnsOKWhencaptureSystemScreenshotSucceeds() throws Exception {
    command = spy(new CaptureScreenshotCommand("foo"));
    doNothing().when(command).captureSystemScreenshot();

    assertEquals("OK", command.execute());
    verify(command).captureSystemScreenshot();
  }

  @Test
  public void testExecuteReturnsAnErrorWhencaptureSystemScreenshotRaise() throws Exception {
    command = spy(new CaptureScreenshotCommand("foo"));
    doThrow(new RuntimeException("an error message"))
        .when(command)
        .captureSystemScreenshot();

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
