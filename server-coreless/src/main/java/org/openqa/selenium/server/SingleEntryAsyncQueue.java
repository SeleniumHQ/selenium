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

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;

/**
 * <p>Holds the command to be next run in the browser</p>
 * <p/>
 * This class uses reentrant locks in order to allow the same
 * thread to populate the queue as is waiting for it, which is
 * what currently happens on during browser startup.
 *
 * @author Jennifer Bevan
 * @version $Revision: 734 $
 */
public class SingleEntryAsyncQueue<T> {
    private static Log log = LogFactory.getLog(SingleEntryAsyncQueue.class);
    private final AtomicReference<T> poisonData;
    private final int timeoutInSeconds;
    private final ArrayBlockingQueue<T> holder;

    public SingleEntryAsyncQueue(int timeoutInSecs) {
        timeoutInSeconds = timeoutInSecs;
        holder = new ArrayBlockingQueue<T>(1);
        poisonData = new AtomicReference<T>();
    }

    public int getTimeoutInSeconds() {
        return timeoutInSeconds;
    }

    protected void setPoison(T poisonInstance) {
        poisonData.set(poisonInstance);
    }

    protected boolean isPoison(T poisonSample) {
        boolean result = false;
        T poison = poisonData.get();
        if (null != poison && poison.equals(poisonSample)) {
            result = true;
        }
        return result;
    }

    protected T pollToGetContentUntilTimeout() {
        T result = holder.poll(); // in case it's already there
        if (null != result) {
            log.debug("data was waiting: " + result);
        }

        if (timeoutInSeconds > 0 && null == result) {
            long now = System.currentTimeMillis();
            long deadline = now + (timeoutInSeconds * 1000L);
            while (now < deadline) {
                try {
                    log.debug("waiting for data for at most " + (deadline - now) + " more ms");
                    result = holder.poll(deadline - now, TimeUnit.MILLISECONDS);
                    log.debug("data from polling: " + result);
                    now = deadline;
                } catch (InterruptedException ie) {
                    now = System.currentTimeMillis();
                    log.debug("was interrupted; resuming wait");
                }
            }
        }
        return result;
    }

    protected boolean putContent(T thing) {
        log.debug("putting command: " + thing);
        boolean res = holder.offer(thing);
        log.debug("..command put?: " + res);
        return res;
    }

    protected boolean isEmpty() {
        return (0 == holder.size());
    }

    protected T peek() {
        return holder.peek();
    }

    /**
     * Clears the contents of the holder (if any) and also
     * feeds 'poison' data a pending listener (if any);
     *
     * @return true if poison was set and sent to any listeners.
     */
    protected boolean poisonPollers() {
        if (null == poisonData.get()) {
            holder.clear();
            return false;
        }
        // offer poison content.  If something is already there,
        // then the next listener will already have something to get.
        putContent(poisonData.get());
        return true;
    }
}
