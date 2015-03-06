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

import org.openqa.selenium.server.FrameGroupCommandQueueSet;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Command delegated "as-is" to Selenium Core.
 */
public class SeleniumCoreCommand extends Command {


  public static final String CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID = "captureEntirePageScreenshot";
  public static final String GET_HTML_SOURCE_ID = "getHtmlSource";
  private static final Logger log = Logger.getLogger(SeleniumCoreCommand.class.getName());
  private final String id;
  private final List<String> values;
  private final String sessionId;

  public SeleniumCoreCommand(String id, List<String> values, String sessionId) {
    this.id = id;
    this.values = values;
    this.sessionId = sessionId;
  }

  @Override
  public String execute() {
    final FrameGroupCommandQueueSet queue;
    final String response;

    log.fine("Executing '" + id + "' selenium core command on session " + sessionId);
    try {
      log.fine("Session " + sessionId + " going to doCommand(" + id + ',' + values.get(0) + ',' +
          values.get(1) + ")");
      queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
      response = queue.doCommand(id, values.get(0), values.get(1));
      log.fine("Got result: " + response + " on session " + sessionId);

      return response;
    } catch (Exception e) {
      log.log(Level.SEVERE, "Exception running '" + id + " 'command on session " + sessionId, e);
      return "ERROR Server Exception: " + e.getMessage();
    }
  }

}
