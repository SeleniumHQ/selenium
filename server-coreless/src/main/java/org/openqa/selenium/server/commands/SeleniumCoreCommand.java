package org.openqa.selenium.server.commands;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.FrameGroupCommandQueueSet;

import java.util.List;

/**
 * Command delegated "as-is" to Selenium Core.
 */
public class SeleniumCoreCommand extends Command {


    public static final String CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID = "captureEntirePageScreenshotToString";
    private static final Log LOGGER = LogFactory.getLog(SeleniumCoreCommand.class);
    private final String id;
    private final List<String> values;
    private final String sessionId;

    public SeleniumCoreCommand(String id, List<String> values, String sessionId) {
        this.id = id;
        this.values = values;
        this.sessionId = sessionId;
    }

    public String execute() {
        String results;
        try {
            FrameGroupCommandQueueSet queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
            LOGGER.debug("Session "+sessionId+" going to doCommand("+ id +','+values.get(0)+','+values.get(1) + ")");
            results = queue.doCommand(id, values.get(0), values.get(1));
        } catch (Exception e) {
            LOGGER.error("Exception running command", e);
            results = "ERROR Server Exception: " + e.getMessage();
        }
        return results;
    }
    
}
