package org.openqa.selenium.server.commands;

import org.openqa.selenium.server.log.LoggingManager;

/**
 * Retrieve the last N remote control logs.
 */
public class RetrieveLastRemoteControlLogsCommand extends Command {

    public static final String ID = "retrieveLastRemoteControlLogs";

    public String execute() {
        return "OK," + LoggingManager.shortTermMemoryHandler().formattedRecords();
    }

}
