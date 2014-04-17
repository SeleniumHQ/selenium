/*
Copyright 2007-2010 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.firefox.internal;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.ExtensionConnection;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.firefox.NotConnectedException;
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

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.Reader;
import java.net.ConnectException;
import java.net.Socket;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

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
      .put(DriverCommand.GET, "goUrl")
      .put(DriverCommand.GET_CURRENT_WINDOW_HANDLE, "getWindow")
      .put(DriverCommand.GET_WINDOW_HANDLES, "getWindows")
      .put(DriverCommand.CLOSE, "closeWindow")
      .put(DriverCommand.GET_CURRENT_URL, "getUrl")
      .put(DriverCommand.FIND_CHILD_ELEMENT, "findElement")
      .put(DriverCommand.FIND_CHILD_ELEMENTS, "findElements")
      .put(DriverCommand.GET_ELEMENT_LOCATION, "getElementPosition")
      .put(DriverCommand.GET_ALL_COOKIES, "getAllCookies")
      .put(DriverCommand.QUIT, "deleteSession")
      .build();

  private Socket socket;
  private PrintWriter writer;
  private Reader reader;

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

  public void start() throws IOException {
    int port = PortProber.findFreePort();

    profile.setPreference("marionette.defaultPrefs.enabled", true);
    profile.setPreference("marionette.defaultPrefs.port", port);
    profile.setPreference("browser.warnOnQuit", false);

    lock.lock(connectTimeout);
    try {
      profileDir = profile.layoutOnDisk();

      process.clean(profile, profileDir);

      String firefoxLogFile = System.getProperty("webdriver.firefox.logfile");

      if (firefoxLogFile !=  null) {
        if ("/dev/stdout".equals(firefoxLogFile)) {
          process.setOutputWatcher(System.out);
        } else {
          File logFile = new File(firefoxLogFile);
          process.setOutputWatcher(new CircularOutputStream(logFile, BUFFER_SIZE));
        }
      }

      process.startProfile(profile, profileDir, "-foreground", "-marionette");
      Thread.sleep(5000);

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
      e.printStackTrace();
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), port, process.getConsoleOutput()), e);
    } catch (WebDriverException e) {
      throw new WebDriverException(
          String.format("Failed to connect to binary %s on port %d; process output follows: \n%s",
              process.toString(), port, process.getConsoleOutput()), e);
    } catch (Exception e) {
      throw new WebDriverException(e);
    } finally {
      lock.unlock();
    }

    // Marionette sends back an initial acknowledgement response upon first
    // connect. We need to read that response before we can proceed.
    String rawResponse = receiveResponse();

    // This initializes the "actor" for future communication with this instance.
    sendCommand(serializeCommand(new Command(null, "getMarionetteID")));
    String getMarionetteIdRawResponse = receiveResponse();
    Map<String, Object> map = new JsonToBeanConverter().convert(Map.class,
                                                                getMarionetteIdRawResponse);
    marionetteId = map.get("id").toString();
  }

  private void tryToConnect(String host, int port) {
    try {
      socket = new Socket(host, port);
      writer = new PrintWriter(socket.getOutputStream(), true);
      reader = new InputStreamReader(socket.getInputStream());
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

  public Response execute(Command command) throws IOException {
    String commandAsString = serializeCommand(command);
    sendCommand(commandAsString);
    String rawResponse = receiveResponse();

    Map<String, Object> map = new JsonToBeanConverter().convert(Map.class, rawResponse);
    Response response;
    if (DriverCommand.NEW_SESSION.equals(command.getName())) {
      // If we're starting a new session, we need to return the response
      // with that session.
      // ***************************************************************
      // Marionette Compliance Issue: The response should return the
      // newly created session ID in the "sessionId" member of the
      // returned JSON object.
      // ***************************************************************
      response = new Response(new SessionId(map.get("value").toString()));
      response.setValue(Maps.newHashMap());

    } else {
      if (map.containsKey("error")) {
        // ***************************************************************
        // Marionette Compliance Issue: Error responses should, at a
        // minimum, put the status property at the root of the object.
        // In other words:
        // {
        //   status: 7,
        //   value:
        //   {
        //     message: "Did not find element with id=foo",
        //     stackTrace: <stack trace goes here>
        //   }
        // }
        // ***************************************************************
        response = new Response();
        Map<String, Object> errorMap = (Map<String, Object>) map.get("error");
        if (errorMap != null) {
          response.setStatus(Integer.parseInt(errorMap.get("status").toString()));
          errorMap.remove("status");
          response.setValue(errorMap);
        }

      } else {
        // ***************************************************************
        // Marionette Compliance Issue: Responses from findElement and
        // findElements are returned with raw element IDs as the value.
        // This should be a JSON object with the following structure:
        //
        //   { "ELEMENT": "<element ID goes here>" }
        //
        // This is to allow the client bindings to distinguish between
        // a raw string and an element reference returned from the
        // executeScript command.
        // ***************************************************************
        response = new JsonToBeanConverter().convert(Response.class, rawResponse);

        if (DriverCommand.FIND_ELEMENT.equals(command.getName())
            || DriverCommand.FIND_CHILD_ELEMENT.equals(command.getName())
            || DriverCommand.GET_ACTIVE_ELEMENT.equals(command.getName()))
        {
          if (response.getStatus() == ErrorCodes.SUCCESS) {
            Map<String, Object> wrappedElement = Maps.newHashMap();
            wrappedElement.put("ELEMENT", response.getValue().toString());
            response.setValue(wrappedElement);
          }
        }

        if (DriverCommand.FIND_ELEMENTS.equals(command.getName())
            || DriverCommand.FIND_CHILD_ELEMENTS.equals(command.getName()))
        {
          if (response.getStatus() == ErrorCodes.SUCCESS) {
            List<Object> wrapped = Lists.newArrayList();
            List<Object> elementIds = (List<Object>) response.getValue();
            for (Object elementId: elementIds) {
              Map<String, Object> wrappedElement = Maps.newHashMap();
              wrappedElement.put("ELEMENT", elementId.toString());
              wrapped.add(wrappedElement);
            }
            response.setValue(wrapped);
          }
        }
      }
    }

    return response;
  }

  private String serializeCommand(Command command) {
//    System.out.println("Command " + command);
    String commandName = command.getName();
    Map<String, Object> params = Maps.newHashMap();
    params.putAll(command.getParameters());

    if (DriverCommand.NEW_SESSION.equals(commandName)) {
      params.remove("desiredCapabilities");

    } else if (DriverCommand.GET.equals(commandName)) {
      renameParameter(params, "url", "value");

    } else if (DriverCommand.SET_TIMEOUT.equals(commandName)) {
      String timeoutType = (String) params.get("type");
//      System.out.println("timeout type = " + timeoutType);
      if ("implicit".equals(timeoutType)) {
        commandName = "setSearchTimeout";
      } else if ("script".equals(timeoutType)) {
        commandName = "setScriptTimeout";
      }
      params.remove("type");
      renameParameter(params, "ms", "value");

    } else if (DriverCommand.EXECUTE_SCRIPT.equals(commandName)
            || DriverCommand.EXECUTE_ASYNC_SCRIPT.equals(commandName)) {
      renameParameter(params, "script", "value");

    } else if (DriverCommand.SWITCH_TO_WINDOW.equals(commandName)) {
      renameParameter(params, "name", "value");

    } else if (DriverCommand.SWITCH_TO_FRAME.equals(commandName)) {
      Object target = params.get("id");
      if (target instanceof Map) {
        String elementId = (String) ((Map<String,Object>) target).get("ELEMENT");
        params.put("element", elementId);
        params.remove("id");

      } else {
        renameParameter(params, "id", "value");
      }

    } else if (DriverCommand.FIND_CHILD_ELEMENT.equals(commandName)
            || DriverCommand.FIND_CHILD_ELEMENTS.equals(commandName)
            || DriverCommand.CLICK_ELEMENT.equals(commandName)
            || DriverCommand.CLEAR_ELEMENT.equals(commandName)
            || DriverCommand.GET_ELEMENT_ATTRIBUTE.equals(commandName)
            || DriverCommand.GET_ELEMENT_TEXT.equals(commandName)
            || DriverCommand.SEND_KEYS_TO_ELEMENT.equals(commandName)
            || DriverCommand.IS_ELEMENT_SELECTED.equals(commandName)
            || DriverCommand.IS_ELEMENT_ENABLED.equals(commandName)
            || DriverCommand.IS_ELEMENT_DISPLAYED.equals(commandName)
            || DriverCommand.GET_ELEMENT_SIZE.equals(commandName)
            || DriverCommand.GET_ELEMENT_LOCATION.equals(commandName)
            || DriverCommand.GET_ELEMENT_TAG_NAME.equals(commandName)) {
      renameParameter(params, "id", "element");

    } else if (DriverCommand.CLICK.equals(commandName)
            || DriverCommand.DOUBLE_CLICK.equals(commandName)
            || DriverCommand.MOUSE_DOWN.equals(commandName)
            || DriverCommand.MOUSE_UP.equals(commandName)
            || DriverCommand.MOVE_TO.equals(commandName)) {
      String actionName = commandName;
      commandName = "actionChain";
      List<Object> action = Lists.newArrayList();
      action.add(actionName);
      if (params.containsKey("element")) {
        action.add(params.get("element"));
        params.remove("element");
      }
      List<Object> actions = Lists.newArrayList();
      actions.add(action);
      params.put("chain", actions);
    }

    if (seleniumToMarionetteCommandMap.containsKey(commandName)) {
      commandName = seleniumToMarionetteCommandMap.get(commandName);
    }

    Map<String, Object> map = Maps.newHashMap();
    map.put("to", marionetteId != null ? marionetteId : "root");
    map.put("type", commandName);
    if (command.getSessionId() != null) {
      map.put("session", command.getSessionId().toString());
    }
    map.putAll(params);

    return new BeanToJsonConverter().convert(map);
  }

  private void renameParameter(Map<String, Object> params, String origParName, String newParName) {
    Object o = params.get(origParName);
    params.put(newParName, o);
    params.remove(origParName);
  }

  private void sendCommand(String commandAsString) {
    String line = "" + commandAsString.length() + ":" + commandAsString + " ";
//    System.out.println(line);
    writer.write(line);
    writer.flush();
  }

  private String receiveResponse() throws IOException {
    StringBuilder response = new StringBuilder();

    char[] buf = new char[1024];
    int len = reader.read(buf);
    response.append(buf, 0, len);
    while (len >= 1024) {
      buf = new char[1024];
      len = reader.read(buf);
      response.append(buf, 0, len);
    }

//    System.out.println("<- |" + response.toString() + "|");

    String[] parts = response.toString().split(":", 2);
    int length = Integer.parseInt(parts[0]);
    return parts[1].substring(0, length);
  }

  public void quit() {
    try {
      writer.close();
      reader.close();
      socket.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
    socket = null;
    // This should only be called after the QUIT command has been sent,
    // so go ahead and clean up our process and profile.
    process.quit();
    if (profileDir != null) {
      profile.clean(profileDir);
    }
  }

  public boolean isConnected() {
    return socket != null && socket.isConnected();
  }

  public void setLocalLogs(LocalLogs logs) {
    this.logs = logs;
  }
}
