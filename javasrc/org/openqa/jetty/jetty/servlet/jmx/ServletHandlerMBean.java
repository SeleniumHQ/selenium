// ========================================================================
// $Id: ServletHandlerMBean.java,v 1.8 2005/08/13 00:01:27 gregwilkins Exp $
// Copyright 200-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.jetty.servlet.jmx;

import java.util.HashMap;

import javax.management.MBeanException;
import javax.management.ObjectName;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.jmx.HttpHandlerMBean;
import org.openqa.jetty.jetty.servlet.ServletHandler;
import org.openqa.jetty.jetty.servlet.SessionManager;

/* ------------------------------------------------------------ */
/** 
 *
 * @version $Revision: 1.8 $
 * @author Greg Wilkins (gregw)
 */
public class ServletHandlerMBean extends HttpHandlerMBean  
{
    /* ------------------------------------------------------------ */
    private static final Log log = LogFactory.getLog(ServletHandlerMBean.class);
    private ServletHandler _servletHandler;
    private HashMap _servletMap = new HashMap();
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     */
    public ServletHandlerMBean()
        throws MBeanException
    {}
    
    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();
        defineAttribute("usingCookies"); 
        defineAttribute("servlets",READ_ONLY,ON_MBEAN);
        defineAttribute("sessionManager",READ_ONLY,ON_MBEAN);
        _servletHandler=(ServletHandler)getManagedResource();
    }

    /* ------------------------------------------------------------ */
    public ObjectName getSessionManager()
    {
        SessionManager sm=_servletHandler.getSessionManager();
        if (sm==null)
            return null;
        ObjectName[] on=getComponentMBeans(new Object[]{sm},null);
        return on[0];
    }

    
    /* ------------------------------------------------------------ */
    public ObjectName[] getServlets()
    {
        return getComponentMBeans(_servletHandler.getServlets(), _servletMap);   
    }
    
    /* ------------------------------------------------------------ */
    public void postRegister(Boolean ok)
    {
        super.postRegister(ok);
        if (ok.booleanValue())
            getSessionManager();
    }
    
    public void postDeregister ()
    {
        destroyComponentMBeans(_servletMap);
        super.postDeregister();
    }
}
