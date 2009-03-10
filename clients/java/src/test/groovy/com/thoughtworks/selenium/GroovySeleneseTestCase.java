//
// Generated stub from file:/scm/oss/selenium-rc/clients/java/src/main/groovy/com/thoughtworks/selenium/GroovySeleneseTestCase.groovy
//

package com.thoughtworks.selenium;

import java.lang.*;
import java.io.*;
import java.net.*;
import java.util.*;
import groovy.lang.*;
import groovy.util.*;

/**
 * The Groovy equivalent of SeleneseTestCase, as a GroovyTestCase.
 */
public class GroovySeleneseTestCase
    extends GroovyTestCase
{
    public static final java.lang.Object BASE_METHODS = null;

    protected GroovySelenium selenium = null;

    private SeleneseTestBase base = null;

    private int defaultTimeout = 0;

    private GroovySeleneseTestCase(java.lang.Void void1, java.lang.Void void2, java.lang.Void void3) {
        throw new InternalError("Stubbed method");
    }

    public GroovySeleneseTestCase() {
        this((java.lang.Void)null, (java.lang.Void)null, (java.lang.Void)null);
        throw new InternalError("Stubbed method");
    }

    public void setUp(java.lang.String url, java.lang.String browserString, int port) {
        throw new InternalError("Stubbed method");
    }

    public void tearDown() {
        throw new InternalError("Stubbed method");
    }

    /**
     * Returns the delegate for most Selenium API calls.
     */
    public SeleneseTestBase getBase() {
        throw new InternalError("Stubbed method");
    }

    public void setDefaultTimeout(int timeout) {
        throw new InternalError("Stubbed method");
    }

    public void setAlwaysCaptureScreenshots(boolean capture) {
        throw new InternalError("Stubbed method");
    }

    public void setCaptureScreenshotOnFailure(boolean capture) {
        throw new InternalError("Stubbed method");
    }

    public void setTestContext() {
        throw new InternalError("Stubbed method");
    }

    /**
     * Convenience method for conditional waiting. Returns when the condition
     * is satisfied, or fails the test if the timeout is reached.
     *
     * @param timeout maximum time to wait for condition to be satisfied, in
milliseconds. If unspecified, the default timeout is
used; the default value can be set with
setDefaultTimeout().
     * @param condition the condition to wait for. The Closure should return
true when the condition is satisfied.
     */
    public void waitFor(int timeout, Closure condition) {
        throw new InternalError("Stubbed method");
    }

    /**
     * Delegates missing method calls to the SeleneseTestBase object where
     * possible.
     *
     * @param name
     * @param args
     */
    public java.lang.Object methodMissing(java.lang.String name, java.lang.Object args) {
        throw new InternalError("Stubbed method");
    }

    public groovy.lang.MetaClass getMetaClass() {
        throw new InternalError("Stubbed method");
    }

    public void setMetaClass(groovy.lang.MetaClass metaClass) {
        throw new InternalError("Stubbed method");
    }

    public java.lang.Object invokeMethod(java.lang.String name, java.lang.Object args) {
        throw new InternalError("Stubbed method");
    }

    public java.lang.Object getProperty(java.lang.String name) {
        throw new InternalError("Stubbed method");
    }

    public void setProperty(java.lang.String name, java.lang.Object value) {
        throw new InternalError("Stubbed method");
    }
}
