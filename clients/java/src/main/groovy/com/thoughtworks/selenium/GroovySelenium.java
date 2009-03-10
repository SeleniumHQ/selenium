//
// Generated stub from file:/scm/oss/selenium-rc/clients/java/src/main/groovy/com/thoughtworks/selenium/GroovySelenium.groovy
//

package com.thoughtworks.selenium;

import java.lang.*;
import java.io.*;
import java.net.*;
import java.util.*;
import groovy.lang.*;
import groovy.util.*;
import java.util.regex.Pattern;

/**
 * Decorates a real Selenium object to add some convenient behaviors.
 * Additional behaviors can be added by extending this class and extending or
 * overriding postSuccess() and postFailure().
 */
public class GroovySelenium
    extends java.lang.Object
{
    static final private java.lang.Object PATTERN_AND_WAIT = null;
    static final public java.lang.Object getPATTERN_AND_WAIT() {
        throw new InternalError("Stubbed method");
    }

    private Selenium selenium = null;

    private int defaultTimeout = 0;

    private boolean alwaysCaptureScreenshots = false;

    private boolean captureScreenshotOnFailure = false;

    private File screenshotDir = null;

    private java.lang.Object generator = null;

    private int screenshotCounter = 0;

    private GroovySelenium(java.lang.Void void1, java.lang.Void void2, java.lang.Void void3) {
        throw new InternalError("Stubbed method");
    }

    public GroovySelenium(Selenium selenium) {
        this((java.lang.Void)null, (java.lang.Void)null, (java.lang.Void)null);
        throw new InternalError("Stubbed method");
    }

    /**
     * Sets the timeout used when waiting for pages to load.
     *
     * @param timeout in milliseconds
     */
    public void setDefaultTimeout(int timeout) {
        throw new InternalError("Stubbed method");
    }

    /**
     * If true is passed in, we will attempt to capture a screenshot of the
     * application whenever a Selenium command finishes, whether it failed or
     * not.
     *
     * @param capture
     */
    public void setAlwaysCaptureScreenshots(boolean capture) {
        throw new InternalError("Stubbed method");
    }

    /**
     * If true is passed in, we will attempt to capture a screenshot of the
     * application whenever a Selenium command fails.
     *
     * @param capture
     */
    public void setCaptureScreenshotOnFailure(boolean capture) {
        throw new InternalError("Stubbed method");
    }

    /**
     * Sets the directory in which screenshots will be generated.
     *
     * @param dir
     */
    public void setScreenshotDir(File dir) {
        throw new InternalError("Stubbed method");
    }

    /**
     * Sets the logic used to generate screenshot filenames. The name of the
     * failed command is passed into the generator.
     *
     * @param generator an object with a generate() method, which returns a
String representing a file name. See the generate
method for this class as an example.
     */
    public void setScreenshotFileNameGenerator(java.lang.Object generator) {
        throw new InternalError("Stubbed method");
    }

    protected java.lang.String generate(File screenshotDir, java.lang.String label) {
        throw new InternalError("Stubbed method");
    }

    /**
     * Called when a Selenium command succeeds. The Selenium object is passed
     * in.
     *
     * @param selenium the selenium instance
     * @param command the name of the command that succeeded
     */
    protected void postSuccess(java.lang.Object selenium, java.lang.String command) {
        throw new InternalError("Stubbed method");
    }

    /**
     * Called when a Selenium command fails. The Selenium object is passed in.
     *
     * @param selenium the selenium instance
     * @param command the name of the command that failed
     */
    protected void postFailure(java.lang.Object selenium, java.lang.String command) {
        throw new InternalError("Stubbed method");
    }

    /**
     * Captures a screenshot using the wrapped Selenium instance.
     *
     * @param label an identifying label to include in the name of the created
screenshot
     */
    public void captureScreenshot(java.lang.String label) {
        throw new InternalError("Stubbed method");
    }

    /**
     * Delegates missing method calls to the wrapped Selenium object where
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
