// ========================================================================
// $Id: ThreadedServerMBean.java,v 1.9 2004/10/27 23:09:17 gregwilkins Exp $
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

package org.openqa.jetty.util.jmx;

import javax.management.MBeanException;

import org.openqa.jetty.util.ThreadedServer;

/* ------------------------------------------------------------ */
/** 
 *
 * @version $Revision: 1.9 $
 * @author Greg Wilkins (gregw)
 */
public class ThreadedServerMBean extends ThreadPoolMBean
{
    /* ------------------------------------------------------------ */
    public ThreadedServerMBean()
        throws MBeanException
    {
        super();
    }
    
    /* ------------------------------------------------------------ */
    public ThreadedServerMBean(ThreadedServer object)
        throws MBeanException
    {
        super(object);
    }
    
    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();

        defineAttribute("host");
        defineAttribute("port");
        defineAttribute("tcpNoDelay");
        defineAttribute("lingerTimeSecs");
        defineAttribute("acceptQueueSize");
        defineAttribute("acceptorThreads");
    }    
}
