/*
 * Created on Oct 24, 2006
 *
 */
package com.thoughtworks.selenium;

//import junit.framework.*;

/**
 * A utility class, designed to help the user automatically wait until a
 * condition turns true.
 * 
 * Use it like this:
 * 
 * <p><code>new Wait("Couldn't find close button!") {<br/> 
 * &nbsp;&nbsp;&nbsp;&nbsp;boolean until() {<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return selenium.isElementPresent("button_Close");<br/>
 * &nbsp;&nbsp;&nbsp;&nbsp;}<br/>
 * };</code></p>
 * 
 * 
 * @author Dan Fabulich
 * 
 */
public abstract class Wait {

    /**
     * Specifies the message we'll use when we fail
     * @param message the failure message
     */
    public Wait(String message) {
        wait(message);
    }
    
    /** Specifies a failure message and a timeout
     * 
     * @param message the failure message
     * @param timoutInMilliseconds timeout in milliseconds
     */
    public Wait(String message, long timeoutInMilliseconds) {
        wait(message);
        this.timeoutInMilliseconds = timeoutInMilliseconds;
    }
    
    /** Specifies a failure message, a timeout, and an interval
     * 
     * @param message the failure message
     * @param timoutInMilliseconds timeout in milliseconds
     */
    public Wait(String message, long timeoutInMilliseconds, long intervalInMilliseconds) {
        wait(message);
        this.timeoutInMilliseconds = timeoutInMilliseconds;
        this.intervalInMilliseconds = intervalInMilliseconds;
    }
    
    /** Returns true when it's time to stop waiting */
    public abstract boolean until();
    
    /** The amout of time to wait before giving up; the default is 30 seconds */
    public long timeoutInMilliseconds = 30000l;
    
    /** The interval to pause between checking; the default is 500 milliseconds */ 
    public long intervalInMilliseconds = 500l;
    
    /** Wait until the "until" condition returns true or the timeout happens
     * 
     * @param message the failure message
     */
    public void wait(String message) {
        long start = System.currentTimeMillis();
        long end = start + timeoutInMilliseconds;
        while (System.currentTimeMillis() < end) {
            if (until()) return;
            try {
                Thread.sleep(intervalInMilliseconds);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        throw new WaitTimedOutException(message);
    }
    
    //@SuppressWarnings("serial")
    public class WaitTimedOutException extends RuntimeException {

        public WaitTimedOutException() {
            super();
        }

        public WaitTimedOutException(String message, Throwable cause) {
            super(message, cause);
        }

        public WaitTimedOutException(String message) {
            super(message);
        }

        public WaitTimedOutException(Throwable cause) {
            super(cause);
        }
        
    }
}
