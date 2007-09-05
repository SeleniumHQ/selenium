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

import java.util.concurrent.TimeoutException;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Handler;
import java.util.logging.Logger;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.SeleniumCommandTimedOutException;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.SingleEntryAsyncQueue;
import org.openqa.selenium.server.log.StdOutHandler;
import org.openqa.selenium.server.log.TerseFormatter;
import org.openqa.selenium.testworker.TrackableRunnable;
import org.openqa.selenium.testworker.TrackableThread;

public class SingleEntryAsyncQueueTest extends TestCase {
    SingleEntryAsyncQueue q;
    private final Lock dataLock = new ReentrantLock();
    private Condition condition = dataLock.newCondition();
    static Log log = LogFactory.getLog(SingleEntryAsyncQueueTest.class);
    
    public SingleEntryAsyncQueueTest() {
    	super();
    }
    
    public SingleEntryAsyncQueueTest(String name) {
		super(name);
	}

    public static Test suitex() {
    	//if (true) return new SingleEntryAsyncQueueTest("testGetBeforePut");
    	TestSuite suite = new TestSuite();
    	for (int i = 0; i < 1; i++) {
    		suite.addTest(new SingleEntryAsyncQueueTest("testDoubleGets"));
    	}
    	return suite;
    }
    
	public void setUp() {
        q = new SingleEntryAsyncQueue("test_queue", dataLock, condition);
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
    
    public void testGetFromEmptyQueue() throws Exception {
        q.setTimeout(0);
        boolean seleniumCommandTimedOutExceptionSeen = false;
        try {
            q.get();
        }
        catch (SeleniumCommandTimedOutException e) {
            seleniumCommandTimedOutExceptionSeen = true;
        }
        assertEquals(true, seleniumCommandTimedOutExceptionSeen);
    }
    
    
    
    public void testTrivial() {
        q.put("hi");
        String s = (String) q.get();
        assertEquals("hi", s);
    }
    public void testTrivialx2() {
        q.put("hi");
        q.get();
        q.put("there");
        String s = (String) q.get();
        assertEquals("there", s);
    }
    
    public void testTrivialThreads() throws Throwable {
    	q.put("hi");
    	TrackableThread trivialQGetter = launchQGetter("trivialQGetter");
    	Object result;
		try {
			result = trivialQGetter.getResult();
		} catch (Throwable e) {
			log.debug("failed", e);
			throw e;
		}
    	assertEquals("hi", result);
    }
    
    public void testGetBeforePut() throws Throwable {
    	TrackableThread trivialQGetter = launchQGetter("trivialQGetter");
    	q.put("hi");
    	Object result;
		try {
			result = trivialQGetter.getResult();
		} catch (Throwable e) {
			log.debug("failed", e);
			throw e;
		}
    	assertEquals("hi", result);
    }
    
    public void testGetBeforePutx2() throws Throwable {
    	TrackableThread getter1 = launchQGetter("getter1");
    	q.put("hi");
    	assertEquals("hi", getter1.getResult());
    	TrackableThread getter2 = launchQGetter("getter2");
    	q.put("there");
    	assertEquals("there", getter2.getResult());
    }
    
    public void testDoubleGets() throws Throwable {
    	TrackableThread getter1 = launchQGetter("getter1");
    	TrackableThread getter2 = launchQGetter("getter2");
    	q.put("hi");
    	Thread.sleep(100);
    	assertTrue("Neither thread accepted the result", !getter1.isAlive() || !getter2.isAlive());
    	TrackableThread loser = getter1.isAlive() ? getter1 : getter2;
    	TrackableThread winner = getter1 == loser ? getter2 : getter1;
    	String s = (String) winner.getResult();
    	assertEquals("hi", s);
    	log.info("Waiting to see if the loser got a message");
    	try {
    		s = (String) loser.getResult();
    		fail("loser finished early: " + s);
    	} catch (TimeoutException e) {}
    }
    
    public void testDoublePuts() throws Throwable {
    	q.put("hi");
    	q.put("there");
    	System.out.println(q.get());
    	assertTrue("q wasn't empty: " + q, q.isEmpty());
    }
    
    private TrackableThread launchQGetter(String name) {
    	TrackableThread t = new TrackableThread(new AsyncQGetter(), name);
    	t.start();
    	return t;
    }
    
    private class AsyncQGetter extends TrackableRunnable {

		@Override
		public Object go() throws Throwable {
			Object result = q.get();
			log.info(Thread.currentThread().getName() + " got result: " + result);
			return result;
		}
    }
    
}
