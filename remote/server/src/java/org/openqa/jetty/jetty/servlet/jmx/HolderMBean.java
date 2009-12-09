// ========================================================================
// $Id: HolderMBean.java,v 1.5 2005/08/13 00:01:27 gregwilkins Exp $
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

import javax.management.MBeanException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.jetty.servlet.Holder;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.jmx.LifeCycleMBean;


/* ------------------------------------------------------------ */
/** 
 *
 * @version $Revision: 1.5 $
 * @author Greg Wilkins (gregw)
 */
public class HolderMBean extends LifeCycleMBean  
{
    private static Log log = LogFactory.getLog(HolderMBean.class);

    /* ------------------------------------------------------------ */
    private Holder _holder;
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     */
    public HolderMBean()
        throws MBeanException
    {}
    
    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();
        
        defineAttribute("name");
        defineAttribute("displayName");
        defineAttribute("className");
        defineAttribute("initParameters",READ_ONLY,ON_MBEAN);
        
        _holder=(Holder)getManagedResource();
    }
    
    /* ---------------------------------------------------------------- */
    public String getInitParameters()
    {
        return ""+_holder.getInitParameters();
    }
    
    /* ------------------------------------------------------------ */
    public synchronized ObjectName uniqueObjectName(MBeanServer server,
                                                    String objectName)
    {
        try
        {
            String name=_holder.getDisplayName();
            if (name==null || name.length()==0)
                name=_holder.getClassName();
            return new ObjectName(objectName+",name="+name);
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            return super.uniqueObjectName(server,objectName);
        }
    }
}
