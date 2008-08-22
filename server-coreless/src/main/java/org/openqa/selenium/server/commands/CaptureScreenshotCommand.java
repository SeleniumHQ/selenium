package org.openqa.selenium.server.commands;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.RobotRetriever;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * Captures a full screen shot of the current screen using the java.awt.Robot class.
 */
public class CaptureScreenshotCommand extends Command {

    public static final String ID = "captureScreenshot";
    private static final Log LOGGER = LogFactory.getLog(CaptureScreenshotCommand.class);

    private final String fileName;

    public CaptureScreenshotCommand(String fileName) {
        this.fileName = fileName;
    }

    public String execute() {
        try {
            captureSystemScreenshot(fileName);
            return "OK";
        } catch (Exception e) {
            LOGGER.error("Problem capturing screenshot", e);
            return "ERROR: Problem capturing screenshot: " + e.getMessage();
        }
    }

    private void captureSystemScreenshot(String fileName) throws IOException, InterruptedException, ExecutionException, TimeoutException {
        final BufferedImage bufferedImage;
        final Rectangle captureSize;
        final Robot robot;

        robot = RobotRetriever.getRobot();
        captureSize = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
        bufferedImage = robot.createScreenCapture(captureSize);
        ImageIO.write(bufferedImage, "png", new File(fileName));
    }


}