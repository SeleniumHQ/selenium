// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.firefox.internal;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.Socket;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.ExtensionConnection;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.logging.LocalLogs;
import org.openqa.selenium.logging.NeedsLocalLogs;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.internal.CircularOutputStream;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Beta
public class MarionetteConnection implements ExtensionConnection, NeedsLocalLogs {
  private final static int BUFFER_SIZE = 4096;

  private final long connectTimeout;
  private final FirefoxBinary process;
  private final FirefoxProfile profile;
  private final String host;
  private final Lock lock;
  private File profileDir;

  private static Map<String, String> seleniumToMarionetteCommandMap = ImmutableMap.<String, String>builder()
      .put(DriverCommand.GET, "get")
      .put(DriverCommand.GET_ALERT_TEXT, "getTextFromDialog")
      .put(DriverCommand.ACCEPT_ALERT, "acceptDialog")
      .put(DriverCommand.DISMISS_ALERT, "dismissDialog")
      .put(DriverCommand.SET_ALERT_VALUE, "sendKeysToDialog")
      .put(DriverCommand.GET_CURRENT_WINDOW_HANDLE, "getWindow")
      .put(DriverCommand.GET_WINDOW_HANDLES, "getWindows")
      .put(DriverCommand.CLOSE, "closeWindow")
      .put(DriverCommand.GET_CURRENT_URL, "getUrl")
      .put(DriverCommand.FIND_CHILD_ELEMENT, "findElement")
      .put(DriverCommand.FIND_CHILD_ELEMENTS, "findElements")
      .put(DriverCommand.GET_ELEMENT_LOCATION, "getElementPosition")
      .put(DriverCommand.GET_ALL_COOKIES, "getAllCookies")
      .put(DriverCommand.QUIT, "deleteSession")
      .put(DriverCommand.MOVE_TO, "move")
      .put(DriverCommand.MOUSE_DOWN, "press")
      .put(DriverCommand.MOUSE_UP, "release")
      .put(DriverCommand.CLICK, "click")
      .build();

  private Socket socket;
  private OutputStream writer;
  private InputStream reader;

  private String marionetteId;

  private LocalLogs logs = LocalLogs.getNullLogger();

  public MarionetteConnection(Lock lock, FirefoxBinary binary, FirefoxProfile profile,
                              String host) throws Exception {
    this.host = host;
    this.connectTimeout = binary.getTimeout();
    this.lock = lock;
    this.profile = profile;
    this.process = binary;
  }

  @Override
  public void start() throws IOException {
    int port = PortProber.findFreePort();

    profile.setPreference("marionette.defaultPrefs.enabled", true);
    profile.setPreference("marionette.defaultPrefs.port", port);
    profile.setPreference("browser.warnOnQuit", false);

    lock.lock(connectTimeout);
    try {
      profileDir = profile.layoutOnDisk();

      String firefoxLogFile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE);

      if (firefoxLogFile !=  null) {
        if ("/dev/stdout".equals(firefoxLogFile)) {
          process.setOutputWatcher(System.out);
        } else {
          File logFile = new File(firefoxLogFile);
          process.setOutputWatcher(new CircularOutputStream(logFile, BUFFER_SIZE));
        }
      }

      process.startProfile(profile, profileDir, "-foreground", "-marionette");

      // Just for the record; the critical section is all along while firefox is starting with the
      // profile.

      // There is currently no mechanism for the profile to notify us when it has started
      // successfully and is ready for requests. Instead, we must loop until we're able to
      // open a connection with the server, at which point it should be safe to continue
      // (since the extension shouldn't accept connections until it is ready for requests).
      long waitUntil = System.currentTimeMillis() + connectTimeout;
      while (!isConnected()) {
        tryToConnect(host, port);
        if (waitUntil < System.currentTimeMillis()) {
          throw new Error("Can't connect to " + host + ":" + port + "\n" + process.getConsoleOutput());
        }

        try {
          Thread.sleep(100);
        } catch (InterruptedException ignored) {
          // Do nothing
        }
      }
    } catch (IOException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: %n%s",
              process.toString(), port, process.getConsoleOutput()), e);
    } catch (WebDriverException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: %n%s",
              process.toString(), port, process.getConsoleOutput()), e);
    } catch (Exception e) {
      throw new WebDriverException(e);
    } finally {
      lock.unlock();
    }

    // Marionette sends back an initial acknowledgement response upon first
    // connect. We need to read that response before we can proceed.
    String ignored = receiveResponse();

    // This initializes the "actor" for future communication with this instance.
    sendCommand(serializeCommand(new Command(null, "getMarionetteID")));
    String getMarionetteIdRawResponse = receiveResponse();
    System.out.println(getMarionetteIdRawResponse);
    Map<String, Object> map = new JsonToBeanConverter().convert(Map.class,
                                                                getMarionetteIdRawResponse);
    marionetteId = map.get("id").toString();
  }

  private void tryToConnect(String host, int port) {
    try {
      socket = new Socket(host, port);
      writer = socket.getOutputStream();
      reader = socket.getInputStream();
    } catch (ConnectException ex) {
      socket = null;
      writer = null;
      reader = null;
    } catch (IOException ex) {
      socket = null;
      writer = null;
      reader = null;
    }
  }

  @Override
  public Response execute(Command command) throws IOException {
    String commandAsString = serializeCommand(command);
    sendCommand(commandAsString);
    String rawResponse = receiveResponse();

    Map<String, Object> map = new JsonToBeanConverter().convert(Map.class, rawResponse);
    Response response;
    if (DriverCommand.NEW_SESSION.equals(command.getName())) {
      response = new Response(new SessionId(map.get("sessionId").toString()));
      response.setValue(map.get("value"));

    } else {
      response = new JsonToBeanConverter().convert(Response.class, rawResponse);
      if (map.containsKey("error")) {
        response.setValue(map.get("error"));

      } else {
        // ***************************************************************
        // Marionette Compliance Issue: Responses from findElements
        // are returned with raw element IDs as the value.
        // This should be a JSON object with the following structure:
        //
        //   { "ELEMENT": "<element ID goes here>" }
        //
        // This is to allow the client bindings to distinguish between
        // a raw string and an element reference returned from the
        // executeScript command.
        // ***************************************************************
        if (DriverCommand.GET_ACTIVE_ELEMENT.equals(command.getName()))
        {
          if (response.getStatus() == ErrorCodes.SUCCESS) {
            Map<String, Object> wrappedElement = Maps.newHashMap();
            wrappedElement.put("ELEMENT", response.getValue().toString());
            response.setValue(wrappedElement);
          }
        }
      }
    }

    return response;
  }

  private String serializeCommand(Command command) {
    String commandName = command.getName();
    Map<String, Object> params = Maps.newHashMap();
    params.putAll(command.getParameters());

    if (DriverCommand.NEW_SESSION.equals(commandName)) {
      params.remove("desiredCapabilities");

    } else if (DriverCommand.SET_TIMEOUT.equals(commandName)) {
      String timeoutType = (String) params.get("type");
      if ("implicit".equals(timeoutType)) {
        commandName = "setSearchTimeout";
      } else if ("script".equals(timeoutType)) {
        commandName = "setScriptTimeout";
      }
      params.remove("type");

    } else if (DriverCommand.FIND_CHILD_ELEMENT.equals(commandName)
            || DriverCommand.FIND_CHILD_ELEMENTS.equals(commandName)) {
      renameParameter(params, "id", "element");

    } else if (DriverCommand.CLICK.equals(commandName)
            || DriverCommand.DOUBLE_CLICK.equals(commandName)
            || DriverCommand.MOUSE_DOWN.equals(commandName)
            || DriverCommand.MOUSE_UP.equals(commandName)
            || DriverCommand.MOVE_TO.equals(commandName)) {
      String actionName = seleniumToMarionetteCommandMap.containsKey(commandName) ?
                          seleniumToMarionetteCommandMap.get(commandName) : commandName;
      commandName = DriverCommand.ACTION_CHAIN;
      List<Object> action = Lists.newArrayList();
      action.add(actionName);
      if (params.containsKey("element")) {
        action.add(params.get("element"));
        params.remove("element");
      }
      List<Object> actions = Lists.newArrayList();
      actions.add(action);
      params.put("chain", actions);

    } else if (DriverCommand.SET_ALERT_VALUE.equals(commandName)) {
      renameParameter(params, "text", "value");

    } else if (DriverCommand.SWITCH_TO_FRAME.equals(commandName)) {
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1143908
      if (params.get("id") instanceof Map) {
        params.put("element", ((Map<String, Object>) params.get("id")).get("ELEMENT"));
        params.remove("id");
      }
    }

    if (seleniumToMarionetteCommandMap.containsKey(commandName)) {
      commandName = seleniumToMarionetteCommandMap.get(commandName);
    }

    Map<String, Object> map = Maps.newHashMap();
    map.put("to", marionetteId != null ? marionetteId : "root");
    map.put("name", commandName);
    if (command.getSessionId() != null) {
      map.put("sessionId", command.getSessionId().toString());
    }
    map.put("parameters", params);

    return new BeanToJsonConverter().convert(map);
  }

  private void renameParameter(Map<String, Object> params, String origParName, String newParName) {
    Object o = params.get(origParName);
    params.put(newParName, o);
    params.remove(origParName);
  }

  private static final byte[] SEPARATOR = ":".getBytes(Charsets.UTF_8);

  private void sendCommand(String commandAsString) throws IOException {
    byte[] bytes = commandAsString.getBytes(Charsets.UTF_8);
    writer.write(Integer.toString(bytes.length).getBytes(Charsets.UTF_8));
    writer.write(SEPARATOR);
    writer.write(bytes);
    writer.flush();
  }

  private String receiveResponse() throws IOException {
    // read length
    int read;
    int len = 0;
    while ((read = reader.read()) != -1) {
      if (read == ':') {
        // we got the length
        break;
      } else if (Character.isDigit(read)) {
        len = len * 10 + (read - '0');
      } else {
        throw new IOException("Length not found");
      }
    }
    if (read == -1) {
      throw new IOException("end of stream");
    }
    if (len == 0) {
      return "";
    }
    // read json payload
    byte[] bytes = new byte[len];
    int off = 0;
    while (len != 0 && (read = reader.read(bytes, off, len)) != -1) {
      off += read;
      len -= read;
    }
    if (read == -1) {
      throw new IOException("end of stream");
    }
    String response = new String(bytes, Charsets.UTF_8);
    System.out.println("<- |" + response + "|");
    return response;
  }

  @Override
  public void quit() {
    try {
      writer.close();
      reader.close();
      socket.close();
    } catch (IOException e) {
    }
    socket = null;
    // This should only be called after the QUIT command has been sent,
    // so go ahead and clean up our process and profile.
    process.quit();
    if (profileDir != null) {
      profile.clean(profileDir);
    }
  }

  @Override
  public boolean isConnected() {
    return socket != null && socket.isConnected();
  }

  @Override
  public void setLocalLogs(LocalLogs logs) {
    this.logs = logs;
  }
}
