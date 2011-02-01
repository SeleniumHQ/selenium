// ========================================================================
// $Id: BlockingQueue.java,v 1.5 2004/05/09 20:32:49 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.util;

/* ------------------------------------------------------------ */
/** Blocking queue.
 *
 * Implemented as circular buffer in a Vector. Synchronization is on the
 * vector to avoid double synchronization.
 *
 * @version $Id: BlockingQueue.java,v 1.5 2004/05/09 20:32:49 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class BlockingQueue
{
    // TODO temp implementation. Should use java2 containers.

    Object[] elements;
    Object lock;
    int maxSize;
    int size=0;
    int head=0;
    int tail=0;

    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public BlockingQueue(int maxSize)
    {
        this(null,maxSize);
    }

    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public BlockingQueue(Object lock, int maxSize)
    {
        this.maxSize=maxSize;
        if (maxSize==0)
            this.maxSize=255;
        elements = new Object[this.maxSize];
        this.lock=lock==null?elements:lock;
    }
    
    /* ------------------------------------------------------------ */
    public  void clear()
    {
        synchronized(lock)
        {
            size=0;
            head=0;
            tail=0;
        }
    }
    
    /* ------------------------------------------------------------ */
    public int size()
    {
        return size;
    }
    
    /* ------------------------------------------------------------ */
    public int maxSize()
    {
        return maxSize;
    }
    
  
    /* ------------------------------------------------------------ */
    /** Put object in queue.
     * @param o Object
     */
    public void put(Object o)
        throws InterruptedException
    {
        synchronized(lock)
        {
            while (size==maxSize)
                lock.wait();

            elements[tail]=o;
            if(++tail==maxSize)
                tail=0;
            size++;
            lock.notify();
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Put object in queue.
     * @param timeout If timeout expires, throw InterruptedException
     * @param o Object
     * @exception InterruptedException Timeout expired or otherwise interrupted
     */
    public void put(Object o, int timeout)
        throws InterruptedException
    {
        synchronized(lock)
        {
            if (size==maxSize)
            {
                lock.wait(timeout);
                if (size==maxSize)
                    throw new InterruptedException("Timed out");
            }
            
            elements[tail]=o;
            if(++tail==maxSize)
                tail=0;
            size++;
            lock.notify();
        }
    }

    /* ------------------------------------------------------------ */
    /** Get object from queue.
     * Block if there are no objects to get.
     * @return The next object in the queue.
     */
    public Object get()
        throws InterruptedException
    {
        synchronized(lock)
        {
            while (size==0)
                lock.wait();
            
            Object o = elements[head];
            elements[head]=null;
            if(++head==maxSize)
                head=0;
            if (size==maxSize)
                lock.notifyAll();
            size--;
            return o;
        }
    }
    
        
    /* ------------------------------------------------------------ */
    /** Get from queue.
     * Block for timeout if there are no objects to get.
     * @param timeoutMs the time to wait for a job
     * @return The next object in the queue, or null if timedout.
     */
    public Object get(int timeoutMs)
        throws InterruptedException
    {
        synchronized(lock)
        {
            if (size==0 && timeoutMs!=0)
                lock.wait((long)timeoutMs);
            
            if (size==0)
                return null;
            
            Object o = elements[head];
            elements[head]=null;
            if(++head==maxSize)
                head=0;

            if (size==maxSize)
                lock.notifyAll();
            size--;
            
            return o;
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Peek at the  queue.
     * Block  if there are no objects to peek.
     * @return The next object in the queue, or null if timedout.
     */
    public Object peek()
        throws InterruptedException
    {
        synchronized(lock)
        {
            if (size==0)
                lock.wait();
            
            if (size==0)
                return null;
            
            Object o = elements[head];
            return o;
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Peek at the  queue.
     * Block for timeout if there are no objects to peek.
     * @param timeoutMs the time to wait for a job
     * @return The next object in the queue, or null if timedout.
     */
    public Object peek(int timeoutMs)
        throws InterruptedException
    {
        synchronized(lock)
        {
            if (size==0)
                lock.wait((long)timeoutMs);
            
            if (size==0)
                return null;
            
            Object o = elements[head];
            return o;
        }
    }
}








