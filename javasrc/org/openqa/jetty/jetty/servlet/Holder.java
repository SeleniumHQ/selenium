// ========================================================================
// $Id: Holder.java,v 1.18 2005/08/13 00:01:27 gregwilkins Exp $
// Copyright 1996-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.jetty.servlet;

import java.io.Serializable;
import java.util.AbstractMap;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpHandler;
import org.openqa.jetty.util.LifeCycle;


/* --------------------------------------------------------------------- */
/** 
 * @version $Id: Holder.java,v 1.18 2005/08/13 00:01:27 gregwilkins Exp $
 * @author Greg Wilkins
 */
public class Holder
    extends AbstractMap
    implements LifeCycle,
               Serializable
{
    private static Log log = LogFactory.getLog(Holder.class);

    /* ---------------------------------------------------------------- */
    protected HttpHandler _httpHandler;
    protected String _name;
    protected String _displayName;
    protected String _className;
    protected Map _initParams;
    
    protected transient Class _class;

    /* ---------------------------------------------------------------- */
    /** Constructor for Serialization.
     */
    protected Holder()
    {}
    
    /* ---------------------------------------------------------------- */
    protected Holder(HttpHandler httpHandler,
                     String name,
                     String className)
    {
        if (name==null || name.length()==0)
            throw new IllegalArgumentException("No name for "+className);
        
        if (className==null || className.length()==0)
            throw new IllegalArgumentException("No classname");
        
        _httpHandler=httpHandler;
        _className=className;
        _name=name;
        _displayName=name;
    }

    
    /* ------------------------------------------------------------ */
    public String getName()
    {
        return _name;
    }
    
    /* ------------------------------------------------------------ */
    public void setDisplayName(String name)
    {
        _name=name;
    }
    
    /* ------------------------------------------------------------ */
    public String getDisplayName()
    {
        return _name;
    }
    
    /* ------------------------------------------------------------ */
    public String getClassName()
    {
        return _className;
    }
    
    /* ------------------------------------------------------------ */
    public HttpHandler getHttpHandler()
    {
        return _httpHandler;
    }

    /* ------------------------------------------------------------ */
    public HttpContext getHttpContext()
    {
        if (_httpHandler!=null)
            return _httpHandler.getHttpContext();
        return null;
    }
    
    /* ------------------------------------------------------------ */
    public void setInitParameter(String param,String value)
    {
        put(param,value);
    }

    /* ---------------------------------------------------------------- */
    public String getInitParameter(String param)
    {
        if (_initParams==null)
            return null;
        return (String)_initParams.get(param);
    }

    /* ---------------------------------------------------------------- */
    public Map getInitParameters()
    {
        return _initParams;
    }
    
    /* ------------------------------------------------------------ */
    public Enumeration getInitParameterNames()
    {
        if (_initParams==null)
            return Collections.enumeration(Collections.EMPTY_LIST);
        return Collections.enumeration(_initParams.keySet());
    }

    /* ------------------------------------------------------------ */
    /** Map entrySet method.
     * FilterHolder implements the Map interface as a
     * configuration conveniance. The methods are mapped to the
     * filter properties.
     * @return The entrySet of the initParameter map
     */
    public synchronized Set entrySet()
    {
        if (_initParams==null)
            _initParams=new HashMap(3);
        return _initParams.entrySet();
    }

    /* ------------------------------------------------------------ */
    /** Map put method.
     * FilterHolder implements the Map interface as a
     * configuration conveniance. The methods are mapped to the
     * filter properties.
     */
    public synchronized Object put(Object name,Object value)
    {
        if (_initParams==null)
            _initParams=new HashMap(3);
        return _initParams.put(name,value);
    }

    /* ------------------------------------------------------------ */
    /** Map get method.
     * FilterHolder implements the Map interface as a
     * configuration conveniance. The methods are mapped to the
     * filter properties.
     */
    public synchronized Object get(Object name)
    {
        if (_initParams==null)
            return null;
        return _initParams.get(name);
    }

    /* ------------------------------------------------------------ */
    public void start()
        throws Exception
    {
        _class=_httpHandler.getHttpContext().loadClass(_className);
        if(log.isDebugEnabled())log.debug("Started holder of "+_class);
    }
    
    /* ------------------------------------------------------------ */
    public synchronized Object newInstance()
        throws InstantiationException,
               IllegalAccessException
    {
        if (_class==null)
            throw new InstantiationException("No class for "+this);
        return _class.newInstance();
    }

    /* ------------------------------------------------------------ */
    public boolean isStarted()
    {
        return _class!=null;
    }
    
    /* ------------------------------------------------------------ */
    public void stop()
    {
        _class=null;
    }
    
    /* ------------------------------------------------------------ */
    public String toString()
    {
        return _name;
    }
    
}





