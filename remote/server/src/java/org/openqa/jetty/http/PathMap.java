// ========================================================================
// $Id: PathMap.java,v 1.25 2005/08/13 00:01:24 gregwilkins Exp $
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

package org.openqa.jetty.http;

import java.io.Externalizable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.SingletonList;
import org.openqa.jetty.util.StringMap;

/* ------------------------------------------------------------ */
/** URI path map to Object.
 * This mapping implements the path specification recommended
 * in the 2.2 Servlet API.
 *
 * Path specifications can be of the following forms:<PRE>
 * /foo/bar           - an exact path specification.
 * /foo/*             - a prefix path specification (must end '/*').
 * *.ext              - a suffix path specification.
 * /                  - the default path specification.       
 * </PRE>
 * Matching is performed in the following order <NL>
 * <LI>Exact match.
 * <LI>Longest prefix match.
 * <LI>Longest suffix match.
 * <LI>default.
 * </NL>
 * Multiple path specifications can be mapped by providing a list of
 * specifications.  The list is separated by the characters specified
 * in the "org.openqa.jetty.http.PathMap.separators" System property, which
 * defaults to :
 * <P>
 * Note that this is a very different mapping to that provided by PathMap
 * in Jetty2.
 * <P>
 * This class is not synchronized for get's.  If concurrent modifications are
 * possible then it should be synchronized at a higher level.
 *
 * @version $Id: PathMap.java,v 1.25 2005/08/13 00:01:24 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class PathMap extends HashMap implements Externalizable
{
    private static Log log = LogFactory.getLog(PathMap.class);
    
    /* ------------------------------------------------------------ */
    private static String __pathSpecSeparators =
        System.getProperty("org.openqa.jetty.http.PathMap.separators",":,");
    
    /* ------------------------------------------------------------ */
    /** Set the path spec separator.
     * Multiple path specification may be included in a single string
     * if they are separated by the characters set in this string.
     * The default value is ":," or whatever has been set by the
     * system property org.openqa.jetty.http.PathMap.separators
     * @param s separators
     */
    public static void setPathSpecSeparators(String s)
    {
        __pathSpecSeparators=s;
    }
    
    /* --------------------------------------------------------------- */
    StringMap _prefixMap=new StringMap();
    StringMap _suffixMap=new StringMap();
    StringMap _exactMap=new StringMap();

    List _defaultSingletonList=null;
    Map.Entry _prefixDefault=null;
    Map.Entry _default=null;
    Set _entrySet;
    boolean _nodefault=false;
    
    /* --------------------------------------------------------------- */
    /** Construct empty PathMap.
     */
    public PathMap()
    {
        super(11);
        _entrySet=entrySet();
    }

    /* --------------------------------------------------------------- */
    /** Construct empty PathMap.
     */
    public PathMap(boolean nodefault)
    {
        super(11);
        _entrySet=entrySet();
        _nodefault=nodefault;
    }
    
    /* --------------------------------------------------------------- */
    /** Construct empty PathMap.
     */
    public PathMap(int capacity)
    {
        super (capacity);
        _entrySet=entrySet();
    }
    
    /* --------------------------------------------------------------- */
    /** Construct from dictionary PathMap.
     */
    public PathMap(Map m)
    {
        putAll(m);
        _entrySet=entrySet();
    }
    
    /* ------------------------------------------------------------ */
    public void writeExternal(java.io.ObjectOutput out)
        throws java.io.IOException
    {
        HashMap map = new HashMap(this);
        out.writeObject(map);
    }
    
    /* ------------------------------------------------------------ */
    public void readExternal(java.io.ObjectInput in)
        throws java.io.IOException, ClassNotFoundException
    {
        HashMap map = (HashMap)in.readObject();
        this.putAll(map);
    }
    
    /* --------------------------------------------------------------- */
    /** Add a single path match to the PathMap.
     * @param pathSpec The path specification, or comma separated list of
     * path specifications.
     * @param object The object the path maps to
     */
    public synchronized Object put(Object pathSpec, Object object)
    {
        StringTokenizer tok = new StringTokenizer(pathSpec.toString(),__pathSpecSeparators);
        Object old =null;
        
        while (tok.hasMoreTokens())
        {
            String spec=tok.nextToken();
            
            if (!spec.startsWith("/") && !spec.startsWith("*."))
            {
                log.warn("PathSpec "+spec+". must start with '/' or '*.'");
                spec="/"+spec;
            }
            
            old = super.put(spec,object);
            
            // Make entry that was just created.
            Entry entry = new Entry(spec,object);

            if (entry.getKey().equals(spec))
            {
                if (spec.equals("/*"))
                    _prefixDefault=entry;
                else if (spec.endsWith("/*"))
                {
                    _prefixMap.put(spec.substring(0,spec.length()-2),entry);
                    _exactMap.put(spec.substring(0,spec.length()-1),entry);
                    _exactMap.put(spec.substring(0,spec.length()-2),entry);
                }
                else if (spec.startsWith("*."))
                    _suffixMap.put(spec.substring(2),entry);
                else if (spec.equals("/"))
                {    
                    if (_nodefault)
                        _exactMap.put(spec,entry);
                    else
                    {
                        _default=entry;
                        _defaultSingletonList=
                            SingletonList.newSingletonList(_default);
                    }
                }
                else
                    _exactMap.put(spec,entry);
            }
        }
            
        return old;
    }

    /* ------------------------------------------------------------ */
    /** Get object matched by the path.
     * @param path the path.
     * @return Best matched object or null.
     */
    public Object match(String path)
    {
        Map.Entry entry = getMatch(path);
        if (entry!=null)
            return entry.getValue();
        return null;
    }
    
    
    /* --------------------------------------------------------------- */
    /** Get the entry mapped by the best specification.
     * @param path the path.
     * @return Map.Entry of the best matched  or null.
     */
    public Map.Entry getMatch(String path)
    {
        Map.Entry entry;

        if (path==null)
            return null;
        
        int l=path.indexOf(';');
        if (l<0)
        {
            l=path.indexOf('?');
            if (l<0)
                l=path.length();
        }

        // try exact match
        entry=_exactMap.getEntry(path,0,l);
        if (entry!=null)
            return (Map.Entry) entry.getValue();
        
        // prefix search
        int i=l;
        while((i=path.lastIndexOf('/',i-1))>=0)
        {
            entry=_prefixMap.getEntry(path,0,i);
            if (entry!=null)
                return (Map.Entry) entry.getValue();
        }
        
        // Prefix Default
        if (_prefixDefault!=null)
            return _prefixDefault;
        
        // Extension search
        i=0;
        while ((i=path.indexOf('.',i+1))>0)
        {
            entry=_suffixMap.getEntry(path,i+1,l-i-1);
            if (entry!=null)
                return (Map.Entry) entry.getValue();
        }        
        
        // Default
        return _default;
    }
    
    /* --------------------------------------------------------------- */
    /** Get all entries matched by the path.
     * Best match first.
     * @param path Path to match
     * @return List of Map.Entry instances key=pathSpec
     */
    public List getMatches(String path)
    {        
        Map.Entry entry;
        Object entries=null;

        if (path==null)
            return LazyList.getList(entries);
        
        int l=path.indexOf(';');
        if (l<0)
        {
            l=path.indexOf('?');
            if (l<0)
                l=path.length();
        }

        // try exact match
        entry=_exactMap.getEntry(path,0,l);
        if (entry!=null)
            entries=LazyList.add(entries,entry.getValue());
        
        // prefix search
        int i=l-1;
        while((i=path.lastIndexOf('/',i-1))>=0)
        {
            entry=_prefixMap.getEntry(path,0,i);
            if (entry!=null)
                entries=LazyList.add(entries,entry.getValue());
        }
        
        // Prefix Default
        if (_prefixDefault!=null)
            entries=LazyList.add(entries,_prefixDefault);
        
        // Extension search
        i=0;
        while ((i=path.indexOf('.',i+1))>0)
        {
            entry=_suffixMap.getEntry(path,i+1,l-i-1);
            if (entry!=null)
                entries=LazyList.add(entries,entry.getValue());
        }

        // Default
        if (_default!=null)
        {
            // Optimization for just the default
            if (entries==null)
                return _defaultSingletonList;
            
            entries=LazyList.add(entries,_default);
        }
        
        return LazyList.getList(entries);
    }


    /* --------------------------------------------------------------- */  
    public synchronized Object remove(Object pathSpec)
    {
        if (pathSpec!=null)
        {
            String spec=(String) pathSpec;
            if (spec.equals("/*"))
                _prefixDefault=null;
            else if (spec.endsWith("/*"))
            {
                _prefixMap.remove(spec.substring(0,spec.length()-2));
                _exactMap.remove(spec.substring(0,spec.length()-1));
                _exactMap.remove(spec.substring(0,spec.length()-2));
            }
            else if (spec.startsWith("*."))
                _suffixMap.remove(spec.substring(2));
            else if (spec.equals("/"))
            {
                _default=null;
                _defaultSingletonList=null;
            }
            else
                _exactMap.remove(spec);
        }
        return super.remove(pathSpec);
    }
    
    /* --------------------------------------------------------------- */
    public void clear()
    {
        _exactMap=new StringMap();
        _prefixMap=new StringMap();
        _suffixMap=new StringMap();
        _default=null;
        _defaultSingletonList=null;
        super.clear();
    }
    
    /* --------------------------------------------------------------- */
    /**
     * @return true if match.
     */
    public static boolean match(String pathSpec, String path)
        throws IllegalArgumentException
    {
        char c = pathSpec.charAt(0);
        if (c=='/')
        {
            if (pathSpec.length()==1 || pathSpec.equals(path))
                return true;
            
            if (pathSpec.endsWith("/*") &&
                pathSpec.regionMatches(0,path,0,pathSpec.length()-2))
                return true;
            
            if (path.startsWith(pathSpec) && path.charAt(pathSpec.length())==';')
                return true;
        }
        else if (c=='*')
            return path.regionMatches(path.length()-pathSpec.length()+1,
                                      pathSpec,1,pathSpec.length()-1);
        return false;
    }

    /* --------------------------------------------------------------- */
    /**
     * @return true if match.
     */
    public static boolean match(String pathSpec, String path, boolean noDefault)
        throws IllegalArgumentException
    {
        char c = pathSpec.charAt(0);
        if (c=='/')
        {
            if (!noDefault && pathSpec.length()==1 || pathSpec.equals(path))
                return true;
            
            if (pathSpec.endsWith("/*") &&
                pathSpec.regionMatches(0,path,0,pathSpec.length()-2))
                return true;
            
            if (path.startsWith(pathSpec) && path.charAt(pathSpec.length())==';')
                return true;
        }
        else if (c=='*')
            return path.regionMatches(path.length()-pathSpec.length()+1,
                                      pathSpec,1,pathSpec.length()-1);
        return false;
    }
    
    /* --------------------------------------------------------------- */
    /** Return the portion of a path that matches a path spec.
     * @return null if no match at all.
     */
    public static String pathMatch(String pathSpec, String path)
    {  
        char c = pathSpec.charAt(0);
        
        if (c=='/')
        {
            if (pathSpec.length()==1)
                return path;
        
            if (pathSpec.equals(path))
                return path;
            
            if (pathSpec.endsWith("/*") &&
                pathSpec.regionMatches(0,path,0,pathSpec.length()-2))
                return path.substring(0,pathSpec.length()-2);
            
            if (path.startsWith(pathSpec) && path.charAt(pathSpec.length())==';')
                return path;
        }
        else if (c=='*')
        {
            if (path.regionMatches(path.length()-(pathSpec.length()-1),
                                   pathSpec,1,pathSpec.length()-1))
                return path;
        }
        return null;
    }
    
    /* --------------------------------------------------------------- */
    /** Return the portion of a path that is after a path spec.
     * @return The path info string
     */
    public static String pathInfo(String pathSpec, String path)
    {
        char c = pathSpec.charAt(0);
        
        if (c=='/')
        {
            if (pathSpec.length()==1)
                return null;
            
            if (pathSpec.equals(path))
                return null;
            
            if (pathSpec.endsWith("/*") &&
                pathSpec.regionMatches(0,path,0,pathSpec.length()-2))
            {
                if (path.length()==pathSpec.length()-2)
                    return null;
                return path.substring(pathSpec.length()-2);
            }
        } 
        return null;
    }


    /* ------------------------------------------------------------ */
    /** Relative path.
     * @param base The base the path is relative to.
     * @param pathSpec The spec of the path segment to ignore.
     * @param path the additional path
     * @return base plus path with pathspec removed 
     */
    public static String relativePath(String base,
                                      String pathSpec,
                                      String path )
    {
        String info=pathInfo(pathSpec,path);
        if (info==null)
            info=path;

        if( info.startsWith( "./"))
            info = info.substring( 2);
        if( base.endsWith( "/"))
            if( info.startsWith( "/"))
                path = base + info.substring(1);
            else
                path = base + info;
        else
            if( info.startsWith( "/"))
                path = base + info;
            else
                path = base + "/" + info;
        return path;
    }
 
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class Entry implements Map.Entry
    {
        private Object key;
        private Object value;
        private transient String string;

        Entry(Object key, Object value)
        {
            this.key=key;
            this.value=value;
        }

        public Object getKey()
        {
            return key;
        }
        
        public Object getValue()
        {
            return value;
        }

        public Object setValue(Object o)
        {
            throw new UnsupportedOperationException();
        }

        public String toString()
        {
            if (string==null)
                string=key+"="+value;
            return string;
        }
    }
}
