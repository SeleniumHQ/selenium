// ========================================================================
// $Id: ServletHttpContextMBean.java,v 1.6 2004/05/09 20:32:35 gregwilkins Exp $
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

package org.openqa.jetty.jetty.servlet.jmx;

import javax.management.MBeanException;

import org.openqa.jetty.http.jmx.HttpContextMBean;


/* ------------------------------------------------------------ */
/** Web Application MBean.
 * Note that while Web Applications are HttpContexts, the MBean is
 * not derived from HttpContextMBean as they are managed differently.
 *
 * @version $Revision: 1.6 $
 * @author Greg Wilkins (gregw)
 */
public class ServletHttpContextMBean extends HttpContextMBean
{
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     */
    public ServletHttpContextMBean()
        throws MBeanException
    {}

    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();

        defineOperation("addServlet",
                        new String[] {STRING,STRING,STRING},
                        IMPACT_ACTION);
    }
}
