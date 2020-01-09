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

package com.thoughtworks.selenium;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;

import org.junit.Test;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * {@link com.thoughtworks.selenium.HttpCommandProcessor} unit test class.
 */
public class HttpCommandProcessorUnitTest {

  @Test
  public void testCanStopTheSeleneseSessionEvenIfThereIsNoCurrentSession() {
    final HttpCommandProcessor processor;

    processor = new HttpCommandProcessor("a Server", 1234, "", "a url");
    processor.stop();
  }

  @Test
  public void testCanStopTheSeleneseSessionWhenASessionIsInProgress() {
    final HttpCommandProcessor processor;

    processor = new HttpCommandProcessor("a Server", 1234, "", "a url") {
      @Override
      public String doCommand(String commandName, String[] args) {
        assertEquals("testComplete", commandName);
        assertNull(args);
        return null;
      }
    };
    processor.setSessionInProgress("123456789");
    processor.stop();
  }

  @Test
  public void testResourcesClosedWhenIoeOnGetConnection() {
    IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
        "localhost", 4444, "*chrome", "http://www.google.com");
    cmdProc.throwIoeOnGetConnection = true;
    try {
      cmdProc.getCommandResponseAsString("testCommand");
      fail();
    } catch (IOException ioe) {
      cmdProc.verifyClosedResources(false, false, false);
    }
  }

  @Test
  public void testResourcesClosedWhenIoeOnGetOutputStream() {
    IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
        "localhost", 4444, "*chrome", "http://www.google.com");
    cmdProc.throwIoeOnGetOutputStream = true;
    try {
      cmdProc.getCommandResponseAsString("testCommand");
      fail();
    } catch (IOException ioe) {
      cmdProc.verifyClosedResources(true, false, false);
    }
  }

  @Test
  public void testResourcesClosedWhenIoeOnGetInputStream() {
    IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
        "localhost", 4444, "*chrome", "http://www.google.com");
    cmdProc.throwIoeOnGetInputStream = true;
    try {
      cmdProc.getCommandResponseAsString("testCommand");
      fail();
    } catch (IOException ioe) {
      cmdProc.verifyClosedResources(true, true, false);
    }
  }

  @Test
  public void testResourcesClosedWhenNoIoes() {
    IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
        "localhost", 4444, "*chrome", "http://www.google.com");
    try {
      cmdProc.getCommandResponseAsString("testCommand");
      cmdProc.verifyClosedResources(true, true, true);
    } catch (IOException ioe) {
      fail();
    }
  }

  /**
   * Inner class to help mock out the network and pipe connections to verify that they are closed
   * regardless of where IOExceptions occur.
   *
   * @author jbevan@google.com (Jennifer Bevan)
   */
  private class IOEThrowingHttpCommandProcessor extends HttpCommandProcessor {

    private HttpURLConnection closedConn;
    private Writer closedWriter;
    private Reader closedReader;

    protected String responseString = "normal response";
    protected boolean throwIoeOnGetConnection = false;
    protected boolean throwIoeOnGetInputStream = false;
    protected boolean throwIoeOnGetOutputStream = false;

    public IOEThrowingHttpCommandProcessor(String serverHost,
        int serverPort, String browserStartCommand, String browserURL) {
      super(serverHost, serverPort, browserStartCommand, browserURL);
    }

    @Override
    protected HttpURLConnection getHttpUrlConnection(URL urlForServlet)
        throws IOException {
      if (throwIoeOnGetConnection) {
        throw new IOException("injected exception");
      }
      return super.getHttpUrlConnection(urlForServlet);
    }

    @Override
    protected Writer getOutputStreamWriter(HttpURLConnection conn)
        throws IOException {
      if (throwIoeOnGetOutputStream) {
        throw new IOException("injected exception");
      }
      return new StringWriter(1024);
    }

    @Override
    protected Reader getInputStreamReader(HttpURLConnection conn)
        throws IOException {
      if (throwIoeOnGetInputStream) {
        throw new IOException("injected exception");
      }
      return new StringReader(responseString);
    }

    @Override
    protected int getResponseCode(HttpURLConnection conn) {
      return HttpURLConnection.HTTP_OK;
    }

    @Override
    protected void closeResources(HttpURLConnection conn, Writer wr,
        Reader rdr) {
      closedConn = conn;
      closedWriter = wr;
      closedReader = rdr;
      super.closeResources(conn, wr, rdr);
    }

    protected boolean verifyClosedResources(boolean connNotNull,
        boolean writerNotNull, boolean readerNotNull) {
      return ((connNotNull && (null != closedConn))
          && (writerNotNull && (null != closedWriter)) && (readerNotNull && (null != closedReader)));
    }

  }

  @Test
  public void testGetBooleanArray() {
    HttpCommandProcessor processor =
        new HttpCommandProcessor("localhost", 4444, "*chrome", "http://www.openqa.org");
    processor = spy(processor);

    String[] cmdArgs = new String[] {"1", "2"};
    String[] cmdResults = new String[] {"true", "false"};
    boolean[] boolCmdResults = new boolean[] {true, false};

    doReturn(cmdResults).when(processor).getStringArray("command", cmdArgs);

    boolean[] methodResults = processor.getBooleanArray("command", cmdArgs);
    assertEquals(boolCmdResults[0], methodResults[0]);
    assertEquals(boolCmdResults[1], methodResults[1]);
  }

}
