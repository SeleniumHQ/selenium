// ========================================================================
// $Id: RootNotFoundHandler.java,v 1.11 2005/08/13 00:01:26 gregwilkins Exp $
// Copyright 2002-2004 Mort Bay Consulting Pty. Ltd.
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
import java.io.OutputStream;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.ByteArrayISO8859Writer;
import org.openqa.jetty.util.StringUtil;

/* ------------------------------------------------------------ */
/** 
 * @version $Id: RootNotFoundHandler.java,v 1.11 2005/08/13 00:01:26 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class RootNotFoundHandler extends NotFoundHandler
{
    private static Log log = LogFactory.getLog(RootNotFoundHandler.class);

    
    /* ------------------------------------------------------------ */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
        throws HttpException, IOException
    {
        log.debug("Root Not Found");
        String method=request.getMethod();
        
        if (!method.equals(HttpRequest.__GET) ||
            !request.getPath().equals("/"))
        {
            // don't bother with fancy format.
            super.handle(pathInContext,pathParams,request,response);
            return;
        }

        response.setStatus(404);
        request.setHandled(true);
        response.setReason("Not Found");
        response.setContentType(HttpFields.__TextHtml);
        
        ByteArrayISO8859Writer writer = new ByteArrayISO8859Writer(1500);

        String uri=request.getPath();
        uri=StringUtil.replace(uri,"<","&lt;");
        uri=StringUtil.replace(uri,">","&gt;");
        
        writer.write("<HTML>\n<HEAD>\n<TITLE>Error 404 - Not Found");
        writer.write("</TITLE>\n<BODY>\n<H2>Error 404 - Not Found.</H2>\n");
        writer.write("No context on this server matched or handled this request.<BR>");
        writer.write("Contexts known to this server are: <ul>");

        HttpContext[] contexts = getHttpContext().getHttpServer().getContexts();
        
        for (int i=0;i<contexts.length;i++)
        {
            HttpContext context = contexts[i];
            writer.write("<li><a href=\"");
            writer.write(context.getContextPath());
            writer.write("/\">");
            writer.write(context.toString());
            writer.write("</a></li>\n");
        }
        
        writer.write("</ul><small><I>The links above may not work if a virtual host is configured</I></small>");

	for (int i=0;i<10;i++)
	    writer.write("\n<!-- Padding for IE                  -->");
	
        writer.write("\n</BODY>\n</HTML>\n");
        writer.flush();
        response.setContentLength(writer.size());
        OutputStream out=response.getOutputStream();
        writer.writeTo(out);
        out.close();
    }
}
