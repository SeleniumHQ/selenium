package org.openqa.selenium.server.commands;

import junit.framework.TestCase;
import org.easymock.classextension.ConstructorArgs;
import static org.easymock.classextension.EasyMock.*;

public class CaptureScreenshotCommandUnitTest extends TestCase {

    public void testExecuteReturnsOKWhencaptureSystemScreenshotSucceeds() throws Exception {
        final CaptureScreenshotCommand command;
        final ConstructorArgs args;

        args = new ConstructorArgs(CaptureScreenshotCommand.class.getConstructor(String.class), "a file name");
        command = createMock(CaptureScreenshotCommand.class,
                             args,
                             CaptureScreenshotCommand.class.getDeclaredMethod("captureSystemScreenshot", String.class));
        command.captureSystemScreenshot("a file name");

        replay(command);
        assertEquals("OK", command.execute());
        verify(command);
    }

    public void testExecuteReturnsAnErrorWhencaptureSystemScreenshotRaise() throws Exception {
        final CaptureScreenshotCommand command;
        final ConstructorArgs args;

        args = new ConstructorArgs(CaptureScreenshotCommand.class.getConstructor(String.class), "a file name");
        command = createMock(CaptureScreenshotCommand.class,
                             args,
                             CaptureScreenshotCommand.class.getDeclaredMethod("captureSystemScreenshot", String.class));
        command.captureSystemScreenshot("a file name");
        expectLastCall().andThrow(new RuntimeException("an error message"));
        replay(command);

        assertEquals("ERROR: Problem capturing screenshot: an error message", command.execute());
        verify(command);
    }


}
