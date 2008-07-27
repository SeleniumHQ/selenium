/*
 * Created on Mar 17, 2006
 *
 */
package com.thoughtworks.selenium;

import java.io.*;

import junit.framework.*;

public class ResourceAvailabilityTest extends TestCase {

    public void testResourceAvailable() {
        InputStream s = ResourceAvailabilityTest.class.getResourceAsStream("/core/RemoteRunner.html");
        assertNotNull("RemoteRunner can't be found!", s);
    }
}
