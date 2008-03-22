package org.openqa.selenium;

import java.util.*;

import junit.framework.*;

/**
 * Unit test for simple App.
 */
public class XlatorTest 
    extends TestCase
{
    
    private HashMap<String, String> options;
    
    public void setUp() {
        options = new HashMap<String, String>();
        options.put("foo", "bar");
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
        Xlator.xlateTestCase("TestClick", "java-rc", Xlator.loadResource("/tests/TestClick.html"), options);
    }
    
    public void testCsharp() throws Exception
    {
        Xlator.xlateTestCase("TestClick", "cs-rc", Xlator.loadResource("/tests/TestClick.html"), options);
    }
    
    public void testPerl() throws Exception
    {
        Xlator.xlateTestCase("TestClick", "perl-rc", Xlator.loadResource("/tests/TestClick.html"), options);
    }
    
    public void testRuby() throws Exception
    {
        Xlator.xlateTestCase("TestClick", "ruby-rc", Xlator.loadResource("/tests/TestClick.html"), options);
    }
    
    public void testPython() throws Exception
    {
        Xlator.xlateTestCase("TestClick", "python-rc", Xlator.loadResource("/tests/TestClick.html"), options);
    }
}
