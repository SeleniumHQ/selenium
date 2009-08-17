package org.openqa.selenium.chrome;

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
import org.openqa.selenium.NoSuchElementException;
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
    
    nameToJson.put("getElementAttribute", new JsonCommand("{request: 'getElementAttribute', elementId: ?elementId, attribute: ?attribute}"));
    nameToJson.put("getElementById", new JsonCommand("{request: 'getElement', by: ['id', ?id]}"));
    nameToJson.put("getElementTagName", new JsonCommand("{request: 'getElementTagName', elementId: ?elementId}"));
    nameToJson.put("getElementText", new JsonCommand("{request: 'getElementText', elementId: ?elementId}"));
    nameToJson.put("getElementValue", new JsonCommand("{request: 'getElementValue', elementId: ?elementId}"));
    nameToJson.put("isElementEnabled", new JsonCommand("{request: 'isElementEnabled', elementId: ?elementId}"));
    nameToJson.put("isElementSelected", new JsonCommand("{request: 'isElementSelected', elementId: ?elementId}"));
    nameToJson.put("setElementSelected", new JsonCommand("{request: 'setElementSelected', elementId: ?elementId}"));
    nameToJson.put("submit", new JsonCommand("{request: 'submit', elementId: ?elementId}"));
    
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
    sendCommand(command);
    
    return handleResponse(command);
  }
  
  //TODO(danielwh): Don't use JsonCommand AND Command so interchangeably
  private void sendCommand(Command command) throws IOException {
    Socket socket;
    while ((socket = listeningThread.sockets.poll()) == null) {
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
    String commandStringToSend = commandToPopulate.populate(command.getParameters());
    
    String httpMessage = fillTwoHundredWithJson(commandStringToSend);
    System.err.println("Sending: " + httpMessage);
    socket.getOutputStream().write(httpMessage.getBytes());
    socket.getOutputStream().flush();
    socket.close();
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
    while ((socket = listeningThread.sockets.poll()) == null) {
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
        } else if (value instanceof Integer) {
          return new Response(0, jsonObject.getInt("value"));
        } else if (value instanceof JSONArray) {
          //XXX:(danielwh) Doesn't support nested arrays
          JSONArray jsonArray = (JSONArray)(value);
          Object[] arr = new Object[jsonArray.length()];
          for (int i = 0; i < jsonArray.length(); i++) {
            arr[i] = jsonArray.get(i);
          }
          return new Response(0, arr);
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
        switch (jsonObject.getInt("statusCode")) {
        case 1:
          throw new NoSuchElementException(message);
        }
        throw new WebDriverException("An error occured in the page");
      }
    } catch (JSONException e) {
      throw new RuntimeException(e);
    }
    return null;
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
        for (Socket socket : sockets) {
          try {
            socket.close();
          } catch (SocketException e) {
            //Nothing we can sanely do here
          }
        }
      } catch (Exception e) {
        throw new RuntimeException(e);
      } finally {
        try {
          if (!serverSocket.isClosed()) {
            serverSocket.close();
          }
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      }
    }
  }
  
  private static class JsonCommand {
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

    private String sanitize(String string) {
      return string.replace("\\", "\\\\").replace("\'", "\\\'").replace("\n", "\\n");
    }
  }
}
