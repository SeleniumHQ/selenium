package org.openqa.selenium.server.commands;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.FrameGroupCommandQueueSet;

import java.util.List;

/**
 * Command delegated "as-is" to Selenium Core.
 */
public class SeleniumCoreCommand extends Command {


    public static final String CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID = "captureEntirePageScreenshot";
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
        final FrameGroupCommandQueueSet queue;
        final String response;

        LOGGER.debug("Executing '" + id + "' selenium core command on session " + sessionId);
        try {
            LOGGER.debug("Session " + sessionId + " going to doCommand(" + id + ','+ values.get(0) + ','+ values.get(1) + ")");
            queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
            response =  queue.doCommand(id, values.get(0), values.get(1));
            LOGGER.debug("Got result: " + response + " on session " + sessionId);
            
            return response;
        } catch (Exception e) {
            LOGGER.error("Exception running '" + id + " 'command on session " + sessionId, e);
            return "ERROR Server Exception: " + e.getMessage();
        }
    }
    
}
