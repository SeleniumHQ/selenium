// ========================================================================
// $Id: ResourceHandlerMBean.java,v 1.3 2004/05/09 20:32:13 gregwilkins Exp $
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

package org.openqa.jetty.http.handler.jmx;

import javax.management.MBeanException;

import org.openqa.jetty.http.jmx.HttpHandlerMBean;

/* ------------------------------------------------------------ */
/** 
 *
 * @version $Revision: 1.3 $
 * @author Greg Wilkins (gregw)
 */
public class ResourceHandlerMBean extends HttpHandlerMBean  
{
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     */
    public ResourceHandlerMBean()
        throws MBeanException
    {}
    
    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();
        defineAttribute("allowedMethods"); 
        defineAttribute("dirAllowed"); 
        defineAttribute("acceptRanges"); 
        defineAttribute("redirectWelcome"); 
        defineAttribute("minGzipLength"); 
    }    
}
