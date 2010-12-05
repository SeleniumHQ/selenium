package org.openqa.selenium.chrome;

import static org.openqa.selenium.remote.DriverCommand.ADD_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.CLEAR_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLICK_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.CLOSE;
import static org.openqa.selenium.remote.DriverCommand.DELETE_ALL_COOKIES;
import static org.openqa.selenium.remote.DriverCommand.DELETE_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_ASYNC_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.EXECUTE_SCRIPT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_CHILD_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENTS;
import static org.openqa.selenium.remote.DriverCommand.GET;
import static org.openqa.selenium.remote.DriverCommand.GET_ACTIVE_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.GET_ALL_COOKIES;
import static org.openqa.selenium.remote.DriverCommand.GET_COOKIE;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_URL;
import static org.openqa.selenium.remote.DriverCommand.GET_CURRENT_WINDOW_HANDLE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_ATTRIBUTE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_SIZE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TAG_NAME;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_TEXT;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_VALUE;
import static org.openqa.selenium.remote.DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY;
import static org.openqa.selenium.remote.DriverCommand.GET_PAGE_SOURCE;
import static org.openqa.selenium.remote.DriverCommand.GET_TITLE;
import static org.openqa.selenium.remote.DriverCommand.GET_WINDOW_HANDLES;
import static org.openqa.selenium.remote.DriverCommand.GO_BACK;
import static org.openqa.selenium.remote.DriverCommand.GO_FORWARD;
import static org.openqa.selenium.remote.DriverCommand.HOVER_OVER_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.IMPLICITLY_WAIT;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_DISPLAYED;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_ENABLED;
import static org.openqa.selenium.remote.DriverCommand.IS_ELEMENT_SELECTED;
import static org.openqa.selenium.remote.DriverCommand.QUIT;
import static org.openqa.selenium.remote.DriverCommand.REFRESH;
import static org.openqa.selenium.remote.DriverCommand.SCREENSHOT;
import static org.openqa.selenium.remote.DriverCommand.SEND_KEYS_TO_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SET_ELEMENT_SELECTED;
import static org.openqa.selenium.remote.DriverCommand.SET_SCRIPT_TIMEOUT;
import static org.openqa.selenium.remote.DriverCommand.SUBMIT_ELEMENT;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_FRAME;
import static org.openqa.selenium.remote.DriverCommand.SWITCH_TO_WINDOW;
import static org.openqa.selenium.remote.DriverCommand.TOGGLE_ELEMENT;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.internal.SocketLock;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;

import com.google.common.collect.ImmutableMap;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.BindException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ChromeCommandExecutor implements CommandExecutor {

  private static final Logger LOG = Logger.getLogger(ChromeCommandExecutor.class.getName());
  private static final long DEFAULT_TIMEOUT = TimeUnit.SECONDS.toMicros(120);

  private static final int MAX_START_RETRIES = 5;
  private static final String[] ELEMENT_ID_ARG = new String[] {"id"};
  private static final String[] NO_ARGS = new String[] {};

  private ChromeBinary binary;
  private long timeout = DEFAULT_TIMEOUT;

  //Whether the listening thread should listen
  private volatile boolean listen = false;
  ListeningThread listeningThread;
  private Map<String, String[]> commands;
  
  /**
   * Creates a new ChromeCommandExecutor which listens on a free TCP port.
   * Doesn't return until the TCP port is connected to.
   *
   * @param binary The binary to use when {@link #start() starting} a new Chrome
   *     instance.
   */
  public ChromeCommandExecutor(ChromeBinary binary) {
    this.binary = binary;
    this.commands = ImmutableMap.<String, String[]> builder()
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
        .put(SEND_KEYS_TO_ELEMENT, new String[] {"id", "value"})
        .put(SUBMIT_ELEMENT, ELEMENT_ID_ARG)
        .put(TOGGLE_ELEMENT, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_ATTRIBUTE, new String[] {"id", "name"})
        .put(GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_LOCATION, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_SIZE, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_TAG_NAME, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_TEXT, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_VALUE, ELEMENT_ID_ARG)
        .put(GET_ELEMENT_VALUE_OF_CSS_PROPERTY, new String[] {"id", "propertyName"})
        .put(IS_ELEMENT_DISPLAYED, ELEMENT_ID_ARG)
        .put(IS_ELEMENT_ENABLED, ELEMENT_ID_ARG)
        .put(IS_ELEMENT_SELECTED, ELEMENT_ID_ARG)
        .put(SET_ELEMENT_SELECTED, ELEMENT_ID_ARG)
        .put(GET_ACTIVE_ELEMENT, NO_ARGS)
        .put(SWITCH_TO_FRAME, new String[] {"id"})
        .put(GET_CURRENT_WINDOW_HANDLE, NO_ARGS)
        .put(GET_WINDOW_HANDLES, NO_ARGS)
        .put(SWITCH_TO_WINDOW, new String[] {"name"})
        .put(GET_CURRENT_URL, NO_ARGS)
        .put(GET_PAGE_SOURCE, NO_ARGS)
        .put(GET_TITLE, NO_ARGS)
        .put(EXECUTE_SCRIPT, new String[] {"script", "args"})
        .put(EXECUTE_ASYNC_SCRIPT, new String[] {"script", "args"})
        .put(SCREENSHOT, NO_ARGS)
        .put(IMPLICITLY_WAIT, new String[] {"ms"})
        .put(SET_SCRIPT_TIMEOUT, new String[] {"ms"})
        .build();
  }

  public ChromeBinary getBinary() {
    return binary;
  }

  /**
   * @return Whether an instance of Chrome is currently connected.
   */
  boolean hasClient() {
    return listeningThread != null && listeningThread.hasClient;
  }
  
  /**
   * @return the port being listened on.
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
  public Response execute(Command command) throws IOException {
    // Chrome doesn't support sessions yet, so just send a canned response.
    if (DriverCommand.NEW_SESSION.equals(command.getName())) {
      return createCannedNewSessionResponse();
    } else {
      sendCommand(command);
      return handleResponse();
    }
  }

  /**
   * Creates a canned response for
   * {@link DriverCommand#NEW_SESSION NEW_SESSION} commands.
   *
   * @return A canned response.
   */
  private Response createCannedNewSessionResponse() {
    Response response = new Response();
    response.setSessionId("[no session]");

    // This is dumb, but temporary until we add sessions to the ChromeDriver
    DesiredCapabilities capabilities = DesiredCapabilities.chrome();
    capabilities.setJavascriptEnabled(true);
    Map<?, ?> capabilitiesMap;
    try {
      capabilitiesMap = new JsonToBeanConverter()
          .convert(Map.class, new BeanToJsonConverter().convert(capabilities));
    } catch (WebDriverException e) {
      throw e;
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
    response.setValue(capabilitiesMap);

    return response;
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
    Socket oldestSocket = getOldestSocket();
    writeAndFlushToSocket(data, oldestSocket);
  }
  
  private void writeAndFlushToSocket(byte[] data, Socket socket) throws IOException {
    try {
      socket.getOutputStream().write(data);
      socket.getOutputStream().flush();
    } finally {
      try {
        //This shouldn't be necessary with SO_LINGER set, but seems to make a difference
        Thread.sleep(5);
      } catch (InterruptedException e) {}
      socket.close();
      //Removes the socket if it is present, no-op otherwise
      listeningThread.sockets.remove(socket);
    }
  }

  String fillArgs(Command command) {
    String[] parameterNames = commands.get(command.getName());
    if (parameterNames.length != command.getParameters().size()) {
      throw new WebDriverException(new IllegalArgumentException(
          "Did not supply the expected number of parameters"));
    }
    JSONObject json;
    try {
      String rawJson = new BeanToJsonConverter().convert(command.getParameters());
      json = new JSONObject(rawJson);
      json.put("request", command.getName());
      for (String parameterName : parameterNames) {
        //Icky icky special case
        if (!command.getParameters().containsKey(parameterName)) {
          throw new WebDriverException("Missing required parameter \"" + parameterName + "\"");
        }
      }
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }
    return json.toString();
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
   * @return response to the command.
   * @throws IOException if there are errors with the socket being used
   */
  private Response handleResponse() throws IOException {
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

    try {
      return new JsonToBeanConverter().convert(Response.class, resultBuilder.toString());
    } catch (WebDriverException e) {
      throw e;
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
  }

  private Socket getOldestSocket() {
    Socket socket;
    // Peek, rather than poll, so that if it all goes horribly wrong, we can
    // just close all sockets in the queue, not having to worry about the
    // current ones.
    while ((socket = listeningThread.sockets.peek()) == null) {
      if (!binary.isRunning()) {
        throw new ChromeNotRunningException("Chrome is no longer running!");
      }
      Thread.yield();
    }
    return socket;
  }

  /**
   * Starts a new instanceof Chrome and waits for a TCP port connection from it.
   */
  public void start() {
    Lock lock = newLock();

    lock.lock(DEFAULT_TIMEOUT);
    try {
      int port = binary.getPort();
      if (port == 0) {
        port = determineNextFreePort(SocketLock.DEFAULT_PORT);
      }
      binary.setPort(port);

      for (int retries = MAX_START_RETRIES; !hasClient() && retries > 0; retries--) {
        stop();
        startListening();
        binary.start();
        //In case this attempt fails, we increment how long we wait before sending a command
        binary.incrementBackoffBy(1);
      }
      //The last one attempt succeeded, so we reduce back to that time
      binary.incrementBackoffBy(-1);

      if (!hasClient()) {
        stop();
        throw new FatalChromeException("Cannot create chrome driver");
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    } finally {
      lock.unlock();
    }
  }

  protected int determineNextFreePort(int port) throws IOException {
    // Attempt to connect to the given port on the host
    // If we can't connect, then we're good to use it
    int newport;

    for (newport = port; newport < port + 200; newport++) {
      Socket socket = new Socket();
      InetSocketAddress address = new InetSocketAddress("localhost", newport);

      try {
        socket.bind(address);
        return newport;
      } catch (BindException e) {
        // Port is already bound. Skip it and continue
      } finally {
        socket.close();
      }
    }

    throw new WebDriverException(
        String.format("Cannot find free port in the range %d to %d ", port, newport));
  }

  protected Lock newLock() {
    return new SocketLock();
  }

  public void setTimeout(long timeout) {
    this.timeout = timeout;
  }

  /**
   * Starts listening for new socket connections from Chrome. Does not return
   * until the TCP port is connected to.
   */
  private void startListening() {
    ServerSocket serverSocket;
    try {
      serverSocket = new ServerSocket(binary.getPort());
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
    listen = true;
    listeningThread = new ListeningThread(serverSocket);
    listeningThread.start();
  }

  /**
   * Shuts down Chrome and stops listening for new socket connections.
   */
  public void stop() {
    binary.kill();

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

    ListeningThread(ServerSocket serverSocket) {
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
          acceptedSocket.setSoLinger(true, 10);
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
        	  //sockets.add(acceptedSocket);
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
    
    private void respondWithHoldingPage(Socket socket) throws IOException {
      //We offer a reload to work around http://crbug.com/11547 on Mac
      byte[] data = fillTwoHundred(
          "<html><head><script type='text/javascript'>if (window.location.search == '') { setTimeout(\"window.location = window.location.href + '?reloaded'\", 5000); }</script></head><body><p>ChromeDriver server started and connected.  Please leave this tab open.</p></body></html>",
      "Content-Type: text/html");
      writeAndFlushToSocket(data, socket);
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
        } catch (IOException e) {
          LOG.log(Level.FINE, "I/O error while closing the server socket", e);
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
}
