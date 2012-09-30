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

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkState;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonException;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * Represents a unique WebSocket connection with the SafariDriver browser
 * extension.
 */
class SafariDriverConnection {
  
  private static final Logger LOG = Logger.getLogger(SafariDriverConnection.class.getName());

  private final WebSocketConnection connection;
  private final BlockingQueue<SafariCommand> commands;
  private final BlockingQueue<Response> responses;

  /**
   * Creates a new connection.
   *
   * @param connection The underlying WebSocket connection.
   */
  public SafariDriverConnection(WebSocketConnection connection) {
    this.connection = connection;
    this.commands = new LinkedBlockingQueue<SafariCommand>();
    this.responses = new LinkedBlockingQueue<Response>();
  }

  /**
   * Sends a command to the SafariDriver.
   *
   * @param command The command to send.
   * @return The commands response.
   * @throws InterruptedException If this thread is interrupted while waiting
   *    for the response.
   */
  public Response send(Command command) throws InterruptedException {
    checkState(commands.peek() == null, "Currently waiting on a command response");

    SafariCommand safariCommand = new SafariCommand(command);
    commands.put(safariCommand);

    String rawJsonCommand = new BeanToJsonConverter().convert(safariCommand);
    try {
      // TODO(jleyba): Introduce proper abstractions for this.
      JSONObject message = new JSONObject()
          .put("origin", "webdriver")
          .put("type", "command")
          .put("command", new JSONObject(rawJsonCommand));
      connection.send(message.toString());
    } catch (JSONException e) {
      throw new JsonException(e);
    }

    return responses.poll(3, TimeUnit.MINUTES);
  }

  /**
   * Handles a message received from the SafariDriver browser extension.
   *
   * @param message The raw message.
   */
  /* package */ void onMessage(String message) {
    SafariCommand command = commands.poll();
    if (command == null) {
      LOG.warning("Was not expecting a response! " + message);
      return;
    }

    Response response;
    try {
      // TODO(jleyba): Introduce proper abstractions here.
      JSONObject jsonResponse = new JSONObject(message);

      response = new JsonToBeanConverter().convert(Response.class,
          jsonResponse.getJSONObject("response").toString());
      if (response.getStatus() == ErrorCodes.SUCCESS) {
        checkArgument(command.getId().equals(jsonResponse.getString("id")),
            "Response ID<%s> does not match command ID<%s>",
            jsonResponse.getString("id"), command.getId());
      }
    } catch (Exception e) {
      response = new Response(command.getSessionId());
      response.setStatus(new ErrorCodes().toStatusCode(e));
      response.setValue(new WebDriverException("Invalid response", e));
    }

    if (!responses.offer(response)) {
      LOG.warning("Unable to offer response");
    }
  }

  /**
   * Extends the standard Command object to include an ID field. Used to
   * synchronize messages with the SafariDriver browser extension.
   */
  private static class SafariCommand extends Command {

    private final UUID id;

    private SafariCommand(Command command) {
      super(command.getSessionId(), command.getName(), command.getParameters());
      this.id = UUID.randomUUID();
    }

    public String getId() {
      return id.toString();
    }
  }
}
