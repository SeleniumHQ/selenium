//========================================================================
//$Id: Factory.java,v 1.4 2005/12/05 12:51:01 gregwilkins Exp $
//Copyright 2004 Mort Bay Consulting Pty. Ltd.
//------------------------------------------------------------------------
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at 
//http://www.apache.org/licenses/LICENSE-2.0
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.
//========================================================================

package org.openqa.jetty.log;

import java.util.ArrayList;
import java.util.HashMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogConfigurationException;


/**
 * Commons Logging Factory for org.openqa.jetty.log
 * Returns a static default log, unless an alternate Log implementation has been set as
 * an attribute keyed by the classname or other name of the log.  If the name of the attibute ends 
 * with '.*' it is assumed to be a name prefix match.
 * Attributes with string values are treated as references to other attributes.
 * 
 * This class needs to be configured in the META-INF/services directory (see build.xml for example)
 * for automatic discovery.  Or it can be configured with the system property:
 *   -Dorg.apache.commons.logging.LogFactory=org.openqa.jetty.log.Factory
 * 
 */
public class Factory extends org.apache.commons.logging.LogFactory
{
     static LogImpl log = new LogImpl();
     static HashMap attributes = new HashMap();
     static ArrayList prefixes = new ArrayList();
    
    /**
     * 
     */
    public Factory()
    {
        super();
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.LogFactory#getAttribute(java.lang.String)
     */
    public Object getAttribute(String n)
    {
        return attributes.get(n);
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.LogFactory#getAttributeNames()
     */
    public String[] getAttributeNames()
    {
        return (String[]) attributes.keySet().toArray(new String[attributes.size()]);
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.LogFactory#getInstance(java.lang.Class)
     */
    public Log getInstance(Class c) throws LogConfigurationException
    {
        if (c!=null)
            return getInstance(c.getName());
        return getInstance((String)null);
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.LogFactory#getInstance(java.lang.String)
     */
    public Log getInstance(String name) throws LogConfigurationException
    {
        String match="";
        for (int i=prefixes.size();name!=null && i-->0;)
        {
            String prefix=(String)prefixes.get(i);
            if (name.startsWith(prefix) && prefix.length()>match.length())
                match=prefix;
        }
        if (match.length()>0)
            name=match+".*";
        
        // Get value
        Object o = attributes.get(name);
        
        // Dereference string attributes
        while(o!=null && o instanceof String)
            o=attributes.get(o);
        
        // return actual log.
        if (o instanceof Log)
            return (Log)o;
        return log;
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.LogFactory#release()
     */
    public void release()
    {
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.LogFactory#removeAttribute(java.lang.String)
     */
    public void removeAttribute(String n)
    {
        attributes.remove(n);
        if (n.endsWith(".*"))
            prefixes.remove(n.substring(0,n.length()-2));
    }

    /* (non-Javadoc)
     * @see org.apache.commons.logging.LogFactory#setAttribute(java.lang.String, java.lang.Object)
     */
    public void setAttribute(String n, Object v)
    {
        attributes.put(n,v);
        if (n.endsWith(".*") && v instanceof Log)
            prefixes.add(n.substring(0,n.length()-2));
    }

}
