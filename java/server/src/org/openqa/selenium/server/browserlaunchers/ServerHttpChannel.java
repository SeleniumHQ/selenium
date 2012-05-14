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

package org.openqa.selenium.server.browserlaunchers;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.collect.Maps;
import com.google.common.io.ByteStreams;

import com.thoughtworks.selenium.CommandProcessor;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import static com.google.common.io.Closeables.closeQuietly;

public class ServerHttpChannel implements Runnable {
  private final static Logger log = Logger.getLogger(ServerHttpChannel.class.getName());
  
  private final String serverUrl;
  private final String sessionId;
  private final CommandProcessor processor;
  private final ProcessorCommands commands = new ProcessorCommands();
  private int sequenceNumber;
  private HttpURLConnection connection;
  private volatile boolean carryOn = true;

  public ServerHttpChannel(String sessionId, int serverPort,
      CommandProcessor processor) {
    this.sessionId = sessionId;
    this.processor = processor;
    serverUrl = String.format(
        "http://localhost:%d/selenium-server/driver/?localFrameAddress=top&seleniumWindowName=&uniqueId=%s",
        serverPort, UUID.randomUUID());
  }

  public void run() {
    try {
      send("OK," + sessionId, null);
      while (carryOn) {
        String raw = read();

        log.fine("read complete: " + raw);

        if (carryOn) {
          carryOn = execute(processor, raw);
        }
      }

      send("OK", null);
    } catch (ConnectException e) {
      log.warning("Unable to connect to server. Assuming shutdown.");
      // And fall out the bottom of the run method. Don't clean up, just in
      // case.
    } catch (IOException e) {
      Throwables.propagate(e);
    }
  }

  private boolean execute(CommandProcessor processor, String raw)
      throws IOException {
    Map<String, String> command = parse(raw);
    if (command == null) {
      return false;
    }

    String[] args;
    if (command.containsKey("value")) {
      args = new String[2];
      args[0] = command.get("target");
      args[1] = command.get("value");
    } else {
      args = new String[1];
      args[1] = command.get("target");
    }

    String commandName = command.get("command");

    if ("retryLast".equals(commandName)) {
      send("RETRY", "retry=true");
      return true;
    }

    StringBuilder value = new StringBuilder();
    try {
      String result = commands.execute(processor, commandName, args);
      value.append("OK");
      if (result != null) {
        value.append(",").append(result);
      }
    } catch (Throwable e) {
      value.append("ERROR,").append(e.getMessage());
    }

    send(value.toString(), null);

    return true;
  }

  private Map<String, String> parse(String raw) {
    if (!raw.startsWith("json=")) {
      return null;
    }
    try {
      JSONObject converted = new JSONObject(raw.substring("json=".length()));

      Map<String, String> toReturn = Maps.newHashMap();
      Iterator allKeys = converted.keys();

      while (allKeys.hasNext()) {
        String next = (String) allKeys.next();
        toReturn.put(next, converted.getString(next));
      }

      return toReturn;
    } catch (JSONException e) {
      throw Throwables.propagate(e);
    }
  }

  public void kill() {
    carryOn = false;
  }

  public void send(String postedData, String urlParams) throws IOException {
    log.fine("Sending a response: " + postedData);
    
    StringBuilder builder = new StringBuilder(serverUrl).append("&sessionId=").append(sessionId);
    if (sequenceNumber == 0) {
      builder.append("&seleniumStart=true");
    }
    builder.append("&sequenceNumber=").append(sequenceNumber++);
    if (urlParams != null) {
      builder.append("&").append(urlParams);
    }

    StringBuilder response = new StringBuilder("postedData=");
    response.append(postedData);
    
    byte[] toSend = response.toString().getBytes(Charsets.UTF_8);

    connection = (HttpURLConnection) new URL(builder.toString()).openConnection();
    connection.setUseCaches(false);
    connection.setDoOutput(true);
    connection.setRequestMethod("POST");
    connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF8");
    connection.setRequestProperty("Content-Length", String.valueOf(toSend.length));

    OutputStream out = connection.getOutputStream();
    try {
      out.write(toSend);
      out.flush();
    } finally {
      closeQuietly(out);
    }
  }

  public String read() throws IOException {
    InputStream input = connection.getInputStream();
    byte[] bytes = ByteStreams.toByteArray(input);
    closeQuietly(input);
    connection.disconnect();
    connection = null;
    return new String(bytes, Charsets.UTF_8);
  }
}
