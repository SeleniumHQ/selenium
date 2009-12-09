// ========================================================================
// $Id: SendRedirect.java,v 1.6 2005/08/13 00:01:28 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.servlet;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.html.Heading;
import org.openqa.jetty.html.Page;
import org.openqa.jetty.html.TableForm;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.URI;

/* ------------------------------------------------------------ */
/** Dump Servlet Request.
 * 
 */
public class SendRedirect extends HttpServlet
{
    private static Log log = LogFactory.getLog(SendRedirect.class);

    /* ------------------------------------------------------------ */
    public void doGet(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException
    {
        response.setContentType("text/html");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-cache,no-store");

        String url=request.getParameter("URL");
        if (url!=null && url.length()>0)
        {
            response.sendRedirect(url);
        }
        else
        {
            PrintWriter pout = response.getWriter();
            Page page=null;
            
            try{
                page = new Page();
                page.title("SendRedirect Servlet");     
                
                page.add(new Heading(1,"SendRedirect Servlet"));
                
                page.add(new Heading(1,"Form to generate Dump content"));
                TableForm tf = new TableForm
                    (response.encodeURL(URI.addPaths(request.getContextPath(),
                                                     request.getServletPath())+
                                        "/action"));
                tf.method("GET");
                tf.addTextField("URL","URL",40,request.getContextPath()+"/dump");
                tf.addButton("Redirect","Redirect");
                page.add(tf);
                page.write(pout);
                pout.close();
            }
            catch (Exception e)
            {
                log.warn(LogSupport.EXCEPTION,e);
            }
        }
    }

}
