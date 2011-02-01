// ========================================================================
// $Id: WebApplicationHandlerMBean.java,v 1.9 2005/08/13 00:01:27 gregwilkins Exp $
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

package org.openqa.jetty.jetty.servlet.jmx;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.management.MBeanException;
import javax.management.ObjectName;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.jetty.servlet.WebApplicationHandler;


/* ------------------------------------------------------------ */
/** 
 *
 * @version $Revision: 1.9 $
 * @author Greg Wilkins (gregw)
 */
public class WebApplicationHandlerMBean extends ServletHandlerMBean
{
    /* ------------------------------------------------------------ */
    private static final Log log = LogFactory.getLog (WebApplicationHandlerMBean.class);
    private WebApplicationHandler _webappHandler;
    private Map _filters = new HashMap();
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     */
    public WebApplicationHandlerMBean()
        throws MBeanException
    {}
    
    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();
        defineAttribute("acceptRanges"); 
        defineAttribute("filterChainsCached"); 
        defineAttribute("filters",READ_ONLY,ON_MBEAN);
        _webappHandler=(WebApplicationHandler)getManagedResource();
    }

    /* ------------------------------------------------------------ */
    public ObjectName[] getFilters()
    {
        List l=_webappHandler.getFilters();
        return getComponentMBeans(l.toArray(),_filters);  
    }
    
    public void postDeregister ()
    {
       destroyComponentMBeans(_filters);
        super.postDeregister();
    }
}
