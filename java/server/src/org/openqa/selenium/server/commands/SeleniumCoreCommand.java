package org.openqa.selenium.server.commands;

import org.openqa.selenium.server.FrameGroupCommandQueueSet;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Command delegated "as-is" to Selenium Core.
 */
public class SeleniumCoreCommand extends Command {


    public static final String CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID = "captureEntirePageScreenshot";
    private static final Logger log = Logger.getLogger(SeleniumCoreCommand.class.getName());
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

        log.fine("Executing '" + id + "' selenium core command on session " + sessionId);
        try {
            log.fine("Session " + sessionId + " going to doCommand(" + id + ','+ values.get(0) + ','+ values.get(1) + ")");
            queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
            response =  queue.doCommand(id, values.get(0), values.get(1));
            log.fine("Got result: " + response + " on session " + sessionId);
            
            return response;
        } catch (Exception e) {
            log.log(Level.SEVERE, "Exception running '" + id + " 'command on session " + sessionId, e);
            return "ERROR Server Exception: " + e.getMessage();
        }
    }
    
}
