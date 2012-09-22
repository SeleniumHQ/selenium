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

import org.bouncycastle.util.encoders.Base64;
import org.junit.Ignore;
import org.junit.Test;

import java.io.ByteArrayInputStream;

import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;

import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class CaptureScreenshotToStringCommandUnitTest {

  private CaptureScreenshotToStringCommand command;

  @Test
  public void testDumbJUnit() {
    // this test is needed to make JUnit happy since the rest of the tests are disabled temporarily
  }

  @Test
  @Ignore
  public void testExecuteReturnsOkAndCommaWhenEmptyCaptureAndEncodeSystemScreenshotSucceeds()
      throws Exception {

    command = createMock(CaptureScreenshotToStringCommand.class,
        CaptureScreenshotToStringCommand.class
            .getDeclaredMethod("captureAndEncodeSystemScreenshot"));
    command.captureAndEncodeSystemScreenshot();
    expectLastCall().andReturn("");
    replay(command);
    assertEquals("OK,", command.execute());
    verify(command);
  }

  @Test
  @Ignore
  public void testExecuteReturnsErrorWhenEmptyCaptureAndEncodeSystemScreenshotThrowsException()
      throws Exception {

    command = createMock(CaptureScreenshotToStringCommand.class,
        CaptureScreenshotToStringCommand.class
            .getDeclaredMethod("captureAndEncodeSystemScreenshot"));
    command.captureAndEncodeSystemScreenshot();
    expectLastCall().andThrow(new RuntimeException("an error message"));
    replay(command);

    assertEquals(
        "ERROR: Problem capturing a screenshot to string: an error message",
        command.execute());
    verify(command);
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
        new ByteArrayInputStream(Base64.decode(image)))));

  }
}
