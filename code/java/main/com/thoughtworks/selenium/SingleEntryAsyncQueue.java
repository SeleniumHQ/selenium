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

package com.thoughtworks.selenium;

/**
 * <p>Provides a synchronizing queue that holds a single entry
 * (eg a single Selenium Command).</p>
 * 
 * 
 * @author Paul Hammant
 * @version $Revision$
 */
public class SingleEntryAsyncQueue {

    private Object thing;
    private boolean available;

    /**
     * <p>Retrieves the item from the queue, emptying the queue.</p>
     * <p>If there's nothing in the queue right now, wait a period of time 
     * for something to show up.</p> 
     * @return the item in the queue
     * @throws SeleniumCommandTimedOutException if the 
     */
    public synchronized Object get() {
        int retries = 0;
        while (available == false) {
            try {
                wait(1000 * 5);
            } catch (InterruptedException e) {
            }
            if (available == false & retries > 5) {
                throw new SeleniumCommandTimedOutException();
            }
            retries++;
        }
        available = false;
        return thing;
    }

    /**
     * <p>Puts something in the queue.</p>
     * If there's already something available in the queue, wait
     * for that item to get picked up and removed from the queue. 
     * @param thing - the thing to put in the queue
     */
    public synchronized void put(Object thing) {
        while (available == true) {
            try {
                wait();
            } catch (InterruptedException e) {
            }
        }
        this.thing = thing;
        available = true;
        notifyAll();
    }

}
