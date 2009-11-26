package com.thoughtworks.selenium;

import junit.framework.TestCase;
import org.easymock.classextension.ConstructorArgs;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * {@link com.thoughtworks.selenium.HttpCommandProcessor} unit test class.
 */
public class HttpCommandProcessorUnitTest extends TestCase {

	public void testCanStopTheSeleneseSessionEvenIfThereIsNoCurrentSession() {
		final HttpCommandProcessor processor;

		processor = new HttpCommandProcessor("a Server", 1234, "", "a url");
		processor.stop();
	}

	public void testCanStopTheSeleneseSessionWhenASessionIsInProgress() {
		final HttpCommandProcessor processor;

		processor = new HttpCommandProcessor("a Server", 1234, "", "a url") {
			public String doCommand(String commandName, String[] args) {
				assertEquals("testComplete", commandName);
				assertNull(args);
				return null;
			}
		};
		processor.setSessionInProgress("123456789");
		processor.stop();
	}

	public void testResourcesClosedWhenIoeOnGetConnection() {
		IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
				"localhost", 4444, "*chrome", "http://www.google.com");
		cmdProc.throwIoeOnGetConnection = true;
		try {
			String response = cmdProc.getCommandResponseAsString("testCommand");
			fail();
		} catch (IOException ioe) {
			cmdProc.verifyClosedResources(false, false, false);
		}
	}

	public void testResourcesClosedWhenIoeOnGetOutputStream() {
		IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
				"localhost", 4444, "*chrome", "http://www.google.com");
		cmdProc.throwIoeOnGetOutputStream = true;
		try {
			String response = cmdProc.getCommandResponseAsString("testCommand");
			fail();
		} catch (IOException ioe) {
			cmdProc.verifyClosedResources(true, false, false);
		}
	}

	public void testResourcesClosedWhenIoeOnGetInputStream() {
		IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
				"localhost", 4444, "*chrome", "http://www.google.com");
		cmdProc.throwIoeOnGetInputStream = true;
		try {
			String response = cmdProc.getCommandResponseAsString("testCommand");
			fail();
		} catch (IOException ioe) {
			cmdProc.verifyClosedResources(true, true, false);
		}
	}

	public void testResourcesClosedWhenNoIoes() {
		IOEThrowingHttpCommandProcessor cmdProc = new IOEThrowingHttpCommandProcessor(
				"localhost", 4444, "*chrome", "http://www.google.com");
		try {
			String response = cmdProc.getCommandResponseAsString("testCommand");
			cmdProc.verifyClosedResources(true, true, true);
		} catch (IOException ioe) {
			fail();
		}
	}

	/**
	 * Inner class to help mock out the network and pipe connections to verify
	 * that they are closed regardless of where IOExceptions occur.
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

		public IOEThrowingHttpCommandProcessor(String pathToServlet,
				String browserStartCommand, String browserURL) {
			super(pathToServlet, browserStartCommand, browserURL);
		}

		protected HttpURLConnection getHttpUrlConnection(URL urlForServlet)
				throws IOException {
			if (throwIoeOnGetConnection) {
				throw new IOException("injected exception");
			} else {
				return super.getHttpUrlConnection(urlForServlet);
			}
		}

		protected Writer getOutputStreamWriter(HttpURLConnection conn)
				throws IOException {
			if (throwIoeOnGetOutputStream) {
				throw new IOException("injected exception");
			} else {
				return new StringWriter(1024);
			}
		}

		protected Reader getInputStreamReader(HttpURLConnection conn)
				throws IOException {
			if (throwIoeOnGetInputStream) {
				throw new IOException("injected exception");
			} else {
				return new StringReader(responseString);
			}
		}

		protected int getResponseCode(HttpURLConnection conn)
				throws IOException {
			return HttpURLConnection.HTTP_OK;
		}

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

	public void testGetBooleanArray() throws Exception {
		final HttpCommandProcessor processor;
		final ConstructorArgs constArgs = new ConstructorArgs(
				HttpCommandProcessor.class.getConstructor(String.class,	int.class, String.class, String.class),
				"localhost", 4444, "*chrome", "http://www.openqa.org");
		Method getStringArray = HttpCommandProcessor.class.getDeclaredMethod("getStringArray", String.class, String[].class);
		processor = org.easymock.classextension.EasyMock.createMock(HttpCommandProcessor.class, constArgs, getStringArray);

		String[] cmdArgs = new String[] {"1", "2"};
		String[] cmdResults = new String[] {"true", "false"};
		boolean[] boolCmdResults = new boolean[] {true, false};

		org.easymock.classextension.EasyMock.expect(processor.getStringArray("command", cmdArgs)).andReturn(
				cmdResults);
		org.easymock.classextension.EasyMock.replay(processor);

		boolean[] methodResults = processor.getBooleanArray("command", cmdArgs);
		assertEquals(boolCmdResults[0],methodResults[0]);
		assertEquals(boolCmdResults[1], methodResults[1]);
		org.easymock.classextension.EasyMock.verify(processor);
	}

}
