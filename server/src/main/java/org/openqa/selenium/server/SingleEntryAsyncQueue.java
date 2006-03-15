/*
 * Copyright 2004 ThoughtWorks, Inc.
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

    private LinkedList q = new LinkedList();
    private boolean waitingThreadsShouldThrow = false;
    static private int timeout = 30;
    
    class OwnerAndDataPair extends Object {
        private Object owner;
        private Object data;
            
        public OwnerAndDataPair(Object ownerParm, Object dataParm) {
            owner = ownerParm;
            data = dataParm;
        }
        public Object getData() {
            return data;
        }
        public Object getOwner() {
            return owner;
        }
        public String toString() {
            return "" + data + " (from " + owner + ")";
        }
    }
    
    public void clear() {
        this.waitingThreadsShouldThrow = true;
        if (q.isEmpty()) {
            q.add("dummy_to_wake_up_getting_thread____(if_there_is_one)");
        }
        else {
            q.clear();
        }
        synchronized(this) {
            this.notifyAll();
        }
        
    }
    
    static public int getTimeout() {
        return SingleEntryAsyncQueue.timeout;
    }
    static public void setTimeout(int timeout) {
        SingleEntryAsyncQueue.timeout = timeout;
    }
    
    /**
     * <p>Retrieves the item from the queue.</p>
     * <p>If there's nothing in the queue right now, wait a period of time 
     * for something to show up.</p> 
     * @return the item in the queue
     * @throws SeleniumCommandTimedOutException if the timeout is exceeded. 
     */
    public synchronized Object get() {
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
            retries++;
        }
        verifyThisQueueWasNotHungAndThenCleared("get");
        Object thing = ((OwnerAndDataPair) q.removeFirst()).getData();
        notifyAll();
        return thing;
    }
        
    private void verifyThisQueueWasNotHungAndThenCleared(String methodCalled) {
        if (waitingThreadsShouldThrow) {
            throw new RuntimeException("called queue." +
                    methodCalled + "() when queue.clear() called");
        }        
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
        verifyThisQueueWasNotHungAndThenCleared("put");
        q.addLast(new OwnerAndDataPair("owner stub", thing));
        notifyAll();
        synchronized(this) {
            while (((OwnerAndDataPair) q.getFirst()).getData() != thing) {
                try {
                    wait();
                } catch (InterruptedException e) {
                }
                verifyThisQueueWasNotHungAndThenCleared("put");
            }
        }
    }

}
