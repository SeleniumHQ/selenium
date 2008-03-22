/*
 * Created on Oct 24, 2006
 *
 */
package com.thoughtworks.selenium;

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
    public Wait() {
    }

    public Wait(String messageToShowIfTimeout) {
        wait(messageToShowIfTimeout, DEFAULT_TIMEOUT, DEFAULT_INTERVAL);
    }

    /** Returns true when it's time to stop waiting */
    public abstract boolean until();
    
    /** The amount of time to wait before giving up; the default is 30 seconds */
    public static final long DEFAULT_TIMEOUT = 30000l;
    
    /** The interval to pause between checking; the default is 500 milliseconds */ 
    public static final long DEFAULT_INTERVAL = 500l;
            
    /** Wait until the "until" condition returns true or time runs out.
     * 
     * @param message the failure message
     * @param timeoutInMilliseconds the amount of time to wait before giving up
     * @throws WaitTimedOutException if "until" doesn't return true until the timeout
     * @see #until()
     */
    public void wait(String message) {
        wait(message, DEFAULT_TIMEOUT, DEFAULT_INTERVAL);
    }
    
    /** Wait until the "until" condition returns true or time runs out.
     * 
     * @param message the failure message
     * @param timeoutInMilliseconds the amount of time to wait before giving up
     * @throws WaitTimedOutException if "until" doesn't return true until the timeout
     * @see #until()
     */
    public void wait(String message, long timeoutInMilliseconds) {
        wait(message, timeoutInMilliseconds, DEFAULT_INTERVAL);
    }
    
    /** Wait until the "until" condition returns true or time runs out.
     * 
     * @param message the failure message
     * @param timeoutInMilliseconds the amount of time to wait before giving up
     * @param intervalInMilliseconds the interval to pause between checking "until"
     * @throws WaitTimedOutException if "until" doesn't return true until the timeout
     * @see #until()
     */
    public void wait(String message, long timeoutInMilliseconds, long intervalInMilliseconds) {
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
    
    public class WaitTimedOutException extends RuntimeException {

        private static final long serialVersionUID = 1L;

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
