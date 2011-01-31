// ========================================================================
// $Id: HttpListenerMBean.java,v 1.5 2004/05/09 20:32:14 gregwilkins Exp $
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

package org.openqa.jetty.http.jmx;

import javax.management.MBeanException;

import org.openqa.jetty.util.jmx.ThreadedServerMBean;

/* ------------------------------------------------------------ */
/** 
 *
 * @version $Revision: 1.5 $
 * @author Greg Wilkins (gregw)
 */
public class HttpListenerMBean
    extends ThreadedServerMBean
{
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     */
    public HttpListenerMBean()
        throws MBeanException
    {}
    
    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();
        defineAttribute("defaultScheme");
        defineAttribute("lowOnResources",false);
        defineAttribute("outOfResources",false);
        defineAttribute("confidentialPort");
        defineAttribute("confidentialScheme");
        defineAttribute("integralPort");
        defineAttribute("integralScheme"); 
        defineAttribute("bufferSize");  
        defineAttribute("bufferReserve"); 
    }    
}
