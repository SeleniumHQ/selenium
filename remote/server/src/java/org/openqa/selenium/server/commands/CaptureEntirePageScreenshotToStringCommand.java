package org.openqa.selenium.server.commands;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.IOHelper;
import org.openqa.selenium.server.browserlaunchers.LauncherUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Capture a screenshot of the in-browser canvas. The entire web page is rendered not
 * just the current viewport.
 *
 * Only works for Firefox in Chrome mode for now.
 *
 * Return a base 64 encoded PNG screenshot of of current page.
 */
public class CaptureEntirePageScreenshotToStringCommand extends Command {

    public static final String ID = "captureEntirePageScreenshotToString";
    private static final Log LOGGER = LogFactory.getLog(CaptureScreenshotToStringCommand.class);
    
    private final String kwargs;
    private final String sessionId;


    public CaptureEntirePageScreenshotToStringCommand(String kwargs, String sessionId) {
        this.kwargs = kwargs;
        this.sessionId = sessionId;
    }

    
    /**
     * Capture a screenshot of the in-browser canvas. The entire web page is rendered not
     * just the current viewport.
     *
     * @return a base 64 encoded PNG screenshot of of current page.
     */
    public String execute() {
        final String filePath;
        final byte[] encodedData;
        InputStream inputStream = null;

        filePath = screenshotFilePath();
        LOGGER.debug("Capturing page screenshot for session " + sessionId + " under '" + filePath + "'");
        capturePageScreenshot(filePath);

        try {
            encodedData = Base64.encodeBase64(IOHelper.readFile(filePath));
            return "OK," + new String(encodedData);
        } catch (IOException e) {
            return "ERROR: " + e;
        } finally {
            IOHelper.close(inputStream);
        }

    }

    public String capturePageScreenshot(String filePath) {
        final SeleniumCoreCommand pageScreenshotCommand;
        final List<String> args;

        args = new ArrayList<String>(2);
        args.add(filePath);
        args.add(kwargs);

        pageScreenshotCommand = new SeleniumCoreCommand(
                SeleniumCoreCommand.CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID, args, sessionId);
        pageScreenshotCommand.execute();

        return null;
    }

    public String screenshotFilePath() {
        final File screenshotDir;

        screenshotDir = screenshotDirectory();
        return screenshotDir + "/page-screenshot-" + sessionId + ".png";
    }


    public File screenshotDirectory() {
        final File screenshotDir;

        screenshotDir = new File(LauncherUtils.customProfileDir(sessionId), "screenshots");
        if (!screenshotDir.exists()) {
            screenshotDir.mkdirs();
        }
        return screenshotDir;
    }

}
