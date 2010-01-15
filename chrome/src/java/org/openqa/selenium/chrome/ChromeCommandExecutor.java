package org.openqa.selenium.chrome;

import com.google.common.collect.ImmutableMap;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.XPathLookupException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import static org.openqa.selenium.remote.DriverCommand.*;

import java.awt.Dimension;
import java.awt.Point;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

public class ChromeCommandExecutor {
  private static final String[] ELEMENT_ID_ARG = new String[] {"elementId"};
  private static final String[] NO_ARGS = new String[] {};

  private final int port;
  //Whether the listening thread should listen
  private volatile boolean listen = false;
  ListeningThread listeningThread;
  private Map<DriverCommand, String[]> commands;
  
  /**
   * Creates a new ChromeCommandExecutor which listens on a free TCP port.
   * Doesn't return until the TCP port is connected to.
   * @throws WebDriverException if could not bind to any port
   */
  public ChromeCommandExecutor() {
    this(0);
  }

  /**
   * Creates a new ChromeCommandExecutor which listens on the passed TCP port.
   * Doesn't return until the TCP port is connected to.
   * @param port port on which to listen for the initial connection,
   * and dispatch commands
   * @throws WebDriverException if could not bind to port
   */
  public ChromeCommandExecutor(int port) {
    this.port = port;
    commands = ImmutableMap.<DriverCommand, String[]> builder()
        .put(CLOSE, NO_ARGS)
        .put(QUIT, NO_ARGS)
        .put(GET, new String[] {"url"})
        .put(GO_BACK, NO_ARGS)
        .put(GO_FORWARD, NO_ARGS)
        .put(REFRESH, NO_ARGS)
        .put(ADD_COOKIE, new String[] {"cookie"})
        .put(GET_ALL_COOKIES,  NO_ARGS)
        .put(GET_COOKIE, new String[] {"name"})
        .put(DELETE_ALL_COOKIES, NO_ARGS)
        .put(DELETE_COOKIE, new String[] {"name"})
        .put(FIND_ELEMENT, new String[] {"using", "value"})
        .put(FIND_ELEMENTS, new String[] {"using", "value"})
        .put(FIND_CHILD_ELEMENT, new String[] {"id", "using", "value"})
        .put(FIND_CHILD_ELEMENTS, new String[] {"id", "using", "value"})
        .put(CLEAR_ELEMENT, ELEMENT_ID_ARG)
        .put(CLICK_ELEMENT, ELEMENT_ID_ARG)
        .put(HOVER_OVER_ELEMENT, ELEMENT_ID_ARG)
        .put(SEND_KEYS_TO_ELEMENT, new String[] {"elementId", "keys"})
        .put(SUBMIT_ELEMENT, ELEMENT_ID_ARG)
        .put(TOGGLE_ELEMENT, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_ATTRIBUTE, new String[] {"elementId", "attribute"})
        .put(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_LOCATION, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_SIZE, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_TAG_NAME, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_TEXT, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_VALUE, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
             new String[] {"elementId", "css"})
        .put(IS_ELEMENT_DISPLAYED, ELEMENT_ID_ARG)
        .put(IS_ELEMENT_ENABLED, ELEMENT_ID_ARG)
        .put(IS_ELEMENT_SELECTED, ELEMENT_ID_ARG)
        .put(SET_ELEMENT_SELECTED, ELEMENT_ID_ARG)
        .put(GET_ACTIVE_ELEMENT, NO_ARGS)
        .put(SWITCH_TO_FRAME_BY_INDEX, new String[] {"index"})
        .put(SWITCH_TO_FRAME_BY_NAME, new String[] {"name"})
        .put(SWITCH_TO_DEFAULT_CONTENT, NO_ARGS)
        .put(GET_CURRENT_WINDOW_HANDLE, NO_ARGS)
        .put(GET_WINDOW_HANDLES, NO_ARGS)
        .put(SWITCH_TO_WINDOW, new String[] {"windowName"})
        .put(GET_CURRENT_URL, NO_ARGS)
        .put(GET_PAGE_SOURCE, NO_ARGS)
        .put(GET_TITLE, NO_ARGS)
        .put(EXECUTE_SCRIPT, new String[] {"script", "args"})
        .put(SCREENSHOT, NO_ARGS)
        .build();
  }

  /**
   * Returns whether an instance of Chrome is currently connected
   * @return whether an instance of Chrome is currently connected
   */
  boolean hasClient() {
    return listeningThread != null && listeningThread.hasClient && !listeningThread.sockets.isEmpty();
  }
  
  /**
   * Returns the port being listened on
   * @return the port being listened on
   */
  public int getPort() {
    return listeningThread == null ? -1 : listeningThread.serverSocket.getLocalPort();
  }
  
  /**
   * Executes the passed command
   * @param command command to execute
   * @return response to command
   * @throws IllegalStateException if no socket was present
   */
  public ChromeResponse execute(Command command) throws IOException {
    sendCommand(command);
    return handleResponse(command);
  }
  
  /**
   * Sends the passed command to the Chrome extension on the
   * longest-time accepted socket.  Removes the socket from the queue when done
   * @param command command to send
   * @throws IOException if couldn't write command to socket
   */
  private void sendCommand(Command command) throws IOException {
    if (!hasClient()) {
      throw new IllegalStateException("Cannot execute command without a client");
    }

    //Respond to request with the command
    String commandStringToSend = fillArgs(command);
    byte[] data = fillTwoHundredWithJson(commandStringToSend);

    Socket socket = getOldestSocket();
    try {
      socket.getOutputStream().write(data);
      socket.getOutputStream().flush();
    } finally {
      socket.close();
      listeningThread.sockets.remove(socket);
    }
  }
  
  String fillArgs(Command command) {
    String[] parameterNames = commands.get(command.getName());
    JSONObject json = new JSONObject();
    if (parameterNames.length != command.getParameters().length) {
      throw new WebDriverException(new IllegalArgumentException(
          "Did not supply the expected number of parameters"));
    }
    try {
      json.put("request", command.getName());
      for (int i = 0; i < parameterNames.length; ++i) {
        //Icky icky special case
        // TODO(jleyba): This is a temporary solution and will be going away _very_
        // soon.
        boolean isArgs = (EXECUTE_SCRIPT.equals(command.getName()) &&
            "args".equals(parameterNames[i]));
        json.put(parameterNames[i], convertToJsonObject(command.getParameters()[i], isArgs));
      }
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }
    return json.toString();
  }
  
  Object convertToJsonObject(Object object, boolean wrapArgs) throws JSONException {
    if (object.getClass().isArray()) {
      JSONArray array = new JSONArray();
      for (Object o : (Object[])object) {
        if (wrapArgs) {
          array.put(wrapArgumentForScriptExecution(o));
        } else {
          array.put(o);
        }
      }
      return array;
    }
    else if (object instanceof Cookie) {
      Cookie cookie = (Cookie)object;
      Map<String, Object> cookieMap = new HashMap<String, Object>();
      cookieMap.put("name", cookie.getName());
      cookieMap.put("value", cookie.getValue());
      cookieMap.put("domain", cookie.getDomain());
      cookieMap.put("path", cookie.getPath());
      cookieMap.put("secure", cookie.isSecure());
      cookieMap.put("expiry", cookie.getExpiry());
      return new JSONObject(cookieMap);
    } else if (object instanceof ChromeWebElement) {
      return ((ChromeWebElement)object).getElementId();
    } else {
      return object;
    }
  }

  /**
   * Wraps the passed message up in an HTTP 200 response, with the Content-type
   * header set to application/json
   * @param message message to wrap up as the response
   * @return The passed message, wrapped up in an HTTP 200 response,
   * encoded in UTF-8
   */
  private byte[] fillTwoHundredWithJson(String message) {
    return fillTwoHundred(message, "application/json; charset=UTF-8");
  }

  /**
   * Fills in an HTTP 200 response with the passed message and content type.
   * @param message Response
   * @param contentType HTTP Content-type header
   * @return The HTTP 200 message encoded in UTF-8 as an array of bytes
   */
  private byte[] fillTwoHundred(String message, String contentType) {
    try {
      String httpMessage = "HTTP/1.1 200 OK" +
      "\r\nContent-Length: " + message.getBytes("UTF-8").length + 
      "\r\nContent-Type: " + contentType + 
      "\r\n\r\n" + message;
      return httpMessage.getBytes("UTF-8");
    } catch (UnsupportedEncodingException e) {
      //Should never happen - Java ships with UTF-8
      throw new WebDriverException("Your environment doesn't support UTF-8");
    }
  }

  /**
   * Listens for the response to a command on the oldest socket in the queue
   * and parses it.
   * Expects the response to be an HTTP request, which ends in the line:
   * EOResponse
   * Responds by sending a 200 response containing QUIT
   * @param command command we are expecting a response to
   * @return response to the command.
   * @throws IOException if there are errors with the socket being used
   */
  private ChromeResponse handleResponse(Command command) throws IOException {
    Socket socket = getOldestSocket();
    StringBuilder resultBuilder = new StringBuilder();
    BufferedReader reader = new BufferedReader(
        new InputStreamReader(socket.getInputStream()));
    String line;
    boolean hasSeenDoubleCRLF = false; //Whether we are out of headers yet
    while ((line = reader.readLine()) != null && !line.equals("EOResponse")) {
      if (hasSeenDoubleCRLF) {
        if (resultBuilder.length() > 0) {
          //Out of headers, and not the first line, so append a newline
          resultBuilder.append("\n");
        }
        resultBuilder.append(line);
      }
      if (line.equals("")) {
        hasSeenDoubleCRLF = true;
      }
    }
    return parseResponse(resultBuilder.toString());
  }

  private Socket getOldestSocket() {
    Socket socket;
    // Peek, rather than poll, so that if it all goes horribly wrong, we can
    // just close all sockets in the queue, not having to worry about the
    // current ones.
    while ((socket = listeningThread.sockets.peek()) == null) {
      Thread.yield();
    }
    return socket;
  }

  /**
   * Parses a raw json string into a response.
   * @param rawJsonString JSON string encapsulating the response.
   * @return the parsed response.
   */
  private ChromeResponse parseResponse(String rawJsonString) {
    if (rawJsonString.length() == 0) {
      return new ChromeResponse(0, null);
    }
    System.out.println("RJS: " + rawJsonString);
    if ("\"QUIT\"".equals(rawJsonString)) {
      //Ugly hack...
      listeningThread.closeCurrentSockets();
      return new ChromeResponse(0, null);
    }
    try {
      JSONObject jsonObject = new JSONObject(rawJsonString);
      if (!jsonObject.has("statusCode")) {
        throw new WebDriverException("Response had no status code.  Response was: " + rawJsonString);
      }
      if (jsonObject.getInt("statusCode") == 0) {
        //Success! Parse value
        if (!jsonObject.has("value") || jsonObject.isNull("value")) {
          return new ChromeResponse(0, null);
        }
        Object value = jsonObject.get("value");
        Object parsedValue = parseJsonToObject(value);
        if (parsedValue instanceof ChromeWebElement) {
          return new ChromeResponse(-1, ((ChromeWebElement)parsedValue).getElementId());
        } else {
          return new ChromeResponse(0, parsedValue);
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
        //Error codes are loosely based on native exception codes,
        //see common/src/cpp/webdriver-interactions/errorcodes.h
        case 2:
          //Cookie error
          throw new WebDriverException(message);
        case 3:
          throw new NoSuchWindowException(message);
        case 7:
          throw new NoSuchElementException(message);
        case 8:
          throw new NoSuchFrameException(message);
        case 9:
          //Unknown command
          throw new UnsupportedOperationException(message); 
        case 10:
          throw new StaleElementReferenceException(message);
        case 11:
          throw new ElementNotVisibleException(message);
        case 12: 
          //Invalid element state (e.g. disabled)
          throw new UnsupportedOperationException(message);
        case 13:
          //Unhandled error
          throw new WebDriverException(message);
        case 17:
          //Bad javascript
          throw new WebDriverException(message);
        case 19:
          //Bad xpath
          throw new XPathLookupException(message);
        case 99:
          throw new WebDriverException("An error occured when sending a native event");
        case 500:
          if (message.equals("")) {
            message = "An error occured due to the internals of Chrome. " +
            "This does not mean your test failed. " +
            "Try running your test again in isolation.";
          }
          throw new FatalChromeException(message);
        }
        throw new WebDriverException("An error occured in the page");
      }
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }
  }
  
  private Object parseJsonToObject(Object value) throws JSONException {
    if (value instanceof String) {
      return value;
    } else if (value instanceof Boolean) {
      return value;
    } else if (value instanceof Number) {
      //We return all numbers as longs
      return ((Number)value).longValue();
    } else if (value instanceof JSONArray) {
      JSONArray jsonArray = (JSONArray)(value);
      List<Object> arr = new ArrayList<Object>(jsonArray.length());
      for (int i = 0; i < jsonArray.length(); i++) {
        arr.add(parseJsonToObject(jsonArray.get(i)));
      }
      return arr;
    } else if (value instanceof JSONObject) {
      //Should only happen when we return from a javascript execution.
      //Assumes the object is of the form {type: some_type, value: some_value}
      JSONObject object = (JSONObject)value;
      if (!object.has("type")) {
        throw new WebDriverException("Returned a JSONObjet which had no type");
      }
      if ("NULL".equals(object.getString("type"))) {
        return null;
      } else if ("VALUE".equals(object.getString("type"))) {
        Object innerValue = object.get("value");
        if (innerValue instanceof Integer) {
          innerValue = new Long((Integer)innerValue);
        }
        return innerValue;
      } else if ("ELEMENT".equals(object.getString("type"))) {
        return new ChromeWebElement(null, (String)object.get("value"));
      } else if ("POINT".equals(object.getString("type"))) {
        if (!object.has("x") || !object.has("y") ||
            !(object.get("x") instanceof Number) ||
            !(object.get("y") instanceof Number)) {
          throw new WebDriverException("Couldn't construct Point without " +
              "x and y coordinates");
        }
        return new Point(object.getInt("x"),
                         object.getInt("y"));
      } else if ("DIMENSION".equals(object.getString("type"))) {
        if (!object.has("width") || !object.has("height") ||
            !(object.get("width") instanceof Number) ||
            !(object.get("height") instanceof Number)) {
          throw new WebDriverException("Couldn't construct Dimension " +
              "without width and height");
        }
        return new Dimension(object.getInt("width"),
                             object.getInt("height"));
      } else if ("COOKIE".equals(object.getString("type"))) {
        if (!object.has("name") || !object.has("value")) {
          throw new WebDriverException("Couldn't construct Cookie " +
              "without name and value");
        }
        return new Cookie(object.getString("name"), object.getString("value"));
      }
    } else {
      throw new WebDriverException("Didn't know how to deal with " +
          "response value of type: " + value.getClass());
    }
    return null;
  }

  /**
   * Starts listening for new socket connections from Chrome. Does not return
   * until the TCP port is connected to.
   */
  public void startListening() {
    ServerSocket serverSocket;
    try {
      serverSocket = new ServerSocket(port);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
    listen = true;
    listeningThread = new ListeningThread(serverSocket);
    listeningThread.start();
  }

  /**
   * Stops listening from for new sockets from Chrome
   */
  public void stopListening() {
    listen = false;
    if (listeningThread != null) {
      listeningThread.stopListening();
      listeningThread = null;
    }
  }

  /**
   * Thread which, when spawned, accepts all sockets on its ServerSocket and
   * queues them up
   */
  private class ListeningThread extends Thread {
    private boolean isListening = false;
    private Queue<Socket> sockets = new ConcurrentLinkedQueue<Socket>();
    private ServerSocket serverSocket;
    private volatile boolean hasClient = false;

    public ListeningThread(ServerSocket serverSocket) {
      this.serverSocket = serverSocket;
    }

    @Override
    public void run() {
      if (!isListening) {
        listen();
      }
    }
    public void listen() {
      isListening = true;
      try {
        while (listen && !serverSocket.isClosed()) {
          Socket acceptedSocket = serverSocket.accept();
          int r = acceptedSocket.getInputStream().read();
          if (r != 'G') {
            //Not a GET.
            //Use browser sending a GET to sniff the URL we need to talk to,
            //so we ignore any GET requests, but queue up any others,
            //which we assume to be POSTs from the extension
            sockets.add(acceptedSocket);
            hasClient = true;
          } else {
            //The browser, rather than extension, is visiting the page
            //Because the extension always uses POST
            //Serve up a holding page and ignore the socket
            respondWithHoldingPage(acceptedSocket);
          }
        }
      } catch (SocketException e) {
        //We are shutting down sockets manually
      } catch (IOException e) {
        isListening = false;
        throw new WebDriverException(e);
      }
    }
    
    private void respondWithHoldingPage(Socket acceptedSocket) throws IOException {
      //We offer a reload to work around http://crbug.com/11547 on Mac
      acceptedSocket.getOutputStream().write(
          fillTwoHundred(
          "<html><head><script type='text/javascript'>if (window.location.search == '') { setTimeout(\"window.location = window.location.href + '?reloaded'\", 5000); }</script></head><body><p>ChromeDriver server started and connected.  Please leave this tab open.</p></body></html>",
          "Content-Type: text/html"));
      acceptedSocket.getOutputStream().flush();
      acceptedSocket.close();
    }

    public void stopListening() {
      try {
        closeCurrentSockets();
      } catch (Exception e) {
        throw new WebDriverException(e);
      } finally {
        try {
          if (!serverSocket.isClosed()) {
            serverSocket.close();
            while (!serverSocket.isClosed()) {
              Thread.yield();
            }
          }
        } catch (Exception e) {
          throw new WebDriverException(e);
        }
      }
    }

    private void closeCurrentSockets() {
      for (Socket socket : sockets) {
        try {
          socket.close();
          sockets.remove(socket);
        } catch (IOException e) {
          //Nothing we can sanely do here
        }
      }
    }
  }
  
  /**
   * Wraps up values as {type: some_type, value: some_value} objects
   * @param argument value to wrap up
   * @return wrapped up value; will be either a JSONObject or a JSONArray.
   * TODO(jleyba): Remove this
   */
  Object wrapArgumentForScriptExecution(Object argument) {
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
      } else if (argument instanceof Collection<?>) {
        JSONArray array = new JSONArray();
        for (Object o : (Collection<?>)argument) {
          array.put(wrapArgumentForScriptExecution(o));
        }
        return array;
      } else {
        throw new IllegalArgumentException("Could not wrap up " +
              "javascript parameter " + argument +
              "(class: " + argument.getClass() + ")");
      }
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }
    return wrappedArgument;
  }
}
