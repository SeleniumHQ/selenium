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
    
    /** Returns true when it's time to stop waiting */
    abstract boolean until();
    
    /** The amout of time to wait before giving up; the default is 30 seconds */
    public long timeout = 30000l;
    
    /** The interval to pause between checking; the default is 50 milliseconds */ 
    public long interval = 50l;
    
    /** Wait until the "until" condition returns true or the timeout happens
     * 
     * @param message the failure message
     */
    public void wait(String message) {
        long start = System.currentTimeMillis();
        long end = start + timeout;
        while (System.currentTimeMillis() < end) {
            if (until()) return;
            try {
                Thread.sleep(interval);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        //Assert.fail(message);
        throw new RuntimeException("Assert.fail(" + message + ")"); // ugly, yes, but I just want to be sure this doesn't fail silently
    }
}
