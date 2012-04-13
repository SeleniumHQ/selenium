// ========================================================================
// $Id: WebApplicationContextMBean.java,v 1.11 2005/08/13 00:01:27 gregwilkins Exp $
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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.management.MBeanException;
import javax.management.MBeanServer;
import javax.management.ObjectName;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.jetty.servlet.WebApplicationContext;
import org.openqa.jetty.util.LifeCycleEvent;
import org.openqa.jetty.util.LifeCycleListener;
import org.openqa.jetty.util.LogSupport;

/* ------------------------------------------------------------ */
/** Web Application MBean.
 * Note that while Web Applications are HttpContexts, the MBean is
 * not derived from HttpContextMBean as they are managed differently.
 *
 * @version $Revision: 1.11 $
 * @author Greg Wilkins (gregw)
 */
public class WebApplicationContextMBean extends ServletHttpContextMBean
{
    private static final Log log = LogFactory.getLog(WebApplicationContextMBean.class);
    private WebApplicationContext _webappContext;
    private Map _configurations = new HashMap();
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     */
    public WebApplicationContextMBean()
        throws MBeanException
    {}

    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();

        defineAttribute("displayName",false);
        defineAttribute("defaultsDescriptor",true);
        defineAttribute("WAR",true);
        defineAttribute("extractWAR",true);
        _webappContext=(WebApplicationContext)getManagedResource();
        _webappContext.addEventListener(new LifeCycleListener()
                {

                    public void lifeCycleStarting (LifeCycleEvent event)
                    {}
                    
                    public void lifeCycleStarted (LifeCycleEvent event)
                    {
                        getConfigurations();
                    }

                    public void lifeCycleFailure (LifeCycleEvent event)
                    {}

                    public void lifeCycleStopping (LifeCycleEvent event)
                    {}

                    public void lifeCycleStopped (LifeCycleEvent event)
                    {
                        destroyConfigurations();
                    }
            
                });
    }
    
    
    /** postRegister
     * Register mbeans for all of the jsr77 servlet stats
     * @see javax.management.MBeanRegistration#postRegister(java.lang.Boolean)
     */
    public void postRegister(Boolean ok)
    {
        super.postRegister(ok);
        getConfigurations();
    }
    
    
   
    
    
    /**postDeregister
     * Unregister mbeans we created for the Configuration objects.
     * @see javax.management.MBeanRegistration#postDeregister()
     */
    public void postDeregister ()
    {
        destroyConfigurations ();     
        super.postDeregister();
    }
   
    
    /**getConfigurations
     * Make mbeans for all of the Configurations applied to the
     * WebApplicationContext
     * @return An array of ObjectName objects.
     */
    public ObjectName[] getConfigurations ()
    { 
        return getComponentMBeans(_webappContext.getConfigurations(),_configurations); 
    }
    
    public void destroyConfigurations ()
    {
        MBeanServer mbeanServer = getMBeanServer();
        Iterator itor = _configurations.values().iterator();
        while (itor.hasNext())
        {
            try
            {
                ObjectName o = (ObjectName)itor.next();
                log.debug("Unregistering: "+o);
                
                if (null!=mbeanServer)
                    mbeanServer.unregisterMBean((ObjectName)o);
            }
            catch (Exception e)
            {
                log.warn(LogSupport.EXCEPTION, e);
            }
        }
        _configurations.clear();
    }
    
    
 
    
}
