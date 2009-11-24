// ========================================================================
// $Id: TestSetResponseHeadersHandler.java,v 1.3 2004/05/09 20:33:31 gregwilkins Exp $
// Copyright 2003-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.http.handler;

import java.io.IOException;
import java.util.Enumeration;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;

/* ------------------------------------------------------------ */

/**
 * @version $Id: TestSetResponseHeadersHandler.java,v 1.3 2004/05/09 20:33:31 gregwilkins Exp $
 * @author Brett Sealey
 */
public class TestSetResponseHeadersHandler extends TestCase
{
    /* ------------------------------------------------------------ */
    /** Create the named test case.
     * @param name The name of the test case.
     */
    public TestSetResponseHeadersHandler(String name)
    {
        super(name);
    }

    /* ------------------------------------------------------------ */
    /** Get the Test suite for the SetResponseHeadersHandler class.
     * @return A TestSuite for the SetResponseHeadersHandler class.
     */
    public static Test suite()
    {
        return new TestSuite(TestSetResponseHeadersHandler.class);
    }

    /* ------------------------------------------------------------ */
    /** main.
     */
    public static void main(String[] args)
    {
        junit.textui.TestRunner.run(suite());
    }

    /* ------------------------------------------------------------ */
    /**
     * Test the basic unconfigured operation of the SetResponseHeadersHandler
     */
    public void testUnconfigured() throws IOException
    {
        final String testUnchanged="TestUnchanged";
        SetResponseHeadersHandler shh=new SetResponseHeadersHandler();
        HttpRequest request=new HttpRequest();
        HttpResponse response=new HttpResponse();
        response.setField(testUnchanged,testUnchanged);
        assertEquals("Header size not as expected.",
                1,response.getHeader().size());

        shh.handle("","",request,response);

        assertEquals("Header size changed by Handler.",
                1,response.getHeader().size());
        assertEquals(testUnchanged,
                testUnchanged,response.getField(testUnchanged));
    }

    /* ------------------------------------------------------------ */
    /**
     * Test the basic operation of the SetResponseHeadersHandler
     */
    public void testBasicOperation() throws IOException,HttpException
    {
        final String testUnchanged="TestUnchanged";
        final String testReplaced="TestReplaced";
        final String testSingleValued="TestSingleValued";
        final String testMultiValued="TestMultiValued";
        final String[] values={"Value1","Value2"};

        SetResponseHeadersHandler shh=new SetResponseHeadersHandler();
        shh.setHeaderValue(testReplaced,testReplaced);
        shh.setHeaderValue(testSingleValued,testSingleValued);
        shh.setHeaderValues(testMultiValued,values);

        HttpRequest request=new HttpRequest();
        HttpResponse response=new HttpResponse();
        response.setField(testUnchanged,testUnchanged);
        response.setField(testReplaced,"Will be replaced by: " + testReplaced);
        assertEquals("Header size not as expected.",
                2,response.getHeader().size());

        shh.handle("","",request,response);

        assertEquals(testUnchanged,
                testUnchanged,response.getField(testUnchanged));
        assertEquals(testReplaced,
                testReplaced,response.getField(testReplaced));
        assertEquals(testSingleValued,
                testSingleValued,response.getField(testSingleValued));

        Enumeration ve=response.getFieldValues(testMultiValued);
        assertNotNull(testMultiValued,ve);
        for (int i=0;i<values.length;i++)
        {
            assertTrue(testMultiValued+" Empty on "+i,ve.hasMoreElements());
            String v=(String)ve.nextElement();
            assertEquals(testMultiValued+" values["+i+"]",values[i],v);
        }
        assertTrue(testMultiValued+" Too many values",!ve.hasMoreElements());
    }
}
