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

package org.openqa.selenium.server;

import java.util.LinkedList;

/**
 * <p>Provides a synchronizing queue that holds a single entry
 * (eg a single Selenium Command).</p>
 * @author Paul Hammant
 * @version $Revision: 411 $
 */
public class SingleEntryAsyncQueue {

    private LinkedList<Object> q = new LinkedList<Object>();
    private boolean done = false;
    private static int defaultTimeout = SeleniumServer.DEFAULT_TIMEOUT;
    private int timeout;
    
    public SingleEntryAsyncQueue() {
        timeout = defaultTimeout;
    }
    
    public void clear() {
        this.done = true;
        q.clear();
        synchronized(this) {
            this.notifyAll();
        }
    }
    
    public int getTimeout() {
        return timeout;
    }
    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }
    
    /**
     * <p>Retrieves the item from the queue.</p>
     * <p>If there's nothing in the queue right now, wait a period of time 
     * for something to show up.</p> 
     * @return the item in the queue
     * @throws SeleniumCommandTimedOutException if the timeout is exceeded. 
     */
    public synchronized Object get() {
        if (done) {
            throw new RuntimeException("get(" + this + ") on a retired queue");
        }

        int retries = 0;
        while (q.isEmpty()) {
            if (q.isEmpty() & retries >= timeout) {
                throw new SeleniumCommandTimedOutException();
            }
            try {
                wait(1000);
            } catch (InterruptedException e) {
                continue;
            }
            if (done) {
                return null;
            }
            retries++;
        }
        Object thing = q.removeFirst();
        notifyAll();
        return thing;
    }
        
    public int size() {
        return q.size();
    }
    
    public String toString() {
        return q.toString();
    }

    /**
     * <p>Puts something in the queue.</p>
     * If there's already something available in the queue, wait
     * for that item to get picked up and removed from the queue. 
     * @param obj - the thing to put in the queue
     */    
    public synchronized void put(Object thing) {
        if (done) {
            throw new RuntimeException("put(" + thing + ") on a retired queue");
        }
        q.addLast(thing);
        notifyAll();
        synchronized(this) {
            while (q.getFirst() != thing) {
                try {
                    wait(1000);
                } catch (InterruptedException e) {
                }
                if (done) {
                    break;
                }
            }
        }
    }

    public static void setDefaultTimeout(int defaultTimeout) {
        SingleEntryAsyncQueue.defaultTimeout = defaultTimeout;        
    }

}
