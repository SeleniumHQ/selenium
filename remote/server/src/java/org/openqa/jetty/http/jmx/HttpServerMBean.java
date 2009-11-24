// ========================================================================
// $Id: HttpServerMBean.java,v 1.16 2005/12/04 11:43:21 gregwilkins Exp $
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

import java.util.HashMap;

import javax.management.InstanceNotFoundException;
import javax.management.MBeanException;
import javax.management.ObjectName;
import javax.management.modelmbean.InvalidTargetObjectTypeException;
import javax.management.modelmbean.ModelMBean;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpServer;
import org.openqa.jetty.http.Version;
import org.openqa.jetty.util.ComponentEvent;
import org.openqa.jetty.util.ComponentListener;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.jmx.LifeCycleMBean;
import org.openqa.jetty.util.jmx.ModelMBeanImpl;

/* ------------------------------------------------------------ */
/** HttpServer MBean.
 * This Model MBean class provides the mapping for HttpServer
 * management methods. It also registers itself as a membership
 * listener of the HttpServer, so it can create and destroy MBean
 * wrappers for listeners and contexts.
 *
 * @version $Revision: 1.16 $
 * @author Greg Wilkins (gregw)
 */
public class HttpServerMBean extends LifeCycleMBean
    implements ComponentListener
{
    private static Log log = LogFactory.getLog(HttpServerMBean.class);

    private HttpServer _httpServer;
    private HashMap _mbeanMap = new HashMap();

    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     * @exception InstanceNotFoundException 
     */
    protected HttpServerMBean(HttpServer httpServer)
        throws MBeanException, InstanceNotFoundException
    {
        _httpServer=httpServer;
        _httpServer.addEventListener(this);
        try{super.setManagedResource(_httpServer,"objectReference");}
        catch(InvalidTargetObjectTypeException e){log.warn(LogSupport.EXCEPTION,e);}
    }

    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @exception MBeanException 
     * @exception InstanceNotFoundException 
     */
    public HttpServerMBean()
        throws MBeanException, InstanceNotFoundException
    {
        this(new HttpServer());
    }
    
    /* ------------------------------------------------------------ */
    public void setManagedResource(Object o,String s)
        throws MBeanException, InstanceNotFoundException, InvalidTargetObjectTypeException
    {
        if (o!=null)
            ((HttpServer)o).addEventListener(this);
        super.setManagedResource(o,s);
    }

    /* ------------------------------------------------------------ */
    protected void defineManagedResource()
    {
        super.defineManagedResource();
        
        defineAttribute("listeners",READ_ONLY);
        defineAttribute("contexts",READ_ONLY);
        defineAttribute("version",READ_ONLY,ON_MBEAN);
        defineAttribute("components",READ_ONLY,ON_MBEAN);
        defineAttribute("requestLog");
        
        defineAttribute("trace");

        
        defineOperation("addListener",new String[]{"java.lang.String"},IMPACT_ACTION);
        defineOperation("addListener",new String[]{"org.openqa.jetty.util.InetAddrPort"},IMPACT_ACTION);
        defineOperation("addListener",new String[]{"org.openqa.jetty.http.HttpListener"},IMPACT_ACTION);
        defineOperation("removeListener",new String[]{"org.openqa.jetty.http.HttpListener"},IMPACT_ACTION);
        defineOperation("addContext",new String[]{"org.openqa.jetty.http.HttpContext"},IMPACT_ACTION);
        defineOperation("removeContext",new String[]{"org.openqa.jetty.http.HttpContext"},IMPACT_ACTION);
        defineOperation("addContext",new String[]{"java.lang.String"},IMPACT_ACTION);
        defineOperation("addContext",new String[]{"java.lang.String","java.lang.String"},IMPACT_ACTION);
        
        defineAttribute("requestsPerGC");
        
        defineAttribute("statsOn");
        defineAttribute("statsOnMs");
        defineOperation("statsReset",IMPACT_ACTION);
        defineAttribute("connections");
        defineAttribute("connectionsOpen");
        defineAttribute("connectionsOpenMin");
        defineAttribute("connectionsOpenMax");
        defineAttribute("connectionsDurationAve");
        defineAttribute("connectionsDurationMin");
        defineAttribute("connectionsDurationMax");
        defineAttribute("connectionsDurationTotal");
        defineAttribute("connectionsRequestsAve");
        defineAttribute("connectionsRequestsMin");
        defineAttribute("connectionsRequestsMax");
        defineAttribute("errors");
        defineAttribute("requests");
        defineAttribute("requestsActive");
        defineAttribute("requestsActiveMin");
        defineAttribute("requestsActiveMax");
        defineAttribute("requestsDurationAve");
        defineAttribute("requestsDurationMin");
        defineAttribute("requestsDurationMax");
        
        defineOperation("stop",new String[]{"java.lang.Boolean.TYPE"},IMPACT_ACTION);
        defineOperation("save",new String[]{"java.lang.String"},IMPACT_ACTION);
        defineOperation("destroy",IMPACT_ACTION);
    }
    
    /* ------------------------------------------------------------ */
    public synchronized void addComponent(ComponentEvent event)
    {
        try
        {
            if(log.isDebugEnabled())log.debug("Component added "+event);
            Object o=event.getComponent();
            
            ModelMBean mbean=ModelMBeanImpl.mbeanFor(o);
            if (mbean==null)
                log.warn("No MBean for "+o);
            else
            {
                ObjectName oName=null;
                if (mbean instanceof ModelMBeanImpl)
                {
                    ((ModelMBeanImpl)mbean).setBaseObjectName(getObjectName().toString());
                    oName=
                        getMBeanServer().registerMBean(mbean,null).getObjectName();
                }
                else
                {
                    oName=uniqueObjectName(getMBeanServer(),
                                           o,
                                           getObjectName().toString());
                    oName=getMBeanServer().registerMBean(mbean,oName)
                        .getObjectName();
                }
                Holder holder = new Holder(oName,mbean);
                _mbeanMap.put(o,holder);
            }
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
    }

    /* ------------------------------------------------------------ */
    public String getVersion()
    {
        return Version.getDetail();
    }
    
    
    /* ------------------------------------------------------------ */
    public ObjectName[] getComponents()
    {
        Holder[] h=(Holder[])_mbeanMap.values().toArray(new Holder[_mbeanMap.size()]);
        ObjectName[] on = new ObjectName[h.length];
        for (int i=0;i<on.length;i++)
            on[i]=h[i].oName;
        return on;
    }
    
    
    /* ------------------------------------------------------------ */
    public synchronized void removeComponent(ComponentEvent event)
    {
        if(log.isDebugEnabled())log.debug("Component removed "+event);
        
        try
        {
            Object o=event.getComponent();
            Holder holder=(Holder)_mbeanMap.remove(o);
            if (holder!=null)
                getMBeanServer().unregisterMBean(holder.oName);
            else if (o==_httpServer)
                getMBeanServer().unregisterMBean(this.getObjectName());
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
        }
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @param ok 
     */
    public void postRegister(Boolean ok)
    {
        super.postRegister(ok);
    }
    
    /* ------------------------------------------------------------ */
    public void postDeregister()
    {
        _httpServer.removeEventListener(this);
        _httpServer=null;
        if (_mbeanMap!=null)
            _mbeanMap.clear();
        _mbeanMap=null;
        
        super.postDeregister();
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class Holder
    {
        Holder(ObjectName oName,Object mbean){ this.oName=oName; this.mbean=mbean;}
        ObjectName oName;
        Object mbean;
    }
}

