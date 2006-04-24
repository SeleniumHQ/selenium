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


import junit.framework.*;

import org.openqa.selenium.server.*;

/**
 * @author Nelson Sproul (nsproul@bea.com) Mar 13-06
 */
public class SeleneseTestCase extends TestCase {

    protected Selenium selenium;
    protected static StringBuffer verificationErrors = new StringBuffer(); 

    protected void setUp() throws Exception {
        super.setUp();
        this.setUp(null);
    }

    protected void setUp(String url) throws Exception {
        super.setUp();
        if (url==null) {
            url = "http://localhost:" + SeleniumServer.DEFAULT_PORT;
        }
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*iexplore", url);
        selenium.start();
    }

    public void verifyTrue(boolean b) {
        try {
            assertTrue(b);
        } catch (Exception e) {
            verificationErrors.append(e);
        }
    }
    
    public void verifyFalse(boolean b) {
        try {
            assertFalse(b);
        } catch (Exception e) {
            verificationErrors.append(e);
        }
    }
    
    protected String getText() {
        return selenium.getEval("this.page().bodyText()");
    }

    public static void verifyEquals(Object s1, Object s2) {
        try {
            assertEquals(s1, s2);
        } catch (Exception e) {
            verificationErrors.append(e);
        }
    }
    

    public static void assertEquals(Object s1, Object s2) {
        if (s1 instanceof String && s2 instanceof String) {
            assertEquals((String)s1, (String)s2);
        }
        else {
            Assert.assertEquals(s1, s2);
        }
    }
    
    public static void assertEquals(String s1, String s2) {
        assertTrue(seleniumEquals(s1, s2));
    }
    
    public static boolean seleniumEquals(String s1, String s2) {
        if (s2.startsWith("regexp:")) {
            String tmp = s2;
            s2 = s1;
            s1 = tmp;
        }
        if (s1.startsWith("regexp:")) {
            String s1regexp = s1.replaceFirst("regexp:", ".*") + ".*";
            if (!s2.matches(s1regexp)) {
                System.out.println("expected " + s2 + " to match regexp " + s1);
                return false;                    
            }
            return true;
        }
        
        if (s1.startsWith("exact:")) {
            String s1exact = s1.replaceFirst("exact:", "");
            if (!s1exact.equals(s2)) {
                System.out.println("expected " + s2 + " to match " + s1);
                return false;
            }
            return true;
        }
        
        String s1glob = s1.replaceFirst("glob:", ".*")
        .replaceAll("\\*", ".*")
        .replaceAll("[\\]\\[\\$\\(\\).]", "\\\\$1")
        .replaceAll("\\.", "\\\\.")
        .replaceAll("\\?", ".") + ".*";
        if (!s2.matches(s1glob)) {
            System.out.println("expected " + s2 + " to match glob " + s1 + " (had transformed the glob into regexp:" + s1glob);
            return false;
        }
        return true;
    }
    
    public static boolean seleniumEquals(Object s1, Object s2) {
        if (s1 instanceof String && s2 instanceof String) {
            return seleniumEquals((String)s1, (String)s2);
        }
        return s1.equals(s2);
    }
    
    public static void verifyEquals(String[] s1, String[] s2) {
        verifyEquals(new Integer(s1.length), new Integer(s2.length));
        if (s1.length==s2.length) {
            for (int j = 0; j < s1.length; j++) {
                verifyEquals(s1[j], s2[j]);
            }
        }
    }
    
    public static void verifyNotEquals(String s1, String s2) {
        try {
            assertNotEquals(s1, s2);
        } catch (Exception e) {
            verificationErrors.append(e);
        }
    }
    
    public static void assertNotEquals(Object obj1, Object obj2) {
        if (obj1.equals(obj2)) {
            fail("did not expect values to be equal (" + obj1.toString() + ")");
        }
    }
    
    protected void pause(int millisecs) {
        try {
            Thread.sleep(millisecs);
        } catch (InterruptedException e) {
        }
    }
    
    protected String quote(String value) {
        return "'" + value.replaceAll("'", "\\'") + "'";
    }
    
    public void checkForVerificationErrors() {
        assertEquals("", verificationErrors.toString());
    }
    
    protected void tearDown() throws Exception {
        selenium.stop();
    }
}
