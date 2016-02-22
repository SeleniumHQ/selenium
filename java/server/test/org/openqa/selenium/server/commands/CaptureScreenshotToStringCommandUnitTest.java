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
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.spy;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.internal.Base64Encoder;

import java.io.ByteArrayInputStream;

import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;

public class CaptureScreenshotToStringCommandUnitTest {

  private CaptureScreenshotToStringCommand command;

  @Test
  public void testExecuteReturnsOkAndCommaWhenEmptyCaptureAndEncodeSystemScreenshotSucceeds()
      throws Exception {

    command = spy(new CaptureScreenshotToStringCommand());
    doReturn("").when(command).captureAndEncodeSystemScreenshot();

    assertEquals("OK,", command.execute());
  }

  @Test
  public void testExecuteReturnsErrorWhenEmptyCaptureAndEncodeSystemScreenshotThrowsException()
      throws Exception {

    command = spy(new CaptureScreenshotToStringCommand());
    doThrow(new RuntimeException("an error message")).when(command)
        .captureAndEncodeSystemScreenshot();

    assertEquals(
        "ERROR: Problem capturing a screenshot to string: an error message",
        command.execute());
  }

  @Test
  @Ignore
  public void testCapturedScreenshotIsReturnedAsBase64EncodedString()
      throws Exception {
    command = new CaptureScreenshotToStringCommand();
    String returnValue = command.execute();
    String result = returnValue.split(",")[0];
    String image = returnValue.split(",")[1];
    assertEquals("OK", result);
    assertNotNull(ImageIO.read(new MemoryCacheImageInputStream(
        new ByteArrayInputStream(new Base64Encoder().decode(image)))));

  }
}
