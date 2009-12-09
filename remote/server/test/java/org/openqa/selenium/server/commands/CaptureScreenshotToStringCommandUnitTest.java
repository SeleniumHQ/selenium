package org.openqa.selenium.server.commands;

import junit.framework.TestCase;
import org.bouncycastle.util.encoders.Base64;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;

import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;
import java.io.ByteArrayInputStream;

public class CaptureScreenshotToStringCommandUnitTest extends TestCase {

	private CaptureScreenshotToStringCommand command;

    public void testDumbJUnit() {
        // this test is needed to make JUnit happy since the rest of the tests are disabled temporarily
    }
    
    public void disabled_testExecuteReturnsOkAndCommaWhenEmptyCaptureAndEncodeSystemScreenshotSucceeds()
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

	public void disabled_testExecuteReturnsErrorWhenEmptyCaptureAndEncodeSystemScreenshotThrowsException()
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

	public void disabled_testCapturedScreenshotIsReturnedAsBase64EncodedString()
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
