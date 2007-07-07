package com.thoughtworks.selenium;

import com.thoughtworks.selenium.Wait.WaitTimedOutException;

import junit.framework.TestCase;

public class WaitTest extends TestCase {

    private long finished;
    private long now;
    private int tries = 0;
    
    public void setUp() {
        now = System.currentTimeMillis();
    }
    
    public void testUntil() {
        finished = now + 500l;
        new Wait() {
            public boolean until() {
                tries++;
                return System.currentTimeMillis() > finished;
            }
        }.wait("clock stopped");
        assertTrue("didn't try enough times: " + tries, tries > 1);
    }
    
    public void testTimedOut() {
        finished = now + 5000l;
        try {
            new Wait() {
                public boolean until() {
                    tries++;
                    return System.currentTimeMillis() > finished;
                }
            }.wait("timed out as expected", 500, 50);
            fail("expected timeout");
        } catch (WaitTimedOutException e) {
            assertTrue("didn't wait long enough", System.currentTimeMillis() > 500);
            assertTrue("didn't try enough times: " + tries, tries > 9);
        }
    }

}
