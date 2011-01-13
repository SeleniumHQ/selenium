// ========================================================================
// $Id: DumpHandler.java,v 1.14 2005/08/13 00:01:26 gregwilkins Exp $
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

package org.openqa.jetty.http.handler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.servlet.http.Cookie;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.StringUtil;

/* ------------------------------------------------------------ */
/** Dump request handler.
 * Dumps GET and POST requests.
 * Useful for testing and debugging.
 * 
 * @version $Id: DumpHandler.java,v 1.14 2005/08/13 00:01:26 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class DumpHandler extends AbstractHttpHandler
{
    private static Log log = LogFactory.getLog(DumpHandler.class);

    /* ----------------------------------------------------------------- */
    public String realPath(String pathSpec, String path)
    {
        return "";
    }
    
    /* ------------------------------------------------------------ */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
        throws HttpException, IOException
    {
        if (!isStarted())
            return;
        
        // Only handle GET, HEAD and POST
        if (!HttpRequest.__GET.equals(request.getMethod()) &&
            !HttpRequest.__HEAD.equals(request.getMethod()) &&
            !HttpRequest.__POST.equals(request.getMethod()))
            return;

        log.debug("Dump");
        
        response.setField(HttpFields.__ContentType,
                          HttpFields.__TextHtml);
        OutputStream out = response.getOutputStream();
        ByteArrayOutputStream buf = new ByteArrayOutputStream(2048);
        Writer writer = new OutputStreamWriter(buf,StringUtil.__ISO_8859_1);
        writer.write("<HTML><H1>Dump HttpHandler</H1>");
        writer.write("<PRE>\npath="+request.getPath()+
                    "\ncontextPath="+getHttpContext().getContextPath()+
                    "\npathInContext="+pathInContext+
                    "\n</PRE>\n");
        writer.write("<H3>Header:</H3><PRE>");
        writer.write(request.toString());
        writer.write("</PRE>\n<H3>Parameters:</H3>\n<PRE>");
        Set names=request.getParameterNames();
        Iterator iter = names.iterator();
        while(iter.hasNext())
        {
            String name=iter.next().toString();
            List values=request.getParameterValues(name);
            if (values==null || values.size()==0)
            {
                writer.write(name);
                writer.write("=\n");
            }
            else if (values.size()==1)
            {
                writer.write(name);
                writer.write("=");
                writer.write((String)values.get(0));
                writer.write("\n");
            }
            else
            {
                for (int i=0; i<values.size(); i++)
                {
                    writer.write(name);
                    writer.write("["+i+"]=");
                    writer.write((String)values.get(i));
                    writer.write("\n");
                }
            }
        }
        
        String cookie_name=request.getParameter("CookieName");
        if (cookie_name!=null && cookie_name.trim().length()>0)
        {
            String cookie_action=request.getParameter("Button");
            try{
                Cookie cookie=
                    new Cookie(cookie_name.trim(),
                               request.getParameter("CookieVal"));
                if ("Clear Cookie".equals(cookie_action))
                    cookie.setMaxAge(0);
                response.addSetCookie(cookie);
            }
            catch(IllegalArgumentException e)
            {
                writer.write("</PRE>\n<H3>BAD Set-Cookie:</H3>\n<PRE>");
                writer.write(e.toString());
                LogSupport.ignore(log,e);
            }
        }
        
        writer.write("</PRE>\n<H3>Cookies:</H3>\n<PRE>");
        Cookie[] cookies=request.getCookies();
        if (cookies!=null && cookies.length>0)
        {
            for(int c=0;c<cookies.length;c++)
            {
                Cookie cookie=cookies[c];
                writer.write(cookie.getName());
                writer.write("=");
                writer.write(cookie.getValue());
                writer.write("\n");
            }
        }
        
        writer.write("</PRE>\n<H3>Attributes:</H3>\n<PRE>");
        Enumeration attributes=request.getAttributeNames();
        if (attributes!=null && attributes.hasMoreElements())
        {
            while(attributes.hasMoreElements())
            {
                String attr=attributes.nextElement().toString();
                writer.write(attr);
                writer.write("=");
                writer.write(request.getAttribute(attr).toString());
                writer.write("\n");
            }
        }
        
        writer.write("</PRE>\n<H3>Content:</H3>\n<PRE>");
        byte[] content= new byte[4096];
        int len;
        try{
            InputStream in=request.getInputStream();
            while((len=in.read(content))>=0)
                writer.write(new String(content,0,len));
        }
        catch(IOException e)
        {
            LogSupport.ignore(log,e);
            writer.write(e.toString());
        }
        
        // You wouldn't normally set a trailer like this, but
        // we don't want to commit the output to force trailers as
        // it makes test harness messy
        request.getAcceptableTransferCodings();
        
        // commit now
        writer.flush();
        response.setIntField(HttpFields.__ContentLength,buf.size()+1000);
        buf.writeTo(out);
        out.flush();
        
        // Now add the response
        buf.reset();
        writer.write("</PRE>\n<H3>Response:</H3>\n<PRE>");
        writer.write(response.toString());
        writer.write("</PRE></HTML>");
        writer.flush();
        for (int pad=998-buf.size();pad-->0;)
            writer.write(" ");
        writer.write("\015\012");
        writer.flush();
        buf.writeTo(out);
            
        request.setHandled(true);
    }
}





