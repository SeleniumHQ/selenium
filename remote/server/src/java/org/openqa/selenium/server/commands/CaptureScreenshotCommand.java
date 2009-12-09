package org.openqa.selenium.server.commands;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.RobotRetriever;

import javax.imageio.ImageIO;

import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
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
    
	public String execute() {
        try {
            captureSystemScreenshot();
            return "OK";
        } catch (Exception e) {
            LOGGER.error("Problem capturing screenshot", e);
            return "ERROR: Problem capturing screenshot: " + e.getMessage();
        }
    }

    public void captureSystemScreenshot() throws IOException, InterruptedException, ExecutionException, TimeoutException {
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