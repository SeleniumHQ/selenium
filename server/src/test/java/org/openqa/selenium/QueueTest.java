package org.openqa.selenium;

import org.openqa.selenium.server.SeleniumCommandTimedOutException;
import org.openqa.selenium.server.SingleEntryAsyncQueue;

import junit.framework.TestCase;

public class QueueTest extends TestCase {
    SingleEntryAsyncQueue q;
    
    class QTestThread extends Thread {
        private Object objToPut;

        public void run() {
            System.out.println("QTestThread.run putting " + objToPut);
            q.put(objToPut);
            System.out.println("QTestThread.run returned from putting " + objToPut);
        }

        public void willPut(String s) {
            objToPut = s;
        }
    }
    
    public void setUp() {
        q = new SingleEntryAsyncQueue();
    }
    
    public void testClearHungGetter() throws Exception {
        new Thread() {
            public void run() {
                boolean exceptionSeen = false;
                try {
                    q.get();
                }
                catch (RuntimeException e) {
                    exceptionSeen = true;
                }
                catch (Throwable e) {
                    fail("got an unexpected exception: " + e);
                }
                assertTrue(exceptionSeen);
            }
        }.start();
        sleepTight(300);    // give getter thread a chance to go wait on the queue
        q.clear();
    }
    
    class PuttingThread extends Thread {
        public String failureMessage = "not set yet";
        public void run() {
            try {
                q.put("abc");   // this one executes and immediately returns
                q.put("xyz");   // this one will wait for q.size to be 1 before returning
            }
            catch (RuntimeException e) {
                failureMessage = "ok";
                System.out.println("Putting thread saw expected failure: " + e);
                return;
            }
            catch (Throwable e) {
                failureMessage = "got an unexpected exception: " + e;
                return;
            }
            failureMessage = "no exception for a putting thread on a queue that got cleared";
        }
    };
    
    public void testClearHungPutter() throws Exception {
        PuttingThread t = new PuttingThread(); 
        t.start();
        sleepTight(1000);    // give getter thread a chance to go wait on the queue
        q.clear();
        t.join();
        assertEquals("ok", t.failureMessage);
    }
    
    public void testGetFromEmptyQueue() throws Exception {
        SingleEntryAsyncQueue.setTimeout(0);
        boolean seleniumCommandTimedOutExceptionSeen = false;
        try {
            q.get();
        }
        catch (SeleniumCommandTimedOutException e) {
            seleniumCommandTimedOutExceptionSeen = true;
        }
        assertEquals(true, seleniumCommandTimedOutExceptionSeen);
    }
    
    public void testMultipleThreadsOrdering() throws Exception {
        int TEST_THREAD_COUNT = 3;
        for (int j = 0; j < TEST_THREAD_COUNT; j++) {
             QTestThread qt = new QTestThread();
             qt.willPut("thread " + j);
             qt.start();
             while (q.size() <= j) {
                 System.out.println("main waiting on " +
                        (TEST_THREAD_COUNT-j) + " test threads to all call put()");
                 sleepTight(500);
             }
        }
        
        for (int threadNumber = 0; threadNumber < TEST_THREAD_COUNT; threadNumber++) {
            assertEquals(TEST_THREAD_COUNT - threadNumber, q.size());
            System.out.println("main thread reading q...");
            String dataProducingThread = (String) q.get();
            System.out.println("main thread read " + dataProducingThread);
            assertEquals("thread " + threadNumber, dataProducingThread);
        }
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

    private void sleepTight(int millisecs) {
        try {
            Thread.sleep(millisecs);
        } catch (InterruptedException e) {
            throw new RuntimeException("sleep interrupted...");
        }
    }
}
