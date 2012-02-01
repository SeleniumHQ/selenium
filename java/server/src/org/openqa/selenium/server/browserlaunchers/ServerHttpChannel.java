/*
Copyright 2012 WebDriver committers
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
import com.google.common.io.Closeables;

import com.thoughtworks.selenium.CommandProcessor;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;

public class ServerHttpChannel implements Runnable {

  private final String serverUrl;
  private final String sessionId;
  private final CommandProcessor processor;
  private final ProcessorCommands commands = new ProcessorCommands();
  private int sequenceNumber;
  private URLConnection connection;
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
      send(true, "OK");
      while (carryOn) {
        String raw = read();
        if (carryOn) {
          carryOn = execute(processor, raw);
        }
      }

      send(true, null);
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
      send(true, "OK");
      return true;
    }

    boolean okay = true;
    String value;
    try {
      value = commands.execute(processor, commandName, args);
    } catch (Throwable e) {
      value = e.getMessage();
      okay = false;
    }

    if (value != null) {
      send(okay, value);
    } else {
      send(okay, null);
    }

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

  public void send(boolean okay, String message) throws IOException {
    String fullMessage;
    if (!okay) {
      fullMessage = message;
    } else {
      fullMessage = "OK" + (message == null ? "" : "," + message);
    }

    StringBuilder builder = new StringBuilder(serverUrl)
        .append("&sessionId=").append(sessionId);
    if (sequenceNumber == 0) {
      builder.append("&seleniumStart=true");
    }
    builder.append("&sequenceNumber=").append(sequenceNumber++);
    builder.append("&postedData=").append(encode(fullMessage));

    connection = new URL(builder.toString()).openConnection();

    connection.setDoOutput(true);
    OutputStream out = connection.getOutputStream();
    out.write(fullMessage.getBytes());
    out.flush();
  }

  private String encode(String message) {
    try {
      return URLEncoder.encode(message, Charsets.UTF_8.toString());
    } catch (UnsupportedEncodingException e) {
      throw Throwables.propagate(e);
    }
  }

  public String read() throws IOException {
    InputStream input = connection.getInputStream();
    byte[] bytes = ByteStreams.toByteArray(input);
    Closeables.closeQuietly(input);
    connection = null;
    return new String(bytes, Charsets.UTF_8);
  }
}
