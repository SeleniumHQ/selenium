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
import org.openqa.selenium.server.browserlaunchers.WindowsUtils;

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
      if(WindowsUtils.thisIsWindows()){
	     setUp(url, "*iexplore");
      }else{
	     setUp(url, "*firefox");
      } 
    }
    
    protected void setUp(String url, String browserMode) throws Exception {
        super.setUp();
        int port = SeleniumServer.getDefaultPort();
        if (url==null) {
            url = "http://localhost:" + port;
        }
        selenium = new DefaultSelenium("localhost", port, browserMode, url);
        selenium.start();
    }

    public void verifyTrue(boolean b) {
        try {
            assertTrue(b);
        } catch (AssertionFailedError e) {
            verificationErrors.append(e);
        }
    }
    
    public void verifyFalse(boolean b) {
        try {
            assertFalse(b);
        } catch (AssertionFailedError e) {
            verificationErrors.append(e);
        }
    }
    
    protected String getText() {
        return selenium.getEval("this.page().bodyText()");
    }

    public static void verifyEquals(Object s1, Object s2) {
        try {
            assertEquals(s1, s2);
        } catch (AssertionFailedError e) {
            verificationErrors.append(e);
        }
    }

    public static void assertEquals(Object s1, Object s2) {
        if (s1 instanceof String && s2 instanceof String) {
            assertEquals((String)s1, (String)s2);
        } else if (s1 instanceof String && s2 instanceof Number) {
            assertEquals((String)s1, ((Number)s2).toString());
        }
        else {
            if (s1 instanceof String[] && s2 instanceof String[]) {
                
                String[] sa1 = (String[]) s1;
                String[] sa2 = (String[]) s2;
                if (sa1.length!=sa2.length) {
                    throw new AssertionFailedError("Expected " + sa1 + " but saw " + sa2);
                }
            }
            Assert.assertEquals(s1, s2);
        }
    }
    
    public static void assertEquals(String s1, String s2) {
        assertTrue("Expected \"" + s1 + "\" but saw \"" + s2 + "\" instead", seleniumEquals(s1, s2));
    }
    
    public static boolean seleniumEquals(String s1, String s2) {
        if (s2.startsWith("regexp:") || s2.startsWith("regex:")) {
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
        if (s1.startsWith("regex:")) {
            String s1regexp = s1.replaceFirst("regex:", ".*") + ".*";
            if (!s2.matches(s1regexp)) {
                System.out.println("expected " + s2 + " to match regex " + s1);
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
        
        String s1glob = s1.replaceFirst("glob:", "");
        s1glob = s1glob.replaceAll("([\\]\\[\\\\{\\}$\\(\\)\\|\\^\\+.])", "\\\\$1");

        s1glob = s1glob.replaceAll("\\*", "(.|[\r\n])*");
        s1glob = s1glob.replaceAll("\\?", "(.|[\r\n])");
        if (!s2.matches(s1glob)) {
            System.out.println("expected \"" + s2 + "\" to match glob \"" + s1 + "\" (had transformed the glob into regexp \"" + s1glob + "\"");
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
    
    public static void assertEquals(String[] s1, String[] s2) {
        String comparisonDumpIfNotEqual = verifyEqualsAndReturnComparisonDumpIfNot(s1, s2);
        if (comparisonDumpIfNotEqual!=null) {
            throw new AssertionFailedError(comparisonDumpIfNotEqual);
        }
    }
    
    public static void verifyEquals(String[] s1, String[] s2) {
        String comparisonDumpIfNotEqual = verifyEqualsAndReturnComparisonDumpIfNot(s1, s2);
        if (comparisonDumpIfNotEqual!=null) {
            verificationErrors.append(comparisonDumpIfNotEqual);
        }
    }
    
    private static String verifyEqualsAndReturnComparisonDumpIfNot(String[] s1, String[] s2) {
        boolean misMatch = false;
        if (s1.length != s2.length) {
            misMatch = true;
        }
        for (int j = 0; j < s1.length; j++) {
            if (!seleniumEquals(s1[j], s2[j])) {
                misMatch = true;
                break;
            }
        }
        if (misMatch) {
            return "Expected " + stringArrayToString(s1) + " but saw " + stringArrayToString(s2);
        }
        return null;
    }
    
    private static String stringArrayToString(String[] sa) {
        StringBuffer sb = new StringBuffer("{");
        for (int j = 0; j < sa.length; j++) {
            sb.append(" ")
            .append("\"")
            .append(sa[j])
            .append("\"");            
        }
        sb.append(" }");
        return sb.toString();
    }

    public static void verifyNotEquals(Object s1, Object s2) {
        try {
            assertNotEquals(s1, s2);
        } catch (AssertionFailedError e) {
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
        clearVerificationErrors();
    }

    public void clearVerificationErrors() {
        verificationErrors = new StringBuffer();
    }
    
    protected void tearDown() throws Exception {
        selenium.stop();
    }
}
