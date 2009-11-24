// ========================================================================
// $Id: TestRequest.java,v 1.13 2004/12/08 03:40:28 gregwilkins Exp $
// Copyright 1999-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.http;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.servlet.http.Cookie;

import junit.framework.TestSuite;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.URI;

/* ------------------------------------------------------------ */
/** Test HTTP Request.
 *
 * @version $Id: TestRequest.java,v 1.13 2004/12/08 03:40:28 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class TestRequest extends junit.framework.TestCase
{
    private static Log log = LogFactory.getLog(TestRequest.class);
    
    
    public TestRequest(String name)
    {
        super(name);
    }
    
    public static junit.framework.Test suite() {
        return new TestSuite(TestRequest.class);
    }
    
    /* ------------------------------------------------------------ */
    
    public static void main(String[] args)
    {
        junit.textui.TestRunner.run(suite());
    }
    
    
    
    /* --------------------------------------------------------------- */
    public HttpRequest getRequest(String data)
    throws IOException
    {
        return getRequest(data.getBytes());
    }
    
    /* --------------------------------------------------------------- */
    public HttpRequest getRequest(byte[] data)
    throws IOException
    {
        ByteArrayInputStream in = new ByteArrayInputStream(data);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        HttpConnection connection = new HttpConnection(null,null,in,out,null);
        
        HttpRequest request = new HttpRequest(connection);
        request.readHeader((LineInput)(connection.getInputStream()).getInputStream());
        return request;
    }
    
    /* --------------------------------------------------------------- */
    public void testRequestLine()
    {
        String[] rl =
        {
                "GET /xxx HTTP/1.0",          "GET", "/xxx",    "HTTP/1.0",
                " GET /xxx HTTP/1.0 ",        "GET", "/xxx",    "HTTP/1.0",
                "  PUT  /xxx  HTTP/1.1  ",    "PUT", "/xxx",    "HTTP/1.1",
                "  GET  /xxx   ",             "GET", "/xxx",    "HTTP/0.9",
                "GET  /xxx",                  "GET", "/xxx",    "HTTP/0.9",
                "  GET  /xxx   ",             "GET", "/xxx",    "HTTP/0.9",
                "GET / ",                     "GET", "/",       "HTTP/0.9",
                "GET /",                      "GET", "/",       "HTTP/0.9",
                "GET http://h:1/ HTTP/1.0",   "GET", "/",       "HTTP/1.0",
                "GET http://h:1/xx HTTP/1.0", "GET", "/xx",     "HTTP/1.0",
                "GET http HTTP/1.0",          "GET", "http",    "HTTP/1.0",
                "GET http://h:1/",            "GET", "/",       "HTTP/0.9",
                "GET http://h:1/xxx",         "GET", "/xxx",    "HTTP/0.9",
                "  GET     ",                 null,  null,      null,
                "GET",                        null,  null,      null,
                "",                           null,  null,      null,
                "Options * http/1.1  ",       "OPTIONS", "*",    "HTTP/1.1",
                "GET /xxx/%%123/blah HTTP/1.0",  null, null,       null,
                "GET http://h:x/ HTTP/1.0",   null, null,       null,
        };
        
        HttpRequest r = new HttpRequest();
        
        try{
            for (int i=0; i<rl.length ; i+=4)
            {
                try{
                    r.decodeRequestLine(rl[i].toCharArray(),rl[i].length());
                    assertEquals(rl[i],rl[i+1],r.getMethod());
                    URI uri=r.getURI();
                    assertEquals(rl[i],rl[i+2],uri!=null?uri.getPath():null);
                    assertEquals(rl[i],rl[i+3],r.getVersion());
                }
                catch(IOException e)
                {
                    if (rl[i+1]!=null)
                        log.warn(LogSupport.EXCEPTION,e);
                    assertTrue(rl[i],rl[i+1]==null);
                }
                catch(IllegalArgumentException e)
                {
                    if (rl[i+1]!=null)
                        log.warn(LogSupport.EXCEPTION,e);
                    assertTrue(rl[i],rl[i+1]==null);
                }
            }
        }
        catch(Exception e)
        {
            log.warn("failed",e);
            assertTrue(false);
        }
    }
    
    
    /* --------------------------------------------------------------- */
    public void testParameters()
    throws Exception
    {      
        HttpRequest request=null;
        
        
        // No params
        request=getRequest("GET /R1 HTTP/1.0\n"+
                "Content-Type: text/plain\n"+
                "Content-Length: 5\n"+
                "\n"+
        "123\015\012");
        if(log.isDebugEnabled())log.debug("Request: "+request);
        assertEquals("No parameters",0,request.getParameterNames().size());
        
        
        // Query params
        request=getRequest("GET /R1 HTTP/1.0\n"+
                "Content-Type: text/plain\n"+
                "Content-Length: 5\n"+
                "\n"+
        "123\015\012");
        if(log.isDebugEnabled())log.debug("Request: "+request);
        assertEquals("No query",null,request.getQuery());
        
        request=getRequest("GET /R1?A=1,2,3&B=4&B=5&B=6 HTTP/1.0\n"+
                "Content-Type: text/plain\n"+
                "Content-Length: 5\n"+
                "\n"+
        "123\015\012");
        if(log.isDebugEnabled())log.debug("Request: "+request);
        assertEquals("Query parameters",2,request.getParameterNames().size());
        assertEquals("Single Query","1,2,3",request.getParameter("A"));
        assertEquals("Multi as Single","4",request.getParameter("B"));
        assertEquals("Single as Multi",1,request.getParameterValues("A").size());
        assertEquals( "Single as Multi","1,2,3",request.getParameterValues("A").get(0));
        assertEquals( "Multi query","4",request.getParameterValues("B").get(0));
        assertEquals( "Multi query","5",request.getParameterValues("B").get(1));
        assertEquals( "Multi query","6",request.getParameterValues("B").get(2));
        
        
        // Form params
        request=getRequest("GET /R1 HTTP/1.0\n"+
                "Content-Type: text/plain\n"+
                "Content-Length: 15\n"+
                "\n"+
        "B=7&C=8&D=9&D=A");
        assertEquals("No form wrong type",0,request.getParameterNames().size());
        
        request=getRequest("GET /R1 HTTP/1.0\n"+
                "Content-Type: application/x-www-form-urlencoded\n"+
                "Content-Length: 15\n"+
                "\n"+
        "B=7&C=8&D=9&D=A");
        assertEquals("No form GET",0,request.getParameterNames().size());
        
        request=getRequest("POST /R1 HTTP/1.0\n"+
                "Content-Type: application/x-www-form-urlencoded\n"+
                "Content-Length: 15\n"+
                "\n"+
        "B=7&C=8&D=9&D=A");
        assertEquals("Form not read yet",15,request.getInputStream().available());
        assertEquals("Form parameters",3,request.getParameterNames().size());
        assertEquals("Form read",0,request.getInputStream().available());
        assertEquals("Form single param","7",request.getParameter("B"));
        assertEquals("Form single param","8",request.getParameter("C"));
        assertEquals("Form Multi",2,request.getParameterValues("D").size());
        assertEquals( "Form Multi","9",request.getParameterValues("D").get(0));
        assertEquals( "Form Multi","A",request.getParameterValues("D").get(1));
        
        // Query and form params
        
        request=getRequest("POST /R1?A=1,2,3&B=4&B=5&B=6 HTTP/1.0\n"+
                "Content-Type: application/x-www-form-urlencoded\n"+
                "Content-Length: 15\n"+
                "\n"+
        "B=7&C=8&D=9&D=A");
        assertEquals("Form not read yet",15,request.getInputStream().available());
        assertEquals("Form and query params",4,request.getParameterNames().size());
        assertEquals("Form read",0,request.getInputStream().available());
        
        assertEquals("Single Query","1,2,3",request.getParameter("A"));
        assertEquals("Merge as Single","4",request.getParameter("B"));
        assertEquals( "Merged multi","4",request.getParameterValues("B").get(0));
        assertEquals( "Merged multi","5",request.getParameterValues("B").get(1));
        assertEquals( "Merged multi","6",request.getParameterValues("B").get(2));
        assertEquals( "Merged multi","7",request.getParameterValues("B").get(3));
        assertEquals("Form single param","8",request.getParameter("C"));
        assertEquals("Form Multi",2,request.getParameterValues("D").size());
        assertEquals( "Form Multi","9",request.getParameterValues("D").get(0));
        assertEquals( "Form Multi","A",request.getParameterValues("D").get(1));
        
    }
    
    /* --------------------------------------------------------------- */
    public void testMimeTypes()
    {     
        HttpContext c = new HttpContext(null,"/");
        c.getMimeMap();
        
        assertEquals("index.html","text/html",c.getMimeByExtension("index.html"));
        assertEquals("index.html","text/css",c.getMimeByExtension("style.css"));
        assertEquals("index.html","application/pdf",c.getMimeByExtension("doc.pdf"));
        assertEquals("index.html","text/html",c.getMimeByExtension("blah/index.html"));
        assertEquals("index.html","text/css",c.getMimeByExtension("blah/style.css"));
        assertEquals("index.html","application/pdf",c.getMimeByExtension("blah/doc.pdf"));
        assertEquals("index.html","text/html",c.getMimeByExtension("blah/my.index.html"));
        assertEquals("index.html","text/css",c.getMimeByExtension("blah/my.style.css"));
        assertEquals("index.html","application/pdf",c.getMimeByExtension("blah/my.doc.pdf"));
        
        assertEquals("index.html","text/html",c.getMimeByExtension("index.HTML"));
        assertEquals("index.html","text/css",c.getMimeByExtension("style.CSS"));
        assertEquals("index.html","application/pdf",c.getMimeByExtension("doc.PDF"));
        assertEquals("index.html","text/html",c.getMimeByExtension("blah/index.htMl"));
        assertEquals("index.html","text/css",c.getMimeByExtension("blah/style.cSs"));
        assertEquals("index.html","application/pdf",c.getMimeByExtension("blah/doc.pDf"));
        assertEquals("index.html","text/html",c.getMimeByExtension("blah/my.index.Html"));
        assertEquals("index.html","text/css",c.getMimeByExtension("blah/my.style.Css"));
        assertEquals("index.html","application/pdf",c.getMimeByExtension("blah/my.doc.Pdf"));
        
    }
    

    /* --------------------------------------------------------------- */
    public void testCookies()
    throws Exception
    {      
        HttpRequest request=null;
        
        // No params
        request=getRequest("GET /R1 HTTP/1.0\n"+
                "Cookie: Client=Winston Churchill\n"+
                "Cookie: $Version=\"1\"; Customer=\"WILE_E_COYOTE\"; $Path=\"/acme\"\n"+
                "Cookie: $version=1; Rodent=Howard; \n"+
                "\n");
        
        Cookie[] cookies = request.getCookies();
        
        assertEquals(cookies.length,3);
        boolean seen_winston=false;
        boolean seen_wiley=false;
        boolean seen_jonny=false;
        for (int i=0;i<cookies.length;i++)
        {
            Cookie cookie = cookies[i];
            
            if ("Rodent".equals(cookie.getName()))
            {
                assertEquals("Howard",cookie.getValue());
                assertEquals(1,cookie.getVersion());
                seen_jonny=true;
            }
            else if ("Customer".equals(cookie.getName()))
            {
                assertEquals("WILE_E_COYOTE",cookie.getValue());
                assertEquals(1,cookie.getVersion());
                assertEquals("/acme",cookie.getPath());
                seen_wiley=true;
            }
            else if ("Client".equals(cookie.getName()))
            {
                assertEquals("Winston Churchill",cookie.getValue());
                assertEquals(0,cookie.getVersion());
                assertEquals(null,cookie.getPath());
                seen_winston=true;
            }
            else
                assertTrue(false);
        }

       assertTrue(seen_wiley);
       assertTrue(seen_winston);
       assertTrue(seen_jonny);

    }
    
}
