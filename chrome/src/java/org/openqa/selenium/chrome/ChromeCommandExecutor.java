package org.openqa.selenium.chrome;

import java.awt.Dimension;
import java.awt.Point;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;

public class ChromeCommandExecutor {
  private final ServerSocket serverSocket;
  private volatile boolean listen = false;
  private boolean hadClient = false;
  private boolean hasClient = false;
  ListeningThread listeningThread = new ListeningThread();
  private Map<String, JsonCommand> nameToJson = new HashMap<String, JsonCommand>();
  
  /**
   * Creates a new ChromeCommandExecutor which listens on a TCP port.
   * Doesn't return until the TCP port is connected to.
   * @param port port on which to listen for the initial connection,
   * and dispatch commands
   * @throws IOException if could not bind to port
   */
  public ChromeCommandExecutor(int port) throws IOException {
    nameToJson.put("newSession", new JsonCommand("newSession :?params"));
    nameToJson.put("quit", new JsonCommand("quit"));
    
    nameToJson.put("get", new JsonCommand("{request: 'url', url: ?url}"));
    nameToJson.put("goBack", new JsonCommand("{request: 'goBack'}"));
    nameToJson.put("goForward", new JsonCommand("{request: 'goForward'}"));
    nameToJson.put("refresh", new JsonCommand("{request: 'refresh'}"));
    
    nameToJson.put("addCookie", new JsonCommand("{request: 'addCookie', cookie: ?cookie}"));
    nameToJson.put("getCookies", new JsonCommand("{request: 'getCookies'}"));
    nameToJson.put("deleteAllCookies", new JsonCommand("{request: 'deleteAllCookies'}"));
    nameToJson.put("deleteCookie", new JsonCommand("{request: 'deleteCookie', name: ?name}"));
    
    nameToJson.put("findElement", new JsonCommand("{request: 'getElement', by: [?using, ?value]}"));
    nameToJson.put("findElements", new JsonCommand("{request: 'getElements', by: [?using, ?value]}"));
    nameToJson.put("findChildElement", new JsonCommand("{request: 'getElement', by: [{id: ?element, using: ?using, value: ?value}]}"));
    nameToJson.put("findChildElements", new JsonCommand("{request: 'getElements', by: [{id: ?element, using: ?using, value: ?value}]}"));
    
    nameToJson.put("clearElement", new JsonCommand("{request: 'clearElement', elementId: ?elementId}"));
    nameToJson.put("toggleElement", new JsonCommand("{request: 'toggleElement', elementId: ?elementId}"));
    
    nameToJson.put("getElementAttribute", new JsonCommand("{request: 'getElementAttribute', elementId: ?elementId, attribute: ?attribute}"));
    nameToJson.put("getElementLocation", new JsonCommand("{request: 'getElementLocation', elementId: ?elementId}"));
    nameToJson.put("getElementSize", new JsonCommand("{request: 'getElementSize', elementId: ?elementId}"));
    nameToJson.put("getElementTagName", new JsonCommand("{request: 'getElementTagName', elementId: ?elementId}"));
    nameToJson.put("getElementText", new JsonCommand("{request: 'getElementText', elementId: ?elementId}"));
    nameToJson.put("getElementValue", new JsonCommand("{request: 'getElementValue', elementId: ?elementId}"));
    nameToJson.put("getElementValueOfCssProperty", new JsonCommand("{request: 'getElementValueOfCssProperty', elementId: ?elementId, css: ?property}"));
    nameToJson.put("isElementDisplayed", new JsonCommand("{request: 'isElementDisplayed', elementId: ?elementId}"));
    nameToJson.put("isElementEnabled", new JsonCommand("{request: 'isElementEnabled', elementId: ?elementId}"));
    nameToJson.put("isElementSelected", new JsonCommand("{request: 'isElementSelected', elementId: ?elementId}"));
    nameToJson.put("setElementSelected", new JsonCommand("{request: 'setElementSelected', elementId: ?elementId}"));
    nameToJson.put("submit", new JsonCommand("{request: 'submit', elementId: ?elementId}"));
    
    nameToJson.put("getWindowHandle", new JsonCommand("{request: 'getWindowHandle'}"));
    nameToJson.put("getWindowHandles", new JsonCommand("{request: 'getWindowHandles'}"));
    nameToJson.put("switchToWindow", new JsonCommand("{request: 'switchToWindow', windowName: ?name}"));
    
    nameToJson.put("execute", new JsonCommand("EXECUTE")); //Dealt with specially
    
    nameToJson.put("getCurrentUrl", new JsonCommand("{request: 'getCurrentUrl'}"));
    nameToJson.put("getPageSource", new JsonCommand("{request: 'getPageSource'}"));
    nameToJson.put("getTitle", new JsonCommand("{request: 'getTitle'}"));
    
    serverSocket = new ServerSocket(port);
    listen = true;
    listeningThread.start();
  }
  
  /**
   * 
   * @param command command to execute
   * @return response to command
   * @throws IllegalStateException if no socket was present
   */
  public Response execute(Command command) throws IOException {
    try {
      sendCommand(command);
      return handleResponse(command);
    } catch (Exception e) {
      stopListening();
      if (e instanceof RuntimeException) {
        System.err.println("Rethrowing runtime exception");
        throw (RuntimeException)e;
      } else {
        System.err.println("Wrapping and rethrowing non-runtime exception");
        throw new RuntimeException(e);
      }
    }
  }
  
  //TODO(danielwh): Don't use JsonCommand AND Command so interchangeably
  private void sendCommand(Command command) throws IOException {
    Socket socket;
    //Peek, rather than poll, so that if it all goes horribly wrong,
    //we can just close all sockets in the queue,
    //not having to worry about the current ones
    while ((socket = listeningThread.sockets.peek()) == null) {
      if (hadClient && !hasClient) {
        throw new IllegalStateException("Cannot execute command without a client");
      }
      Thread.yield();
    }
    
    //Respond to GET with a command
    System.out.println("Tried to execute " + command.getCommandName());
    JsonCommand commandToPopulate = 
      nameToJson.get(command.getCommandName());
    if (commandToPopulate == null) {
      throw new UnsupportedOperationException("Didn't know how to execute: " + command);
    }
    
    //Read request
    System.out.println("Reading request");
    BufferedReader reader = new BufferedReader(
        new InputStreamReader(socket.getInputStream()));
    String line;
    while ((line = reader.readLine()) != null && !line.equals("EOF")) {
      System.out.println(line);
    }
    System.out.println("Read request");
    
    System.out.println("Populating");
    String commandStringToSend = commandToPopulate.populate(command.getParameters());
    
    System.out.println("Filling");
    
    String httpMessage = fillTwoHundredWithJson(commandStringToSend);
    System.out.println("Sending: " + httpMessage);
    socket.getOutputStream().write(httpMessage.getBytes());
    System.out.println("Wrote to socket");
    socket.getOutputStream().flush();
    System.out.println("Flushed socket");
    socket.close();
    System.out.println("Closed socket");
    listeningThread.sockets.remove(socket);
    System.out.println("Removed socket from queue");
  }
  
  private String fillTwoHundredWithJson(String message) {
    return fillTwoHundred(message, "application/json; charset=UTF-8");
  }
  
  private String fillTwoHundredWithText(String message) {
    return fillTwoHundred(message, "text/plain; charset=UTF-8");
  }
  
  private String fillTwoHundred(String message, String contentType) {
    String httpMessage = "HTTP/1.1 200 OK" +
    "\r\nContent-Length: " + message.length() + 
    "\r\nContent-Type: " + contentType + 
    "\r\n\r\n" + message; //Bytelength
    return httpMessage;
  }
  
  private Response handleResponse(Command command) throws IOException {
    //Handle POST with the response, send ACK
    Socket socket;
    //Peek, rather than poll, so that if it all goes horribly wrong,
    //we can just close all sockets in the queue,
    //not having to worry about the current ones
    while ((socket = listeningThread.sockets.peek()) == null) {
      Thread.yield();
    }
    BufferedReader reader = new BufferedReader(
        new InputStreamReader(socket.getInputStream()));
    StringBuilder resultBuilder = new StringBuilder();
    String line;
    boolean hasSeenDoubleEOF = false;
    while ((line = reader.readLine()) != null && !line.equals("EOF")) {
      if (hasSeenDoubleEOF) {
        if (resultBuilder.length() > 0) {
          resultBuilder.append("\n");
        }
        resultBuilder.append(line);
      }
      if (line.equals("")) {
        hasSeenDoubleEOF = true;
      }
    }
    System.out.println("Response: " + resultBuilder);
    //TODO(danielwh): Maybe send HTTP
    if (command.getCommandName().equals("quit")) {
      socket.getOutputStream().write(fillTwoHundredWithText("quit").getBytes());
      hasClient = false;
    } else {
      System.out.println("Sending ack");
      socket.getOutputStream().write(fillTwoHundredWithText("ACK").getBytes());
    }
    socket.getOutputStream().flush();
    socket.close();
    listeningThread.sockets.remove(socket);
    
    return parseResponse(resultBuilder.toString());
  }
  
  private Response parseResponse(String rawJsonString) {
    //TODO(danielwh): Parse the response non-reflectively!
    System.err.println("JSON:");
    System.err.println(rawJsonString);
    if (rawJsonString.length() == 0) {
      return new Response(0, null);
    }
    try {
      //{statusCode: 0,value:"XHTML Test Page",class:"org.openqa.selenium.chrome.Response"}
      JSONObject jsonObject = new JSONObject(rawJsonString);
      if (!jsonObject.has("statusCode")) {
        throw new RuntimeException("Response had no status code.  Response was: " + rawJsonString);
      }
      if (jsonObject.getInt("statusCode") == 0) {
        //Parse value
        if (!jsonObject.has("value") || jsonObject.isNull("value")) {
          System.out.println("VALUE WAS NULL");
          return new Response(0, null);
        }
        Object value = jsonObject.get("value");
        if (value instanceof String) {
          return new Response(0, jsonObject.getString("value"));
        } else if (value instanceof Boolean) {
          return new Response(0, jsonObject.getBoolean("value"));
        } else if (value instanceof Number) {
          return new Response(0, jsonObject.getLong("value"));
        } else if (value instanceof JSONArray) {
          //XXX:(danielwh) Doesn't support nested arrays
          JSONArray jsonArray = (JSONArray)(value);
          Object[] arr = new Object[jsonArray.length()];
          for (int i = 0; i < jsonArray.length(); i++) {
            arr[i] = jsonArray.get(i);
          }
          return new Response(0, arr);
        } else if (value instanceof JSONObject) {
          //Should only happen when we return from a javascript execution
          //XXX(danielwh): Doesn't support arrays
          JSONObject object = (JSONObject)value;
          if (!object.has("type")) {
            throw new RuntimeException("Returned a JSONObjet which had no type");
          }
          if ("NULL".equals(object.getString("type"))) {
            return new Response(0, null);
          } else if ("VALUE".equals(object.getString("type"))) {
            Object innerValue = object.get("value");
            if (innerValue instanceof Integer) {
              innerValue = new Long((Integer)innerValue);
            }
            return new Response(0, innerValue);
          } else if ("ELEMENT".equals(object.getString("type"))) {
            //This is somewhat ugly and couples ChromeWebElement and Response
            return new Response(-1, object.get("value"));
          } else if ("POINT".equals(object.getString("type"))) {
            if (!object.has("x") || !object.has("y") ||
                !(object.get("x") instanceof Number) ||
                !(object.get("y") instanceof Number)) {
              throw new RuntimeException("Couldn't construct Point without " +
                  "x and y coordinates");
            }
            return new Response(0, new Point(object.getInt("x"),
                                             object.getInt("y")));
          } else if ("DIMENSION".equals(object.getString("type"))) {
            if (!object.has("width") || !object.has("height") ||
                !(object.get("width") instanceof Number) ||
                !(object.get("height") instanceof Number)) {
              throw new RuntimeException("Couldn't construct Dimension " +
                  "without width and height coordinates");
            }
            return new Response(0, new Dimension(object.getInt("width"),
                                             object.getInt("height")));
          }
        } else {
          System.out.println("CLASS: " + value.getClass());
        }
      } else {
        String message = "";
        if (jsonObject.has("value") &&
            jsonObject.get("value") instanceof JSONObject &&
            jsonObject.getJSONObject("value").has("message") &&
            jsonObject.getJSONObject("value").get("message") instanceof String) {
          message = jsonObject.getJSONObject("value").getString("message");
        }
        //Deal with exceptions
        switch (jsonObject.getInt("statusCode")) {
        case 1:
          throw new NoSuchElementException(message);
        case 2:
          //Cookie error
          throw new WebDriverException(message);
        case 3:
          throw new NoSuchWindowException(message);
        case 4:
          //Bad javascript
          throw new WebDriverException(message);
        case 5:
          throw new ElementNotVisibleException(message);
        case 6: 
          //Invalid element state (e.g. disabled)
          throw new UnsupportedOperationException(message);
        case 7:
          //Unknown command
          throw new UnsupportedOperationException(message); 
        case 8:
          throw new StaleElementReferenceException(message);
        case 500:
          throw new ChromeDriverException("An error occured due to the internals of Chrome. " +
          		"This does not mean your test failed. " +
          		"Try running your test again in isolation.");
        }
        throw new WebDriverException("An error occured in the page");
      }
    } catch (JSONException e) {
      throw new RuntimeException(e);
    }
    return null;
  }
  
  private void closeCurrentSockets() {
    for (Socket socket : listeningThread.sockets) {
      try {
        socket.close();
        System.out.println("Closed queued socket");
      } catch (IOException e) {
        //Nothing we can sanely do here
        System.out.println("Problem closing socket");
      }
    }
  }
  
  public void stopListening() throws IOException {
    System.out.println("Stopping listening");
    listen = false;
    listeningThread.stopListening();
    while (!serverSocket.isClosed()) {
      Thread.yield();
    }
    System.out.println("Stopped listening");
  }

  private class ListeningThread extends Thread {
    //We only ever want one thread listening
    private boolean isListening = false;
    private Queue<Socket> sockets = new ConcurrentLinkedQueue<Socket>();
    @Override
    public void run() {
      if (!isListening) {
        listen();
      }
    }
    public void listen() {
      isListening = true;
      try {
        while (listen) {
          sockets.add(serverSocket.accept());
          hasClient = true;
          hadClient = true;
          System.out.println("Accepted socket");
        }
      } catch (SocketException e) {
        if (listen) {
          throw new RuntimeException(e);
        } else {
          //We are shutting down sockets manually
        }
      } catch (IOException e) {
        isListening = false;
        throw new RuntimeException(e);
      }
    }
    
    public void stopListening() {
      try {
        System.out.println("Thread is closing server socket");
        closeCurrentSockets();
      } catch (Exception e) {
        throw new RuntimeException(e);
      } finally {
        try {
          if (!serverSocket.isClosed()) {
            System.out.println("Closing serverSocket");
            serverSocket.close();
            System.out.println("Closed serverSocket");
          }
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      }
    }
  }
  
  static class JsonCommand {
    private final String json;
    
    JsonCommand(String json) {
      if (json == null) {
        throw new NullPointerException("JSON cannot be null in JsonCommand");
      }
      this.json = json;
    }
    
    /**
     * This is ugly.
     * @param parameters {var:?val, var2: "foo"}
     * Inserts values in order in place of ?val,
     * i.e. looks for ?anything and replaces the ?anything with the variable, in order
     * @return
     * @throws IllegalArgumentException if arguments.length != number of variables
     */
    public String populate(Object... parameters) {
      if (json.equals("EXECUTE")) {
        //{request: 'execute', script: ?script, args: ?args}
        JsonCommand jsonCommand = new JsonCommand("{request: 'execute', script: ?script}");
        String populated = jsonCommand.populate(parameters[0]);
        JSONObject jsonObject;
        try {
          jsonObject = new JSONObject(populated);
        } catch (JSONException e) {
          throw new RuntimeException(e);
        }
        JSONArray args = new JSONArray();
        System.err.println("Filling in args");
        if (parameters.length > 1 && parameters[1].getClass().isArray()) {
          Object[] argumentsFromParameters = (Object[])parameters[1];
          System.out.println("argumentsFromParameters: " + Arrays.toString(argumentsFromParameters));
          for (int i = 0; i < argumentsFromParameters.length; ++i) {
            System.err.println("Putting arg: " + argumentsFromParameters[i]);
            try {
              args.put(wrapArgumentForScriptExecution(argumentsFromParameters[i]));
            } catch (IllegalArgumentException e) {
              System.out.println("CAUGHT IAE");
              throw e;
            }
          }
        }
        System.err.println("Putting args");
        try {
          jsonObject.put("args", args);
        } catch (JSONException e) {
          throw new RuntimeException(e);
        }
        System.err.println("Returning command: " + jsonObject.toString());
        return jsonObject.toString();
      }
      
      List<String> parts = Arrays.asList(json.split(","));
      int i = 0;
      //The output won't be of length json.length, but it's a good indication
      StringBuilder builder = new StringBuilder(json.length());
      Iterator<String> it = parts.iterator();
      while (it.hasNext()) {
        String part = it.next();
        String[] nameAndValue = part.split("\\?");
        builder.append(nameAndValue[0]);
        if (nameAndValue.length == 2) {
          if (i >= parameters.length) {
            throw new IllegalArgumentException(
                "More variables than parameters passed (" + parameters.length +
                ")");
          }
          String value = nameAndValue[1];
          while (value.indexOf(']') > -1 || value.indexOf('}') > -1) {
            if (value.indexOf(']') > -1) {
              value = value.substring(0, value.indexOf(']'));
            }
            if (value.indexOf('}') > -1) {
              value = value.substring(0, value.indexOf('}'));
            }
          }
          //TODO(danielwh): Parse elements
          String parsedParameter;
          if (parameters[i] instanceof ChromeWebElement) {
            parsedParameter = ((ChromeWebElement)parameters[i]).getElementId().replace("element/", "");
          } else if (parameters[i] instanceof Cookie) {
            parsedParameter = new JSONObject(parameters[i]).toString();
          } else if (parameters[i].getClass().isArray()) {
            try {
              parsedParameter = new JSONArray(parameters[i]).toString();
            } catch (JSONException e) {
              throw new RuntimeException(e);
            }
          } else {
            parsedParameter = parameters[i].toString();
          }
          parsedParameter = sanitize(parsedParameter);
          if (parameters[i] instanceof String) {
            parsedParameter = "\'" + parsedParameter + "\'";
          }
          
          i++;
          String restOfValue = nameAndValue[1].substring(value.length());
          builder.append(parsedParameter).append(restOfValue);
        }
        if (it.hasNext()) {
          builder.append(",");
        }
      }
      if (i != parameters.length) {
        throw new IllegalArgumentException("More parameters (" +
            parameters.length + ") than variables ( " + i + ")");
      }
      return builder.toString();
    }

    static JSONObject wrapArgumentForScriptExecution(Object argument) {
      JSONObject wrappedArgument = new JSONObject();
      try {
        if (argument instanceof String) {
          wrappedArgument.put("type", "STRING");
          wrappedArgument.put("value", argument);
        } else if (argument instanceof Boolean) {
          wrappedArgument.put("type", "BOOLEAN");
          wrappedArgument.put("value", argument);
        } else if (argument instanceof Number) {
          wrappedArgument.put("type", "NUMBER");
          wrappedArgument.put("value", argument);
        } else if (argument instanceof ChromeWebElement) {
          wrappedArgument.put("type", "ELEMENT");
          wrappedArgument.put("value", ((ChromeWebElement)argument).getElementId());
        } else {
          System.err.println("COULD NOT WRAP UP PARAM");
          throw new IllegalArgumentException("Could not wrap up " +
                "javascript parameter " + argument +
                "(class: " + argument.getClass() + ")");
        }
      } catch (JSONException e) {
        throw new RuntimeException(e);
      }
      return wrappedArgument;
    }
    
    static String sanitize(String string) {
      return string.replace("\\", "\\\\").replace("\'", "\\\'").replace("\n", "\\n");
    }
  }
}
