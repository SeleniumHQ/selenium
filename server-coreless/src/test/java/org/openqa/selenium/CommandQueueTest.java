/*
 * Copyright 2006 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Handler;
import java.util.logging.Logger;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.CommandQueue;
import org.openqa.selenium.server.DefaultRemoteCommand;
import org.openqa.selenium.server.RemoteCommand;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.WindowClosedException;
import org.openqa.selenium.server.log.StdOutHandler;
import org.openqa.selenium.server.log.TerseFormatter;
import org.openqa.selenium.testworker.TrackableRunnable;
import org.openqa.selenium.testworker.TrackableThread;

public class CommandQueueTest extends TestCase {
    CommandQueue q;
    private final Lock dataLock = new ReentrantLock();
    static Log log = LogFactory.getLog(CommandQueueTest.class);
    
    public CommandQueueTest() {
    	super();
    }
    
    public CommandQueueTest(String name) {
		super(name);
	}

    public static Test suitex() {
    	TestSuite suite = new TestSuite();
    	for (int i = 0; i < 1; i++) {
    		suite.addTest(new CommandQueueTest("testRealTwoRounds"));
    	}
    	return suite;
    }
    
	public void setUp() {
        q = new CommandQueue("testSession", getName(), dataLock);
        configureLogging();
        log.info("Start test: " + getName());
    }
    
    private void configureLogging() {
    	SeleniumServer.setDebugMode(true);
        SeleniumServer.configureLogging();
        Logger logger = Logger.getLogger("");
        for (Handler handler : logger.getHandlers()) {
        	if (handler instanceof StdOutHandler) {
        		handler.setFormatter(new TerseFormatter(true));
        		break;
        	}
        }
    }
    
    public void tearDown() {
    	SeleniumServer.setDebugMode(false);
    	SeleniumServer.configureLogging();
    }
    
    public void testSimpleSingleThreaded() throws Exception {
    	dataLock.lock();
    	injectCommandAsIfWaiting("something", "arg1", "arg2");
    	expectCommand("something", "arg1", "arg2");
    	q.handleCommandResultWithoutWaitingForAResponse("OK");
    	assertEquals("OK", getBrowserResultByForce(q));
    }
    
    public void testRealSimple() throws Throwable {
    	TrackableThread commandRunner = launchCommandRunner("something", "arg1", "arg2");
    	expectCommand("something", "arg1", "arg2");
    	dataLock.lock();
    	q.handleCommandResultWithoutWaitingForAResponse("OK");
    	dataLock.unlock();
    	assertEquals("OK", commandRunner.getResult());
    }
    
    public void testTwoRoundsSingleThreaded() throws Exception {
    	testSimpleSingleThreaded();
    	q.doCommandWithoutWaitingForAResponse("testComplete", "", "");
    	expectCommand("testComplete", "", "");
    }
    
    public void testRealTwoRounds() throws Throwable {
    	// do "something"
    	TrackableThread commandRunner = launchCommandRunner("something", "arg1", "arg2");
    	// browser receives "something"
    	TrackableThread browserRequestRunner = launchBrowserResultRunner(null);
    	expectCommand(browserRequestRunner, "something", "arg1", "arg2");
    	// browser replies "OK"
    	browserRequestRunner = launchBrowserResultRunner("OK");
    	// commandRunner receives "OK"
    	assertEquals("OK", commandRunner.getResult());
    	// send a final "testComplete" in the current foreground thread
    	dataLock.lock();
    	q.doCommandWithoutWaitingForAResponse("testComplete", "", "");
    	dataLock.unlock();
    	expectCommand(browserRequestRunner, "testComplete", "", "");
    }
    
    // TODO test JsVar stuff
    
    /** In PI Mode, open replies "OK", but then we asynchronously receive "closed!" */
    public void testPIOpenSingleThreaded() throws Exception {
    	dataLock.lock();
    	injectCommandAsIfWaiting("open", "blah.html", "");
    	expectCommand("open", "blah.html", "");
    	q.handleCommandResultWithoutWaitingForAResponse("OK");
    	q.declareClosed();
    	assertEquals("OK", getBrowserResultByForce(q));
    }
    
    private void injectCommandAsIfWaiting(String cmd, String field, String value) throws WindowClosedException {
    	q.doCommandWithoutWaitingForAResponse(cmd, field, value);
    	// q.resultExpected = true;
    	try {
			Field resultExpected = CommandQueue.class.getDeclaredField("resultExpected");
			resultExpected.setAccessible(true);
			resultExpected.setBoolean(q, true);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
    }
    
    private void expectCommand(TrackableThread browserRequestRunner, String cmd, String arg1, String arg2) throws Throwable {
    	RemoteCommand actual = (RemoteCommand) browserRequestRunner.getResult();
    	RemoteCommand expected = new DefaultRemoteCommand(cmd, arg1, arg2);
    	assertEquals(cmd + " command got mangled", expected, actual);
    }
    
    private void expectCommand(String cmd, String arg1, String arg2) {
    	RemoteCommand actual = getNextCommandByForce(q);
    	RemoteCommand expected = new DefaultRemoteCommand(cmd, arg1, arg2);
    	assertEquals(cmd + " command got mangled", expected, actual);
    }
    
    /** Fire off a command in the background, so we can wait for the result */
    private TrackableThread launchCommandRunner(String cmd, String arg1, String arg2) {
    	TrackableThread t = new TrackableThread(new AsyncCommandRunner(cmd, arg1, arg2), cmd);
    	t.start();
    	return t;
    }
    
    /** Send back a browser result in the background, so we can wait for the next command */
    private TrackableThread launchBrowserResultRunner(String browserResult) {
    	String name = browserResult;
    	if (name == null) {
    		name = "NULL STARTING";
    	}
    	TrackableThread t = new TrackableThread(new AsyncBrowserResultRunner(browserResult), name);
    	t.start();
    	return t;
    }
    
    private RemoteCommand getNextCommandByForce(CommandQueue queue) {
    	try {
			Method gnc = CommandQueue.class.getDeclaredMethod("getNextCommand");
			gnc.setAccessible(true);
			return (RemoteCommand) gnc.invoke(queue);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
    }
    
    private String getBrowserResultByForce(CommandQueue queue) {
    	try {
			Method qgr = CommandQueue.class.getDeclaredMethod("queueGetResult", String.class);
			qgr.setAccessible(true);
			return (String) qgr.invoke(queue, "test");
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
    }
    
    /** Passes the specified command to command queue */
    private class AsyncCommandRunner extends TrackableRunnable {
    	private String cmd, arg1, arg2;
    	
    	public AsyncCommandRunner(String cmd, String arg1, String arg2) {
			this.cmd = cmd;
			this.arg1 = arg1;
			this.arg2 = arg2;
		}
    	
		@Override
		public Object go() throws Throwable {
			Object result = q.doCommand(cmd, arg1, arg2);
			log.info(Thread.currentThread().getName() + " got result: " + result);
			return result;
		}
    }
    
    /** Passes the specified browserResult to command queue */
    private class AsyncBrowserResultRunner extends TrackableRunnable {
    	private String browserResult;
    	
    	public AsyncBrowserResultRunner(String browserResult) {
			this.browserResult = browserResult;
		}
    	
		@Override
		public Object go() throws Throwable {
			dataLock.lock();
			Object result = q.handleCommandResult(browserResult);
			dataLock.unlock();
			log.info(Thread.currentThread().getName() + " got result: " + result);
			return result;
		}
    }
    
}
