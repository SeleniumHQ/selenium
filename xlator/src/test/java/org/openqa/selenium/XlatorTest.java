package org.openqa.selenium;

import java.util.Arrays;
import java.util.HashMap;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.MemoryHandler;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Unit test for simple App.
 */
public class XlatorTest 
    extends TestCase
{
    
    private static final String RESOURCE = "/tests/TestSelectWindow.html";
    private static final String NAME = "TestSelectWindow";
    private HashMap<String, String> options;
    private Logger log;
    private String baseUrl = "http://foo.com";
    
    public void setUp() {
        options = new HashMap<String, String>();
        options.put("foo", "bar");
        options.put("packageName", "bar");
        log = Logger.getAnonymousLogger();
        log.setUseParentHandlers(false);
    }
    
    /**
     * Create the test case
     *
     * @param testName name of the test case
     */
    public XlatorTest( String testName )
    {
        super( testName );
    }

    /**
     * @return the suite of tests being tested
     */
    public static Test suite()
    {
        return new TestSuite( XlatorTest.class );
    }

    public void testJava() throws Exception
    {
        
        Xlator.xlateTestCase(NAME, baseUrl, "java-rc", Xlator.loadResource(RESOURCE), options, log);
    }
    
    public void testJavaTestNg() throws Exception
    {
        Xlator.xlateTestCase(NAME, baseUrl, "java-rc-testng", Xlator.loadResource(RESOURCE), options, null);
    }
    
    public void testCsharp() throws Exception
    {
        Xlator.xlateTestCase(NAME, baseUrl, "cs-rc", Xlator.loadResource(RESOURCE), options, null);
    }
    
    public void testPerl() throws Exception
    {
        Xlator.xlateTestCase(NAME, baseUrl, "perl-rc", Xlator.loadResource(RESOURCE), options, null);
    }
    
    public void testRuby() throws Exception
    {
        Xlator.xlateTestCase(NAME, baseUrl, "ruby-rc", Xlator.loadResource(RESOURCE), options, null);
    }
    
    public void testPython() throws Exception
    {
        Xlator.xlateTestCase(NAME, baseUrl, "python-rc", Xlator.loadResource(RESOURCE), options, null);
    }
}
