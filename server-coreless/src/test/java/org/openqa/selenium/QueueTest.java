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

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import junit.framework.TestCase;

import org.openqa.selenium.server.SeleniumCommandTimedOutException;
import org.openqa.selenium.server.SingleEntryAsyncQueue;

public class QueueTest extends TestCase {
    SingleEntryAsyncQueue q;
    private final Lock dataLock = new ReentrantLock();
    private Condition condition = dataLock.newCondition();
    
    
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
        q = new SingleEntryAsyncQueue("test_queue", dataLock, condition);
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
}
