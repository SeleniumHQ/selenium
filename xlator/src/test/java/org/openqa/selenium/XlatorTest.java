package org.openqa.selenium;

import java.io.*;

import junit.framework.*;

/**
 * Unit test for simple App.
 */
public class XlatorTest 
    extends TestCase
{
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

    public void testJava() throws IOException
    {
        String content = Xlator.xlateTestCase("java-rc", Xlator.loadResource("/tests/TestClick.html"));
		// TODO we have to write it to appropriate directory
		File dir = new File("target/generated-test");
		dir.mkdirs();
		File testFile = new File(dir, "NewTest.java");
		Writer writer = new OutputStreamWriter(new FileOutputStream(testFile), "UTF-8");
		writer.write(content);
		writer.close();
    }
    
    public void testCsharp() throws IOException
    {
        Xlator.xlateTestCase("cs-rc", Xlator.loadResource("/tests/TestClick.html"));
    }
    
    public void testPerl() throws IOException
    {
        Xlator.xlateTestCase("perl-rc", Xlator.loadResource("/tests/TestClick.html"));
    }
    
    public void testRuby() throws IOException
    {
        Xlator.xlateTestCase("ruby-rc", Xlator.loadResource("/tests/TestClick.html"));
    }
    
    public void testPython() throws IOException
    {
        Xlator.xlateTestCase("python-rc", Xlator.loadResource("/tests/TestClick.html"));
    }
}
