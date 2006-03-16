/*
 * Created on Feb 27, 2006
 *
 */
package com.thoughtworks.selenium;

import java.lang.reflect.*;
import java.util.*;

import org.openqa.selenium.server.*;

import junit.framework.*;

public class SeleniumAPITest extends TestCase {

    SeleniumProxy server;
    Selenium selenium;
    Set driverMethodNames;
    
    protected void setUp() throws Exception {
        super.setUp();
        server = new SeleniumProxy(SeleniumProxy.DEFAULT_PORT);
        server.start();
        prepareDriverMethodNames();
        selenium = new DefaultSelenium("localhost", SeleniumProxy.DEFAULT_PORT, "*firefox", "http://localhost:" + SeleniumProxy.DEFAULT_PORT);
        selenium.start();
    }
    
    public void prepareDriverMethodNames() {
        Method[] actionMethods = Selenium.class.getMethods();
        driverMethodNames = new HashSet();
        for (int i = 0; i < actionMethods.length; i++) {
            driverMethodNames.add(actionMethods[i].getName());
        }
    }

    protected void tearDown() throws Exception {
        selenium.stop();
        server.stop();
    }

    public void testActions() throws Exception {
        String[] methodNames = selenium.getAllActions();
        printMethodList(methodNames);
        StringBuffer missingMethods = new StringBuffer();
        boolean methodsAreMissing = false;
        for (int i = 0; i < methodNames.length; i++) { 
            if (!driverMethodNames.contains(methodNames[i])) {
                // DGF Can't we skip the "AndWait" methods?
                if (methodNames[i].endsWith("AndWait")) continue;
                methodsAreMissing = true;
                missingMethods.append('\n').append(methodNames[i]);
            }
        }
        assertFalse("missing methods: " + missingMethods.toString(), methodsAreMissing);
    }
    
    public void testAccessors() {
        String[] methodNames = selenium.getAllAccessors();
        printMethodList(methodNames);
        StringBuffer missingMethods = new StringBuffer();
        boolean methodsAreMissing = false;
        for (int i = 0; i < methodNames.length; i++) {
            if (!driverMethodNames.contains(methodNames[i])) {
                methodsAreMissing = true;
                missingMethods.append('\n').append(methodNames[i]);
            }
        }
        assertFalse("missing methods: " + missingMethods.toString(), methodsAreMissing);
    }
    
    public void testAsserts() {
        Set accessors = new HashSet(Arrays.asList(selenium.getAllAccessors()));
        String[] methodNames = selenium.getAllAsserts();
        printMethodList(methodNames);
        StringBuffer missingMethods = new StringBuffer();
        boolean methodsAreMissing = false;
        for (int i = 0; i < methodNames.length; i++) {
            String method = methodNames[i];
            if (method.startsWith("assert")) continue;
            if (method.startsWith("verifyNot")) continue;
            // Ignore Error/FailureOnNext; that's what try/catch are for
            if (method.equals("verifyErrorOnNext")) continue;
            if (method.equals("verifyFailureOnNext")) continue;
            if (!driverMethodNames.contains(method)) {
                String correspondingAccessor = method.replaceFirst("^verify", "get");
                if (accessors.contains(correspondingAccessor)) continue;
                methodsAreMissing = true;
                missingMethods.append('\n').append(methodNames[i]);
            }
        }
        assertFalse("missing methods: " + missingMethods.toString(), methodsAreMissing);
    }
    
    public void testExtraMethods() {
        Set allCommands = new HashSet(Arrays.asList(selenium.getAllActions()));
        allCommands.addAll(Arrays.asList(selenium.getAllAccessors()));
        allCommands.addAll(Arrays.asList(selenium.getAllAsserts()));
        StringBuffer extraMethods = new StringBuffer();
        boolean tooManyMethods = false;
        for (Iterator i = driverMethodNames.iterator(); i.hasNext();) {
            String methodName = (String) i.next();
            if (methodName.equals("stop")) continue;
            if (methodName.equals("start")) continue;
            if (!allCommands.contains(methodName)) {
                tooManyMethods = true;
                extraMethods.append('\n').append(methodName);
            }
        }
        assertFalse("extra methods: " + extraMethods.toString(), tooManyMethods);
    }

    public void XtestRedundantAssertions() {
        Set accessors = new HashSet(Arrays.asList(selenium.getAllAccessors()));
        String[] methodNames = selenium.getAllAsserts();
        printMethodList(methodNames);
        StringBuffer redundantMethods = new StringBuffer();
        boolean methodsAreRedundant = false;
        for (int i = 0; i < methodNames.length; i++) {
            String method = methodNames[i];
            if (method.startsWith("assert")) continue;
            if (method.startsWith("verifyNot")) continue;
            // Ignore Error/FailureOnNext; that's what try/catch are for
            if (method.equals("verifyErrorOnNext")) continue;
            if (method.equals("verifyFailureOnNext")) continue;
            if (driverMethodNames.contains(method)) {
                String correspondingAccessor = method.replaceFirst("^verify", "get");
                if (accessors.contains(correspondingAccessor)) {
                    methodsAreRedundant = true;
                    redundantMethods.append('\n').append(methodNames[i]);
                }
            }
        }
        assertFalse("redundant methods: " + redundantMethods.toString(), methodsAreRedundant);
    }
    
    private void printMethodList(String[] methodNames) {
        for (int i = 0; i < methodNames.length; i++) {
            System.out.print(methodNames[i]);
            System.out.print(',');
        }
        System.out.println("");
        assertTrue("too short!", methodNames.length > 5);
        
    }
}
