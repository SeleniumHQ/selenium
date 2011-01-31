// ========================================================================
// $Id: Forward.java,v 1.9 2005/08/13 00:01:28 gregwilkins Exp $
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
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

/* ------------------------------------------------------------ */
/** Forward Servlet Request.
 * This servlet can be configured with init parameters to use
 * a RequestDispatcher to forward requests.
 *
 * The servlet path of a request is used to look for a initparameter
 * of that name. If a parameter is found, it's value is used to get a
 * RequestDispatcher.
 *
 * @version $Id: Forward.java,v 1.9 2005/08/13 00:01:28 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class Forward extends HttpServlet
{
    private static Log log = LogFactory.getLog(Forward.class);

    /* ------------------------------------------------------------ */
    Map _forwardMap= new HashMap();

    /* ------------------------------------------------------------ */
    public void init(ServletConfig config)
         throws ServletException
    {
        super.init(config);

        Enumeration enm = config.getInitParameterNames();
        while (enm.hasMoreElements())
        {
            String path=(String)enm.nextElement();
            String forward=config.getInitParameter(path);
            _forwardMap.put(path,forward);
        }

    }
    
    /* ------------------------------------------------------------ */
    public void doPost(HttpServletRequest sreq, HttpServletResponse sres) 
        throws ServletException, IOException
    {
        doGet(sreq,sres);
    }
    
    /* ------------------------------------------------------------ */
    public void doGet(HttpServletRequest sreq, HttpServletResponse sres) 
        throws ServletException, IOException
    {
        String path = (String)
            sreq.getAttribute("javax.servlet.include.servlet_path");
        if (path==null)
            path=sreq.getServletPath();
        if (path.length()==0)
        {
            path=(String)sreq.getAttribute("javax.servlet.include.path_info");
            if (path==null)
                path=sreq.getPathInfo();
        }

        String forward=(String)_forwardMap.get(path);
        if(log.isDebugEnabled())log.debug("Forward "+path+" to "+forward);
        if (forward!=null)
        {            
            ServletContext context =
                getServletContext().getContext(forward);
            String contextPath=sreq.getContextPath();
            if (contextPath.length()>1)
                forward=forward.substring(contextPath.length());
            
            RequestDispatcher dispatch =
                context.getRequestDispatcher(forward);
            if (dispatch!=null)
            {
                dispatch.forward(sreq,sres);
                return;
            }
        }

        sres.sendError(404);
    }

    /* ------------------------------------------------------------ */
    public String getServletInfo()
    {
        return "Forward Servlet";
    }

    /* ------------------------------------------------------------ */
    public synchronized void destroy()
    {
        log.debug("Destroyed");
    }
    
}
