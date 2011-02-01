// ========================================================================
// $Id: Container.java,v 1.4 2005/08/13 08:49:59 gregwilkins Exp $
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

package org.openqa.jetty.util;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EventListener;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpContext;



/* ------------------------------------------------------------ */
/** Abstract Container.
 * Provides base handling for LifeCycle and Component events.
 *
 * @version $Id: Container.java,v 1.4 2005/08/13 08:49:59 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public abstract class Container implements LifeCycle,EventProvider,Serializable
{
    private static Log log = LogFactory.getLog(Container.class);
    
    private Object _eventListeners;
    private Object _components;
    
    private transient boolean _started;
    private transient boolean _starting;
    private transient boolean _stopping;

    
    /* ------------------------------------------------------------ */
    /** Start the server.
     * Generate LifeCycleEvents for starting and started either side of a call to doStart
     */
    public synchronized final void start()
    	throws Exception
    {
        if (_started || _starting)
            return;
        
        _starting=true;
        
        if (log.isDebugEnabled()) log.debug("Starting "+this);
        LifeCycleEvent event = new LifeCycleEvent(this);
        for(int i=0;i<LazyList.size(_eventListeners);i++)
        {
            EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
            if (listener instanceof LifeCycleListener)
                ((LifeCycleListener)listener).lifeCycleStarting(event);
        }
        
        try
        {
            doStart();
            _started=true;
            log.info("Started "+this);
            for(int i=0;i<LazyList.size(_eventListeners);i++)
            {
                EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                if (listener instanceof LifeCycleListener)
                    ((LifeCycleListener)listener).lifeCycleStarted(event);
            }
        }
        catch(Throwable e)
        {
            LifeCycleEvent failed = new LifeCycleEvent(this,e);
            for(int i=0;i<LazyList.size(_eventListeners);i++)
            {
                EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                if (listener instanceof LifeCycleListener)
                    ((LifeCycleListener)listener).lifeCycleFailure(event);
            }
            if (e instanceof Exception)
                throw (Exception)e;
            if (e instanceof RuntimeException)
                throw (RuntimeException)e;
            if (e instanceof Error)
                throw (Error)e;
            log.warn(LogSupport.EXCEPTION, e);
        }
        finally
        {
            _starting=false;
        }
    }
    

    /* ------------------------------------------------------------ */
    /** Do start operations.  
     * This abstract method is called by start
     * to perform the actual start operations.
     */
    protected abstract void doStart()
        throws Exception;
    
    /* ------------------------------------------------------------ */
    public synchronized boolean isStarted()
    {
        return _started;
    }
    
    /* ------------------------------------------------------------ */
    protected synchronized boolean isStarting()
    {
        return _starting;
    }
    
    /* ------------------------------------------------------------ */
    protected synchronized boolean isStopping()
    {
        return _stopping;
    }

    /* ------------------------------------------------------------ */
    /** Stop the container.
     * Generate LifeCycleEvents for stopping and stopped either side of a call to doStop
     */
    public synchronized final void stop()
    	throws InterruptedException
    {
        if (!_started || _stopping)
            return;
        _stopping=true;

        if (log.isDebugEnabled()) log.debug("Stopping "+this);
        LifeCycleEvent event = new LifeCycleEvent(this);
        for(int i=0;i<LazyList.size(_eventListeners);i++)
        {
            EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
            if (listener instanceof LifeCycleListener)
                ((LifeCycleListener)listener).lifeCycleStopping(event);
        }
        
        try
        {	
            doStop();
            _started=false;
            log.info("Stopped "+this);
            for(int i=0;i<LazyList.size(_eventListeners);i++)
            {
                EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                if (listener instanceof LifeCycleListener)
                    ((LifeCycleListener)listener).lifeCycleStopped(event);
            }
        }
        catch(Throwable e)
        {
            event = new LifeCycleEvent(this,e);
            for(int i=0;i<LazyList.size(_eventListeners);i++)
            {
                EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                if (listener instanceof LifeCycleListener)
                    ((LifeCycleListener)listener).lifeCycleFailure(event);
            }
            if (e instanceof InterruptedException)
                throw (InterruptedException)e;
            if (e instanceof RuntimeException)
                throw (RuntimeException)e;
            if (e instanceof Error)
                throw (Error)e;
            log.warn(LogSupport.EXCEPTION, e);
        }
        finally
        {
            _stopping=false;
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Do stop operations.  
     * This abstract method is called by stop
     * to perform the actual stop operations.
     */
    protected abstract void doStop()
        throws Exception;
    
    /* ------------------------------------------------------------ */
    protected void addComponent(Object o)
    {
        if (!LazyList.contains(_components,o))
        {
            _components = LazyList.add(_components,o);
            if(log.isDebugEnabled())log.debug("add component: "+o);
            ComponentEvent event = new ComponentEvent(this,o);
            for(int i=0;i<LazyList.size(_eventListeners);i++)
            {
                EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                if (listener instanceof ComponentListener)
                    ((ComponentListener)listener).addComponent(event);
            }
        }
    }
    
    /* ------------------------------------------------------------ */
    protected void removeComponent(Object o)
    {
        if (LazyList.contains(_components,o))
        {
            _components=LazyList.remove(_components, o);
            if(log.isDebugEnabled())log.debug("remove component: "+o);
            ComponentEvent event = new ComponentEvent(this,o);
            for(int i=0;i<LazyList.size(_eventListeners);i++)
            {
                EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                if (listener instanceof ComponentListener)
                    ((ComponentListener)listener).removeComponent(event);
            }
        }
    }

    /* ------------------------------------------------------------ */
    /** Add a server event listener.
     * @param listener ComponentEventListener or LifeCycleEventListener 
     */
    public void addEventListener(EventListener listener)
    	throws IllegalArgumentException
    {
       
        if (_eventListeners==null)
            _eventListeners=new ArrayList();
        
        if (listener instanceof ComponentListener ||
            listener instanceof LifeCycleListener )
        {
            if(log.isDebugEnabled())log.debug("addEventListener: "+listener);      
            _eventListeners=LazyList.add(_eventListeners,listener);
        }
      
    }
    
    /* ------------------------------------------------------------ */
    public void removeEventListener(EventListener listener)
    {
        if(log.isDebugEnabled())log.debug("removeEventListener: "+listener);
        _eventListeners=LazyList.remove(_eventListeners,listener);
    }

    /* ------------------------------------------------------------ */
    /** Destroy a stopped server.
     * Remove all components and send notifications to all event
     * listeners. The HttpServer must be stopped before it can be destroyed.
     */
    public void destroy()
    {
        if (isStarted())
            throw new IllegalStateException("Started");

        if (_components!=null && _eventListeners!=null)
        {
            for (int c=0;c<LazyList.size(_components);c++)
            {
                Object o=LazyList.get(_components,c);
                if (o instanceof HttpContext )
                    ((HttpContext)o).destroy();
                
                ComponentEvent event = new ComponentEvent(this,o);
                for(int i=0;i<LazyList.size(_eventListeners);i++)
                {
                    EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                    if (listener instanceof ComponentListener)
                        ((ComponentListener)listener).removeComponent(event);
                }
            }
        }
        
        _components=null;
        _eventListeners=null;
    }

    /* ------------------------------------------------------------ */
    public Collection getComponents()
    {
        return LazyList.getList(_eventListeners, false);
    }

    /* ------------------------------------------------------------ */
    private void readObject(java.io.ObjectInputStream in)
        throws IOException, ClassNotFoundException
    {
        in.defaultReadObject();
        for (int c=0;c<LazyList.size(_components);c++)
        {
            Object o = LazyList.get(_components,c);
            ComponentEvent event = new ComponentEvent(this,o);
            for(int i=0;i<LazyList.size(_eventListeners);i++)
            {
                EventListener listener=(EventListener)LazyList.get(_eventListeners,i);
                if (listener instanceof ComponentListener)
                    ((ComponentListener)listener).addComponent(event);
            }
        }
    }
}
