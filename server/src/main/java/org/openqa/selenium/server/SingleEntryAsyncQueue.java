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


/**
 * <p>Provides a synchronizing queue that holds a single entry
 * (eg a single Selenium Command).</p>
 * @author Paul Hammant
 * @version $Revision: 411 $
 */
public class SingleEntryAsyncQueue {

    private Object thing = null;
    private boolean done = false;
    private static int defaultTimeout = SeleniumServer.DEFAULT_TIMEOUT;
    private int timeout;
    private boolean hasBlockedGetter = false;
    
    public SingleEntryAsyncQueue() {
        timeout = defaultTimeout;
    }
    
    /**
     * clear contents and tell any waiting threads to go away.
     */
    public void clear() {
        thing = null;
        while (hasBlockedGetter) {
            this.done = true;
            synchronized(this) {
                this.notifyAll();
            }
            Thread.yield();
        }
        this.done = false;
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
        hasBlockedGetter = true;
        Object t = null;
        try {
            while (thing==null) {
                if (thing==null & retries >= timeout) {
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
            t = thing;
        }
        finally {
            hasBlockedGetter = false;
        }
        thing = null;
        notifyAll();
        return t;
    }
        
    /**
     * <p>Retrieves the item from the queue.</p>
     * <p>If there's nothing in the queue right now, wait a period of time 
     * for something to show up.</p> 
     * @return the item in the queue
     * @throws SeleniumCommandTimedOutException if the timeout is exceeded. 
     */
    public synchronized Object peek() {
        if (done) {
            throw new RuntimeException("peek(" + this + ") on a retired queue");
        }
        if (isEmpty()) {
            throw new RuntimeException("peek() called on an empty queue");
        }
        return thing;
    }
        
    public boolean isEmpty() {
        return thing==null;
    }

    public String toString() {
        return thing.toString();
    }

    /**
     * <p>Puts something in the queue.</p>
     * If there's already something available in the queue, wait
     * for that item to get picked up and removed from the queue. 
     * @param obj - the thing to put in the queue
     */    
    public synchronized void put(Object obj) {
        if (done) {
            throw new RuntimeException("put(" + obj + ") on a retired queue");
        }
        synchronized(this) {
            if (thing!=null) {
                throw new SingleEntryAsyncQueueOverflow();
            }
            thing = obj;
            notifyAll();
        }
    }

    public static void setDefaultTimeout(int defaultTimeout) {
        SingleEntryAsyncQueue.defaultTimeout = defaultTimeout;        
    }

    public boolean hasBlockedGetter() {
        return hasBlockedGetter ;
    }

}
