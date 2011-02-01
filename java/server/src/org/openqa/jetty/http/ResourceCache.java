// ========================================================================
// $Id: ResourceCache.java,v 1.13 2006/04/04 22:28:02 gregwilkins Exp $
// Copyright 2000-2004 Mort Bay Consulting Pty. Ltd.
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

import java.io.IOException;
import java.io.Serializable;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.ResourceBundle;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.CachedResource;
import org.openqa.jetty.util.LifeCycle;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.Resource;
import org.openqa.jetty.util.StringUtil;


/* ------------------------------------------------------------ */
/** 
 * @version $Id: ResourceCache.java,v 1.13 2006/04/04 22:28:02 gregwilkins Exp $
 * @author Greg Wilkins
 */
public class ResourceCache implements LifeCycle,
                                      Serializable
{
    private static Log log = LogFactory.getLog(ResourceCache.class);

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private final static Map __dftMimeMap = new HashMap();
    private final static Map __encodings = new HashMap();
    static
    {
        ResourceBundle mime = ResourceBundle.getBundle("org/openqa/jetty/http/mime");
        Enumeration i = mime.getKeys();
        while(i.hasMoreElements())
        {
            String ext = (String)i.nextElement();
            __dftMimeMap.put(StringUtil.asciiToLowerCase(ext),mime.getString(ext));
        }
        ResourceBundle encoding = ResourceBundle.getBundle("org/openqa/jetty/http/encoding");
        i = encoding.getKeys();
        while(i.hasMoreElements())
        {
            String type = (String)i.nextElement();
            __encodings.put(type,encoding.getString(type));
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    // TODO - handle this
    // These attributes are serialized by WebApplicationContext, which needs
    // to be updated if you add to these
    
    
    
    
    private int _maxCachedFileSize =1*1024;
    private int _maxCacheSize =1*1024;

    /* ------------------------------------------------------------ */
    private Resource _resourceBase;
    private Map _mimeMap;
    private Map _encodingMap;


    /* ------------------------------------------------------------ */
    private transient boolean _started;

    protected transient Map _cache;
    protected transient int _cacheSize;
    protected transient CachedMetaData _mostRecentlyUsed;
    protected transient CachedMetaData _leastRecentlyUsed;


    /* ------------------------------------------------------------ */
    /** Constructor.
     */
    public ResourceCache()
    {
        _cache=new HashMap();
    }


    /* ------------------------------------------------------------ */
    private void readObject(java.io.ObjectInputStream in)
        throws IOException, ClassNotFoundException
    {
        in.defaultReadObject();
        _cache=new HashMap();
    }
    
    /* ------------------------------------------------------------ */
    /** Set the Resource Base.
     * The base resource is the Resource to use as a relative base
     * for all context resources. The ResourceBase attribute is a
     * string version of the baseResource.
     * If a relative file is passed, it is converted to a file
     * URL based on the current working directory.
     * @return The file or URL to use as the base for all resources
     * within the context.
     */
    public String getResourceBase()
    {
        if (_resourceBase==null)
            return null;
        return _resourceBase.toString();
    }

    /* ------------------------------------------------------------ */
    /** Set the Resource Base.
     * The base resource is the Resource to use as a relative base
     * for all context resources. The ResourceBase attribute is a
     * string version of the baseResource.
     * If a relative file is passed, it is converted to a file
     * URL based on the current working directory.
     * @param resourceBase A URL prefix or directory name.
     */
    public void setResourceBase(String resourceBase)
    {
        try{
            _resourceBase=Resource.newResource(resourceBase);
            if(log.isDebugEnabled())log.debug("resourceBase="+_resourceBase+" for "+this);
        }
        catch(IOException e)
        {
            log.debug(LogSupport.EXCEPTION,e);
            throw new IllegalArgumentException(resourceBase+":"+e.toString());
        }
    }


    /* ------------------------------------------------------------ */
    /** Get the base resource.
     * The base resource is the Resource to use as a relative base
     * for all context resources. The ResourceBase attribute is a
     * string version of the baseResource.
     * @return The resourceBase as a Resource instance
     */
    public Resource getBaseResource()
    {
        return _resourceBase;
    }

    /* ------------------------------------------------------------ */
    /** Set the base resource.
     * The base resource is the Resource to use as a relative base
     * for all context resources. The ResourceBase attribute is a
     * string version of the baseResource.
     * @param base The resourceBase as a Resource instance
     */
    public void setBaseResource(Resource base)
    {
        _resourceBase=base;
    }


    /* ------------------------------------------------------------ */
    public int getMaxCachedFileSize()
    {
        return _maxCachedFileSize;
    }

    /* ------------------------------------------------------------ */
    public void setMaxCachedFileSize(int maxCachedFileSize)
    {
        _maxCachedFileSize = maxCachedFileSize;
        _cache.clear();
    }

    /* ------------------------------------------------------------ */
    public int getMaxCacheSize()
    {
        return _maxCacheSize;
    }

    /* ------------------------------------------------------------ */
    public void setMaxCacheSize(int maxCacheSize)
    {
        _maxCacheSize = maxCacheSize;
        _cache.clear();
    }

    /* ------------------------------------------------------------ */
    public void flushCache()
    {
        _cache.clear();
        System.gc();
    }

    /* ------------------------------------------------------------ */
    /** Get a resource from the context.
     * Cached Resources are returned if the resource fits within the LRU
     * cache.  Directories may have CachedResources returned, but the
     * caller must use the CachedResource.setCachedData method to set the
     * formatted directory content.
     *
     * @param pathInContext
     * @return Resource
     * @exception IOException
     */
    public Resource getResource(String pathInContext)
        throws IOException
    {
        if(log.isTraceEnabled())log.trace("getResource "+pathInContext);
        if (_resourceBase==null)
            return null;

        Resource resource=null;

        // Cache operations
        synchronized(_cache)
        {
            // Look for it in the cache
            CachedResource cached = (CachedResource)_cache.get(pathInContext);
            if (cached!=null)
            {
                if(log.isTraceEnabled())log.trace("CACHE HIT: "+cached);
                CachedMetaData cmd = (CachedMetaData)cached.getAssociate();
                if (cmd!=null && cmd.isValid())
                    return cached;
            }

            // Make the resource
            resource=_resourceBase.addPath(_resourceBase.encode(pathInContext));
            if(log.isTraceEnabled())log.trace("CACHE MISS: "+resource);
            if (resource==null)
                return null;

            
            // Check for file aliasing
            if (resource.getAlias()!=null)
            {
                log.warn("Alias request of '"+resource.getAlias()+
                             "' for '"+resource+"'");
                return null;
            }

            // Is it an existing file?
            long len = resource.length();
            if (resource.exists())
            {
                // Is it badly named?
                if (!resource.isDirectory() && pathInContext.endsWith("/"))
                    return null;

                // Guess directory length.
                if (resource.isDirectory())
                {
                    if (resource.list()!=null)
                        len=resource.list().length*100;
                    else
                        len=0;
                }

                // Is it cacheable?
                if (len>0 && len<_maxCachedFileSize && len<_maxCacheSize)
                {
                    int needed=_maxCacheSize-(int)len;
                    while(_cacheSize>needed)
                        _leastRecentlyUsed.invalidate();

                    cached=resource.cache();
                    if(log.isTraceEnabled())log.trace("CACHED: "+resource);
                    new CachedMetaData(cached,pathInContext);
                    return cached;
                }
            }
        }

        // Non cached response
        new ResourceMetaData(resource);
        return resource;
    }


    /* ------------------------------------------------------------ */
    public synchronized Map getMimeMap()
    {
        return _mimeMap;
    }

    /* ------------------------------------------------------------ */
    /**
     * Also sets the org.openqa.jetty.http.mimeMap context attribute
     * @param mimeMap
     */
    public void setMimeMap(Map mimeMap)
    {
        _mimeMap = mimeMap;
    }

    /* ------------------------------------------------------------ */
    /** Get the MIME type by filename extension.
     * @param filename A file name
     * @return MIME type matching the longest dot extension of the
     * file name.
     */
    public String getMimeByExtension(String filename)
    {
        String type=null;

        if (filename!=null)
        {
            int i=-1;
            while(type==null)
            {
                i=filename.indexOf(".",i+1);

                if (i<0 || i>=filename.length())
                    break;

                String ext=StringUtil.asciiToLowerCase(filename.substring(i+1));
                if (_mimeMap!=null)
                    type = (String)_mimeMap.get(ext);
                if (type==null)
                    type=(String)__dftMimeMap.get(ext);
            }
        }

        if (type==null)
        {
            if (_mimeMap!=null)
                type=(String)_mimeMap.get("*");
             if (type==null)
                 type=(String)__dftMimeMap.get("*");
        }

        return type;
    }

    /* ------------------------------------------------------------ */
    /** Set a mime mapping
     * @param extension
     * @param type
     */
    public void setMimeMapping(String extension,String type)
    {
        if (_mimeMap==null)
            _mimeMap=new HashMap();
        _mimeMap.put(StringUtil.asciiToLowerCase(extension),type);
    }


    /* ------------------------------------------------------------ */
    /** Get the map of mime type to char encoding.
     * @return Map of mime type to character encodings.
     */
    public synchronized Map getEncodingMap()
    {
        if (_encodingMap==null)
            _encodingMap=Collections.unmodifiableMap(__encodings);
        return _encodingMap;
    }

    /* ------------------------------------------------------------ */
    /** Set the map of mime type to char encoding.
     * Also sets the org.openqa.jetty.http.encodingMap context attribute
     * @param encodingMap Map of mime type to character encodings.
     */
    public void setEncodingMap(Map encodingMap)
    {
        _encodingMap = encodingMap;
    }

    /* ------------------------------------------------------------ */
    /** Get char encoding by mime type.
     * @param type A mime type.
     * @return The prefered character encoding for that type if known.
     */
    public String getEncodingByMimeType(String type)
    {
        String encoding =null;

        if (type!=null)
            encoding=(String)_encodingMap.get(type);

        return encoding;
    }

    /* ------------------------------------------------------------ */
    /** Set the encoding that should be used for a mimeType.
     * @param mimeType
     * @param encoding
     */
    public void setTypeEncoding(String mimeType,String encoding)
    {
        getEncodingMap().put(mimeType,encoding);
    }

    /* ------------------------------------------------------------ */
    public synchronized void start()
        throws Exception
    {
        if (isStarted())
            return;
        getMimeMap();
        getEncodingMap();
        _started=true;
    }

    /* ------------------------------------------------------------ */
    public boolean isStarted()
    {
        return _started;
    }

    /* ------------------------------------------------------------ */
    /** Stop the context.
     */
    public void stop()
        throws InterruptedException
    {
        _started=false;
        _cache.clear();
    }


    /* ------------------------------------------------------------ */
    /** Destroy a context.
     * Destroy a context and remove it from the HttpServer. The
     * HttpContext must be stopped before it can be destroyed.
     */
    public void destroy()
    {
        if (isStarted())
            throw new IllegalStateException("Started");

        setMimeMap(null);
        _encodingMap=null;
    }


    /* ------------------------------------------------------------ */
    /** Get Resource MetaData.
     * @param resource 
     * @return Meta data for the resource.
     */
    public ResourceMetaData getResourceMetaData(Resource resource)
    {
        Object o=resource.getAssociate();
        if (o instanceof ResourceMetaData)
            return (ResourceMetaData)o;
        return new ResourceMetaData(resource);
    }
    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /** MetaData associated with a context Resource.
     */
    public class ResourceMetaData
    {
        protected String _name;
        protected Resource _resource;

        ResourceMetaData(Resource resource)
        {
            _resource=resource;
            _name=_resource.toString();
            _resource.setAssociate(this);
        }

        public String getLength()
        {
            return Long.toString(_resource.length());
        }

        public String getLastModified()
        {
            return HttpFields.formatDate(_resource.lastModified(),false);
        }

        public String getMimeType()
        {
            return getMimeByExtension(_name);
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class CachedMetaData extends ResourceMetaData
    {
        String _lastModified;
        String _encoding;
        String _length;
        String _key;

        CachedResource _cached;
        CachedMetaData _prev;
        CachedMetaData _next;

        CachedMetaData(CachedResource resource, String pathInContext)
        {
            super(resource);
            _cached=resource;
            _length=super.getLength();
            _lastModified=super.getLastModified();
            _encoding=super.getMimeType();
            _key=pathInContext;

            _next=_mostRecentlyUsed;
            _mostRecentlyUsed=this;
            if (_next!=null)
                _next._prev=this;
            _prev=null;
            if (_leastRecentlyUsed==null)
                _leastRecentlyUsed=this;

            _cache.put(_key,resource);

            _cacheSize+=_cached.length();

        }

        public String getLength()
        {
            return _length;
        }

        public String getLastModified()
        {
            return _lastModified;
        }

        public String getMimeType()
        {
            return _encoding;
        }

        /* ------------------------------------------------------------ */
        boolean isValid()
            throws IOException
        {
            if (_cached.isUptoDate())
            {
                if (_mostRecentlyUsed!=this)
                {
                    CachedMetaData tp = _prev;
                    CachedMetaData tn = _next;

                    _next=_mostRecentlyUsed;
                    _mostRecentlyUsed=this;
                    if (_next!=null)
                        _next._prev=this;
                    _prev=null;

                    if (tp!=null)
                        tp._next=tn;
                    if (tn!=null)
                        tn._prev=tp;

                    if (_leastRecentlyUsed==this && tp!=null)
                        _leastRecentlyUsed=tp;
                }
                return true;
            }

            invalidate();
            return false;
        }

        public void invalidate()
        {
            // Invalidate it
            _cache.remove(_key);
            _cacheSize=_cacheSize-(int)_cached.length();


            if (_mostRecentlyUsed==this)
                _mostRecentlyUsed=_next;
            else
                _prev._next=_next;

            if (_leastRecentlyUsed==this)
                _leastRecentlyUsed=_prev;
            else
                _next._prev=_prev;

            _prev=null;
            _next=null;
        }
    }
    

}
