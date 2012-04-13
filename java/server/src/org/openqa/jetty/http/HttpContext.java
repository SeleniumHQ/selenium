// ========================================================================
// $Id: HttpContext.java,v 1.136 2006/02/21 09:47:43 gregwilkins Exp $
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

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URL;
import java.net.URLClassLoader;
import java.net.UnknownHostException;
import java.security.Permission;
import java.security.PermissionCollection;
import java.security.Permissions;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.ResourceCache.ResourceMetaData;
import org.openqa.jetty.http.handler.ErrorPageHandler;
import org.openqa.jetty.util.Container;
import org.openqa.jetty.util.EventProvider;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.LifeCycle;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.MultiException;
import org.openqa.jetty.util.Resource;
import org.openqa.jetty.util.URI;


/* ------------------------------------------------------------ */
/** Context for a collection of HttpHandlers.
 * HTTP Context provides an ordered container for HttpHandlers
 * that share the same path prefix, filebase, resourcebase and/or
 * classpath.
 * <p>
 * A HttpContext is analagous to a ServletContext in the
 * Servlet API, except that it may contain other types of handler
 * other than servlets.
 * <p>
 * A ClassLoader is created for the context and it uses
 * Thread.currentThread().getContextClassLoader(); as it's parent loader.
 * The class loader is initialized during start(), when a derived
 * context calls initClassLoader() or on the first call to loadClass()
 * <p>
 *
 * <B>Note. that order is important when configuring a HttpContext.
 * For example, if resource serving is enabled before servlets, then resources
 * take priority.</B>
 *
 * @see HttpServer
 * @see HttpHandler
 * @see org.openqa.jetty.jetty.servlet.ServletHttpContext
 * @version $Id: HttpContext.java,v 1.136 2006/02/21 09:47:43 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class HttpContext extends Container
                         implements LifeCycle,
                                    HttpHandler,
                                    EventProvider,
                                    Serializable
{
    private static Log log = LogFactory.getLog(HttpContext.class);

    /* ------------------------------------------------------------ */
    /** File class path attribute.
     * If this name is set as a context init parameter, then the attribute
     * name given will be used to set the file classpath for the context as a
     * context attribute.
     */
    public final static String __fileClassPathAttr=
        "org.openqa.jetty.http.HttpContext.FileClassPathAttribute";

    public final static String __ErrorHandler=
        "org.openqa.jetty.http.ErrorHandler";


    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    // These attributes are serialized by WebApplicationContext, which needs
    // to be updated if you add to these
    private String _contextPath;
    private List _vhosts=new ArrayList(2);
    private List _hosts=new ArrayList(2);
    private List _handlers=new ArrayList(3);
    private Map _attributes = new HashMap(3);
    private boolean _redirectNullPath=true;
    private boolean _statsOn=false;
    private PermissionCollection _permissions;
    private boolean _classLoaderJava2Compliant=true;
    private ResourceCache _resources;
    private String[] _systemClasses=new String [] {"java.","javax.servlet.","javax.xml.","org.openqa.jetty.","org.xml.","org.w3c.","org.apache.commons.logging."};
    private String[] _serverClasses = new String[] {"-org.openqa.jetty.http.PathMap","-org.openqa.jetty.jetty.servlet.Invoker","-org.openqa.jetty.jetty.servlet.JSR154Filter","-org.openqa.jetty.jetty.servlet.Default","org.openqa.jetty.jetty.Server","org.openqa.jetty.http.","org.openqa.jetty.start.","org.openqa.jetty.stop."};
  
    /* ------------------------------------------------------------ */
    private String _contextName;
    private String _classPath;
    private Map _initParams = new HashMap(11);
    private UserRealm _userRealm;
    private String _realmName;
    private PathMap _constraintMap=new PathMap();
    private Authenticator _authenticator;
    private RequestLog _requestLog;


    private String[] _welcomes=
    {
        "welcome.html",
        "index.html",
        "index.htm",
        "index.jsp"
    };


    /* ------------------------------------------------------------ */
    private transient boolean _gracefulStop;
    private transient ClassLoader _parent;
    private transient ClassLoader _loader;
    private transient HttpServer _httpServer;
    private transient File _tmpDir;
    private transient HttpHandler[] _handlersArray;
    private transient String[] _vhostsArray;


    /* ------------------------------------------------------------ */
    transient Object _statsLock=new Object[0];
    transient long _statsStartedAt;
    transient int _requests;
    transient int _requestsActive;
    transient int _requestsActiveMax;
    transient int _responses1xx; // Informal
    transient int _responses2xx; // Success
    transient int _responses3xx; // Redirection
    transient int _responses4xx; // Client Error
    transient int _responses5xx; // Server Error


    /* ------------------------------------------------------------ */
    /** Constructor.
     */
    public HttpContext()
    {
        setAttribute(__ErrorHandler,  new ErrorPageHandler()); 
        _resources=new ResourceCache();
        addComponent(_resources);
    }

    /* ------------------------------------------------------------ */
    /** Constructor.
     * @param httpServer
     * @param contextPathSpec
     */
    public HttpContext(HttpServer httpServer,String contextPathSpec)
    {
        this();
        setHttpServer(httpServer);
        setContextPath(contextPathSpec);
    }

    /* ------------------------------------------------------------ */
    private void readObject(java.io.ObjectInputStream in)
        throws IOException, ClassNotFoundException
    {
        in.defaultReadObject();
        _statsLock=new Object[0];
        getHandlers();
        for (int i=0;i<_handlersArray.length;i++)
            _handlersArray[i].initialize(this);
    }

    /* ------------------------------------------------------------ */
    /** Get the ThreadLocal HttpConnection.
     * Get the HttpConnection for current thread, if any.  This method is
     * not static in order to control access.
     * @return HttpConnection for this thread.
     */
    public HttpConnection getHttpConnection()
    {
        return HttpConnection.getHttpConnection();
    }

    /* ------------------------------------------------------------ */
    void setHttpServer(HttpServer httpServer)
    {
        _httpServer=httpServer;
        _contextName=null;
      
    }

    /* ------------------------------------------------------------ */
    public HttpServer getHttpServer()
    {
        return _httpServer;
    }

    /* ------------------------------------------------------------ */
    public void setStopGracefully(boolean graceful)
    {
	_gracefulStop=graceful;
    }

    /* ------------------------------------------------------------ */
    public boolean getStopGracefully()
    {
	return _gracefulStop;
    }


    /* ------------------------------------------------------------ */
    public static String canonicalContextPathSpec(String contextPathSpec)
    {
        // check context path
        if (contextPathSpec==null ||
            contextPathSpec.indexOf(',')>=0 ||
            contextPathSpec.startsWith("*"))
            throw new IllegalArgumentException ("Illegal context spec:"+contextPathSpec);

        if(!contextPathSpec.startsWith("/"))
	    contextPathSpec='/'+contextPathSpec;

        if (contextPathSpec.length()>1)
        {
            if (contextPathSpec.endsWith("/"))
                contextPathSpec+="*";
            else if (!contextPathSpec.endsWith("/*"))
                contextPathSpec+="/*";
        }

        return contextPathSpec;
    }

    /* ------------------------------------------------------------ */
    public void setContextPath(String contextPathSpec)
    {
        if (_httpServer!=null)
            _httpServer.removeMappings(this);

        contextPathSpec=canonicalContextPathSpec(contextPathSpec);

        if (contextPathSpec.length()>1)
            _contextPath=contextPathSpec.substring(0,contextPathSpec.length()-2);
        else
            _contextPath="/";

        _contextName=null;

        if (_httpServer!=null)
            _httpServer.addMappings(this);
    }


    /* ------------------------------------------------------------ */
    /**
     * @return The context prefix
     */
    public String getContextPath()
    {
        return _contextPath;
    }


    /* ------------------------------------------------------------ */
    /** Add a virtual host alias to this context.
     * @see #setVirtualHosts
     * @param hostname A hostname. A null host name means any hostname is
     * acceptable. Host names may String representation of IP addresses.
     */
    public void addVirtualHost(String hostname)
    {
        // Note that null hosts are also added.
        if (!_vhosts.contains(hostname))
        {
            _vhosts.add(hostname);
            _contextName=null;

            if (_httpServer!=null)
            {
                if (_vhosts.size()==1)
                    _httpServer.removeMapping(null,this);
                _httpServer.addMapping(hostname,this);
            }
            _vhostsArray=null;
        }
    }

    /* ------------------------------------------------------------ */
    /** remove a virtual host alias to this context.
     * @see #setVirtualHosts
     * @param hostname A hostname. A null host name means any hostname is
     * acceptable. Host names may String representation of IP addresses.
     */
    public void removeVirtualHost(String hostname)
    {
        // Note that null hosts are also added.
        if (_vhosts.remove(hostname))
        {
            _contextName=null;
            if (_httpServer!=null)
            {
                _httpServer.removeMapping(hostname,this);
                if (_vhosts.size()==0)
                    _httpServer.addMapping(null,this);
            }
            _vhostsArray=null;
        }
    }

    /* ------------------------------------------------------------ */
    /** Set the virtual hosts for the context.
     * Only requests that have a matching host header or fully qualified
     * URL will be passed to that context with a virtual host name.
     * A context with no virtual host names or a null virtual host name is
     * available to all requests that are not served by a context with a
     * matching virtual host name.
     * @param hosts Array of virtual hosts that this context responds to. A
     * null host name or null/empty array means any hostname is acceptable.
     * Host names may String representation of IP addresses.
     */
    public void setVirtualHosts(String[] hosts)
    {
        List old = new ArrayList(_vhosts);

        if (hosts!=null)
	{
	    for (int i=0;i<hosts.length;i++)
	    {
		boolean existing=old.remove(hosts[i]);
		if (!existing)
		    addVirtualHost(hosts[i]);
	    }
	}

        for (int i=0;i<old.size();i++)
            removeVirtualHost((String)old.get(i));
    }

    /* ------------------------------------------------------------ */
    /** Get the virtual hosts for the context.
     * Only requests that have a matching host header or fully qualified
     * URL will be passed to that context with a virtual host name.
     * A context with no virtual host names or a null virtual host name is
     * available to all requests that are not served by a context with a
     * matching virtual host name.
     * @return Array of virtual hosts that this context responds to. A
     * null host name or empty array means any hostname is acceptable.
     * Host names may be String representation of IP addresses.
     */
    public String[] getVirtualHosts()
    {
        if (_vhostsArray!=null)
            return _vhostsArray;
        if (_vhosts==null)
            _vhostsArray=new String[0];
        else
        {
            _vhostsArray=new String[_vhosts.size()];
            _vhostsArray=(String[])_vhosts.toArray(_vhostsArray);
        }
        return _vhostsArray;
    }


    /* ------------------------------------------------------------ */
    /** Set the hosts for the context.
     * Set the real hosts that this context will accept requests for.
     * If not null or empty, then only requests from HttpListeners for hosts
     * in this array are accepted by this context. 
     * Unlike virutal hosts, this value is not used by HttpServer for
     * matching a request to a context.
     */
    public void setHosts(String[] hosts)
        throws UnknownHostException
    {
        if (hosts==null || hosts.length==0)
            _hosts=null;
        else
        {
            _hosts=new ArrayList();
            for (int i=0;i<hosts.length;i++)
                if (hosts[i]!=null)
                    _hosts.add(InetAddress.getByName(hosts[i]));
        }
        
    }

    /* ------------------------------------------------------------ */
    /** Get the hosts for the context.
     */
    public String[] getHosts()
    {
        if (_hosts==null || _hosts.size()==0)
            return null;
        String[] hosts=new String[_hosts.size()];
        for (int i=0;i<hosts.length;i++)
        {
            InetAddress a = (InetAddress)_hosts.get(i);
            if (a!=null)
                hosts[i]=a.getHostName();
        }
        return hosts;
    }


    /* ------------------------------------------------------------ */
    /** Set system classes.
     * System classes cannot be overriden by context classloaders.
     * @param classes array of classname Strings.  Names ending with '.' are treated as package names. Names starting with '-' are treated as
     * negative matches and must be listed before any enclosing packages.
     */
    public void setSystemClasses(String[] classes)
    {
        _systemClasses=classes;
    }

    /* ------------------------------------------------------------ */
    /** Get system classes.
     * System classes cannot be overriden by context classloaders.
     * @return array of classname Strings.  Names ending with '.' are treated as package names. Names starting with '-' are treated as
     * negative matches and must be listed before any enclosing packages. Null if not set.
     */
    public String[] getSystemClasses()
    {
        return _systemClasses;
    }
    

    /* ------------------------------------------------------------ */
    /** Set system classes.
     * Servers classes cannot be seen by context classloaders.
     * @param classes array of classname Strings.  Names ending with '.' are treated as package names. Names starting with '-' are treated as
     * negative matches and must be listed before any enclosing packages.
     */
    public void setServerClasses(String[] classes)
    {
        _serverClasses=classes;
    }

    /* ------------------------------------------------------------ */
    /** Get system classes.
     * System classes cannot be seen by context classloaders.
     * @return array of classname Strings.  Names ending with '.' are treated as package names. Names starting with '-' are treated as
     * negative matches and must be listed before any enclosing packages. Null if not set.
     */
    public String[] getServerClasses()
    {
        return _serverClasses;
    }


    /* ------------------------------------------------------------ */
    public void setHandlers(HttpHandler[] handlers)
    {
        List old = new ArrayList(_handlers);

	if (handlers!=null)
	{
	    for (int i=0;i<handlers.length;i++)
	    {
		boolean existing=old.remove(handlers[i]);
		if (!existing)
		    addHandler(handlers[i]);
	    }
	}

        for (int i=0;i<old.size();i++)
            removeHandler((HttpHandler)old.get(i));
    }

    /* ------------------------------------------------------------ */
    /** Get all handlers.
     * @return List of all HttpHandlers
     */
    public HttpHandler[] getHandlers()
    {
        if (_handlersArray!=null)
            return _handlersArray;
        if (_handlers==null)
            _handlersArray=new HttpHandler[0];
        else
        {
            _handlersArray=new HttpHandler[_handlers.size()];
            _handlersArray=(HttpHandler[])_handlers.toArray(_handlersArray);
        }
        return _handlersArray;
    }


    /* ------------------------------------------------------------ */
    /** Add a handler.
     * @param i The position in the handler list
     * @param handler The handler.
     */
    public synchronized void addHandler(int i,HttpHandler handler)
    {
        _handlers.add(i,handler);
        _handlersArray=null;

        HttpContext context = handler.getHttpContext();
        if (context==null)
            handler.initialize(this);
        else if (context!=this)
            throw new IllegalArgumentException("RestishHandler in another HttpContext");
        addComponent(handler);
    }

    /* ------------------------------------------------------------ */
    /** Add a HttpHandler to the context.
     * @param handler
     */
    public synchronized void addHandler(HttpHandler handler)
    {
        addHandler(_handlers.size(),handler);
    }

    /* ------------------------------------------------------------ */
    /** Get handler index.
     * @param handler instance
     * @return Index of handler in context or -1 if not found.
     */
    public int getHandlerIndex(HttpHandler handler)
    {
        for (int h=0;h<_handlers.size();h++)
        {
            if ( handler == _handlers.get(h))
                return h;
        }
        return -1;
    }

    /* ------------------------------------------------------------ */
    /** Get a handler by class.
     * @param handlerClass
     * @return The first handler that is an instance of the handlerClass
     */
    public synchronized HttpHandler getHandler(Class handlerClass)
    {
        for (int h=0;h<_handlers.size();h++)
        {
            HttpHandler handler = (HttpHandler)_handlers.get(h);
            if (handlerClass.isInstance(handler))
                return handler;
        }
        return null;
    }

    /* ------------------------------------------------------------ */
    /** Remove a handler.
     * The handler must be stopped before being removed.
     * @param i index of handler
     */
    public synchronized HttpHandler removeHandler(int i)
    {
        HttpHandler handler = _handlersArray[i];
        if (handler.isStarted())
            try{handler.stop();} catch (InterruptedException e){log.warn(LogSupport.EXCEPTION,e);}
        _handlers.remove(i);
        _handlersArray=null;
        removeComponent(handler);
        return handler;
    }

    /* ------------------------------------------------------------ */
    /** Remove a handler.
     * The handler must be stopped before being removed.
     */
    public synchronized void removeHandler(HttpHandler handler)
    {
        if (handler.isStarted())
            try{handler.stop();} catch (InterruptedException e){log.warn(LogSupport.EXCEPTION,e);}
        _handlers.remove(handler);
        removeComponent(handler);
        _handlersArray=null;
    }


    /* ------------------------------------------------------------ */
    /** Set context init parameter.
     * Init Parameters differ from attributes as they can only
     * have string values, servlets cannot set them and they do
     * not have a package scoped name space.
     * @param param param name
     * @param value param value or null
     */
    public void setInitParameter(String param, String value)
    {
        _initParams.put(param,value);
    }

    /* ------------------------------------------------------------ */
    /** Get context init parameter.
     * @param param param name
     * @return param value or null
     */
    public String getInitParameter(String param)
    {
        return (String)_initParams.get(param);
    }

    /* ------------------------------------------------------------ */
    /** Get context init parameter.
     * @return Enumeration of names
     */
    public Enumeration getInitParameterNames()
    {
        return Collections.enumeration(_initParams.keySet());
    }

    /* ------------------------------------------------------------ */
    /** Set a context attribute.
     * @param name attribute name
     * @param value attribute value
     */
    public synchronized void setAttribute(String name, Object value)
    {
        _attributes.put(name,value);
    }

    /* ------------------------------------------------------------ */
    /**
     * @param name attribute name
     * @return attribute value or null
     */
    public Object getAttribute(String name)
    {
        return _attributes.get(name);
    }

    /* ------------------------------------------------------------ */
    /**
     */
    public Map getAttributes()
    {
        return _attributes;
    }

    /* ------------------------------------------------------------ */
    /**
     */
    public void setAttributes(Map attributes)
    {
        _attributes=attributes;
    }

    /* ------------------------------------------------------------ */
    /**
     * @return enumaration of names.
     */
    public Enumeration getAttributeNames()
    {
        return Collections.enumeration(_attributes.keySet());
    }

    /* ------------------------------------------------------------ */
    /**
     * @param name attribute name
     */
    public synchronized void removeAttribute(String name)
    {
        _attributes.remove(name);
    }


    /* ------------------------------------------------------------ */
    public void flushCache()
    {
        _resources.flushCache();
    }

    /* ------------------------------------------------------------ */
    public String[] getWelcomeFiles()
    {
        return _welcomes;
    }

    /* ------------------------------------------------------------ */
    public void setWelcomeFiles(String[] welcomes)
    {
        if (welcomes==null)
            _welcomes=new String[0];
        else
            _welcomes=welcomes;
    }

    /* ------------------------------------------------------------ */
    public void addWelcomeFile(String welcomeFile)
    {
        if (welcomeFile.startsWith("/") ||
            welcomeFile.startsWith(java.io.File.separator) ||
            welcomeFile.endsWith("/") ||
            welcomeFile.endsWith(java.io.File.separator))
            log.warn("Invalid welcome file: "+welcomeFile);
        List list = new ArrayList(Arrays.asList(_welcomes));
        list.add(welcomeFile);
        _welcomes=(String[])list.toArray(_welcomes);
    }

    /* ------------------------------------------------------------ */
    public void removeWelcomeFile(String welcomeFile)
    {
        List list = new ArrayList(Arrays.asList(_welcomes));
        list.remove(welcomeFile);
        _welcomes=(String[])list.toArray(_welcomes);
    }

    /* ------------------------------------------------------------ */
    public String getWelcomeFile(Resource resource)
        throws IOException
    {
        if (!resource.isDirectory())
            return null;

        for (int i=0;i<_welcomes.length;i++)
        {
            Resource welcome=resource.addPath(_welcomes[i]);
            if (welcome.exists())
                return _welcomes[i];
        }

        return null;
    }


    /* ------------------------------------------------------------ */
    /** Get the context classpath.
     * This method only returns the paths that have been set for this
     * context and does not include any paths from a parent or the
     * system classloader.
     * Note that this may not be a legal javac classpath.
     * @return a comma or ';' separated list of class
     * resources. These may be jar files, directories or URLs to jars
     * or directories.
     * @see #getFileClassPath()
     */
    public String getClassPath()
    {
        return _classPath;
    }

    /* ------------------------------------------------------------ */
    /** Get the file classpath of the context.
     * This method makes a best effort to return a complete file
     * classpath for the context.
     * It is obtained by walking the classloader hierarchy and looking for
     * URLClassLoaders.  The system property java.class.path is also checked for
     * file elements not already found in the loader hierarchy.
     * @return Path of files and directories for loading classes.
     * @exception IllegalStateException HttpContext.initClassLoader
     * has not been called.
     */
    public String getFileClassPath()
        throws IllegalStateException
    {
	
        ClassLoader loader = getClassLoader();
        if (loader==null)
            throw new IllegalStateException("Context classloader not initialized");
            
        LinkedList paths =new LinkedList();
        LinkedList loaders=new LinkedList();
        
        // Walk the loader hierarchy
       	while (loader !=null)
       	{
            loaders.add(0,loader);
            loader = loader.getParent();
       	}
       	
       	// Try to handle java2compliant modes
       	loader=getClassLoader();
       	if (loader instanceof ContextLoader && !((ContextLoader)loader).isJava2Compliant())
       	{
            loaders.remove(loader);
            loaders.add(0,loader);
       	}
        
        for (int i=0;i<loaders.size();i++)
        {
            loader=(ClassLoader)loaders.get(i);
            
            if (log.isDebugEnabled()) log.debug("extract paths from "+loader);
            if (loader instanceof URLClassLoader)
            {
                URL[] urls = ((URLClassLoader)loader).getURLs();
                for (int j=0;urls!=null && j<urls.length;j++)
                {
                    try
                    {
                        Resource path = Resource.newResource(urls[j]);
                        if (log.isTraceEnabled()) log.trace("path "+path);
                        File file = path.getFile();
                        if (file!=null)
                            paths.add(file.getAbsolutePath());
                    }
                    catch(Exception e)
                    {
                        LogSupport.ignore(log,e);
                    }
                }	
            }	
       	}
       	
        // Add the system classpath elements from property.
        String jcp=System.getProperty("java.class.path");
        if (jcp!=null)
        {
            StringTokenizer tok=new StringTokenizer(jcp,File.pathSeparator);
            while (tok.hasMoreTokens())
            {
                String path=tok.nextToken();
                if (!paths.contains(path))
                {
                    if(log.isTraceEnabled())log.trace("PATH="+path);
                    paths.add(path);
                }
                else
                    if(log.isTraceEnabled())log.trace("done="+path);			
            }
        }
        
        StringBuffer buf = new StringBuffer();
        Iterator iter = paths.iterator();
        while(iter.hasNext())
        {
            if (buf.length()>0)
                buf.append(File.pathSeparator);
            buf.append(iter.next().toString());
        }
        
        if (log.isDebugEnabled()) log.debug("fileClassPath="+buf);
        return buf.toString();
    }

    /* ------------------------------------------------------------ */
    /** Sets the class path for the context.
     * A class path is only required for a context if it uses classes
     * that are not in the system class path.
     * @param classPath a comma or ';' separated list of class
     * resources. These may be jar files, directories or URLs to jars
     * or directories.
     */
    public void setClassPath(String classPath)
    {
        _classPath=classPath;
        if (isStarted())
            log.warn("classpath set while started");
    }

    /* ------------------------------------------------------------ */
    /** Add the class path element  to the context.
     * A class path is only required for a context if it uses classes
     * that are not in the system class path.
     * @param classPath a comma or ';' separated list of class
     * resources. These may be jar files, directories or URLs to jars
     * or directories.
     */
    public void addClassPath(String classPath)
    {
        if (_classPath==null || _classPath.length()==0)
            _classPath=classPath;
        else
            _classPath+=","+classPath;

        if (isStarted())
            log.warn("classpath set while started");
    }

    /* ------------------------------------------------------------ */
    /** Add elements to the class path for the context from the jar and zip files found
     *  in the specified resource.
     * @param lib the resource that contains the jar and/or zip files.
     * @see #setClassPath(String)
     */
    public void addClassPaths(Resource lib)
    {
        if (isStarted())
            log.warn("classpaths set while started");

        if (lib.exists() && lib.isDirectory())
        {
            String[] files=lib.list();
            for (int f=0;files!=null && f<files.length;f++)
            {
                try {
                    Resource fn=lib.addPath(files[f]);
                    String fnlc=fn.getName().toLowerCase();
                    if (fnlc.endsWith(".jar") || fnlc.endsWith(".zip"))
                    {
                        addClassPath(fn.toString());
                    }
                }
                catch (Exception ex)
                {
                    log.warn(LogSupport.EXCEPTION,ex);
                }
            }
        }
    }

    /* ------------------------------------------------------------ */
    /** Get Java2 compliant classloading.
     * @return If true, the class loader will conform to the java 2
     * specification and delegate all loads to the parent classloader. If
     * false, the context classloader only delegate loads for system classes
     * or classes that it can't find itself.
     */
    public boolean isClassLoaderJava2Compliant()
    {
        return _classLoaderJava2Compliant;
    }

    /* ------------------------------------------------------------ */
    /** Set Java2 compliant classloading.
     * @param compliant If true, the class loader will conform to the java 2
     * specification and delegate all loads to the parent classloader. If
     * false, the context classloader only delegate loads for system classes
     * or classes that it can't find itself.
     */
    public void setClassLoaderJava2Compliant(boolean compliant)
    {
        _classLoaderJava2Compliant = compliant;
        if (_loader!=null && (_loader instanceof ContextLoader))
            ((ContextLoader)_loader).setJava2Compliant(compliant);
    }

    /* ------------------------------------------------------------ */
    /** Set temporary directory for context.
     * The javax.servlet.context.tempdir attribute is also set.
     * @param dir Writable temporary directory.
     */
    public void setTempDirectory(File dir)
    {
        if (isStarted())
            throw new IllegalStateException("Started");

        if (dir!=null)
        {
            try{dir=new File(dir.getCanonicalPath());}
            catch (IOException e){log.warn(LogSupport.EXCEPTION,e);}
        }

        if (dir!=null && !dir.exists())
        {
            dir.mkdir();
            dir.deleteOnExit();
        }

        if (dir!=null && ( !dir.exists() || !dir.isDirectory() || !dir.canWrite()))
            throw new IllegalArgumentException("Bad temp directory: "+dir);

        _tmpDir=dir;
        setAttribute("javax.servlet.context.tempdir",_tmpDir);
    }

    /* ------------------------------------------------------------ */
    /** Get Context temporary directory.
     * A tempory directory is generated if it has not been set.  The
     * "javax.servlet.context.tempdir" attribute is consulted and if
     * not set, the host, port and context are used to generate a
     * directory within the JVMs temporary directory.
     * @return Temporary directory as a File.
     */
    public File getTempDirectory()
    {
        if (_tmpDir!=null)
            return _tmpDir;

        // Initialize temporary directory
        //
        // I'm afraid that this is very much black magic.
        // but if you can think of better....
        Object t = getAttribute("javax.servlet.context.tempdir");

        if (t!=null && (t instanceof File))
        {
            _tmpDir=(File)t;
            if (_tmpDir.isDirectory() && _tmpDir.canWrite())
                return _tmpDir;
        }

        if (t!=null && (t instanceof String))
        {
            try
            {
                _tmpDir=new File((String)t);

                if (_tmpDir.isDirectory() && _tmpDir.canWrite())
                {
                    if(log.isDebugEnabled())log.debug("Converted to File "+_tmpDir+" for "+this);
                    setAttribute("javax.servlet.context.tempdir",_tmpDir);
                    return _tmpDir;
                }
            }
            catch(Exception e)
            {
                log.warn(LogSupport.EXCEPTION,e);
            }
        }

        // No tempdir so look for a WEB-INF/work directory to use as tempDir base
        File work=null;
        try
        {
            work=new File(System.getProperty("jetty.home"),"work");
            if (!work.exists() || !work.canWrite() || !work.isDirectory())
                work=null;
        }
        catch(Exception e)
        {
            LogSupport.ignore(log,e);
        }

        // No tempdir set so make one!
        try
        {
            HttpListener httpListener=_httpServer.getListeners()[0];

            String vhost = null;
            for (int h=0;vhost==null && _vhosts!=null && h<_vhosts.size();h++)
                vhost=(String)_vhosts.get(h);
            String host=httpListener.getHost();
            String temp="Jetty_"+
                (host==null?"":host)+
                "_"+
                httpListener.getPort()+
                "_"+
                (vhost==null?"":vhost)+
                getContextPath();

            temp=temp.replace('/','_');
            temp=temp.replace('.','_');
            temp=temp.replace('\\','_');

            
            if (work!=null)
                _tmpDir=new File(work,temp);
            else
            {
                _tmpDir=new File(System.getProperty("java.io.tmpdir"),temp);
                
                if (_tmpDir.exists())
                {
                    if(log.isDebugEnabled())log.debug("Delete existing temp dir "+_tmpDir+" for "+this);
                    if (!IO.delete(_tmpDir))
                    {
                        if(log.isDebugEnabled())log.debug("Failed to delete temp dir "+_tmpDir);
                    }
                
                    if (_tmpDir.exists())
                    {
                        String old=_tmpDir.toString();
                        _tmpDir=File.createTempFile(temp+"_","");
                        if (_tmpDir.exists())
                            _tmpDir.delete();
                        log.warn("Can't reuse "+old+", using "+_tmpDir);
                    }
                }
            }

            if (!_tmpDir.exists())
                _tmpDir.mkdir();
            if (work==null)
                _tmpDir.deleteOnExit();
            if(log.isDebugEnabled())log.debug("Created temp dir "+_tmpDir+" for "+this);
        }
        catch(Exception e)
        {
            _tmpDir=null;
            LogSupport.ignore(log,e);
        }

        if (_tmpDir==null)
        {
            try{
                // that didn't work, so try something simpler (ish)
                _tmpDir=File.createTempFile("JettyContext","");
                if (_tmpDir.exists())
                    _tmpDir.delete();
                _tmpDir.mkdir();
                _tmpDir.deleteOnExit();
                if(log.isDebugEnabled())log.debug("Created temp dir "+_tmpDir+" for "+this);
            }
            catch(IOException e)
            {
                log.fatal(e); System.exit(1);
            }
        }

        setAttribute("javax.servlet.context.tempdir",_tmpDir);
        return _tmpDir;
    }



    /* ------------------------------------------------------------ */
    /** Set ClassLoader.
     * @param loader The loader to be used by this context.
     */
    public synchronized void setClassLoader(ClassLoader loader)
    {
        if (isStarted())
            throw new IllegalStateException("Started");
        _loader=loader;
    }


    /* ------------------------------------------------------------ */
    /** Get the classloader.
     * If no classloader has been set and the context has been loaded
     * normally, then null is returned.
     * If no classloader has been set and the context was loaded from
     * a classloader, that loader is returned.
     * If a classloader has been set and no classpath has been set then
     * the set classloader is returned.
     * If a classloader and a classpath has been set, then a new
     * URLClassloader initialized on the classpath with the set loader as a
     * partent is return.
     * @return Classloader or null.
     */
    public synchronized ClassLoader getClassLoader()
    {
        return _loader;
    }

    /* ------------------------------------------------------------ */
    /** Set Parent ClassLoader.
     * By default the parent loader is the thread context classloader
     * of the thread that calls initClassLoader.  If setClassLoader is
     * called, then the parent is ignored.
     * @param loader The class loader to use for the parent loader of
     * the context classloader.
     */
    public synchronized void setParentClassLoader(ClassLoader loader)
    {
        if (isStarted())
            throw new IllegalStateException("Started");
        _parent=loader;
    }

    /* ------------------------------------------------------------ */
    public ClassLoader getParentClassLoader()
    {
        return _parent;
    }

    /* ------------------------------------------------------------ */
    /** Initialize the context classloader.
     * Initialize the context classloader with the current parameters.
     * Any attempts to change the classpath after this call will
     * result in a IllegalStateException
     * @param forceContextLoader If true, a ContextLoader is always if
     * no loader has been set.
     */
    protected void initClassLoader(boolean forceContextLoader)
        throws MalformedURLException, IOException
    {
        ClassLoader parent=_parent;
        if (_loader==null)
        {
            // If no parent, then try this threads classes loader as parent
            if (parent==null)
                parent=Thread.currentThread().getContextClassLoader();

            // If no parent, then try this classes loader as parent
            if (parent==null)
                parent=this.getClass().getClassLoader();

            if(log.isDebugEnabled())log.debug("Init classloader from "+_classPath+
                       ", "+parent+" for "+this);

            if (forceContextLoader || _classPath!=null || _permissions!=null)
            {
                ContextLoader loader=new ContextLoader(this,_classPath,parent,_permissions);
                loader.setJava2Compliant(_classLoaderJava2Compliant);
                _loader=loader;
            }
            else
                _loader=parent;
        }
    }

    /* ------------------------------------------------------------ */
    public synchronized Class loadClass(String className)
        throws ClassNotFoundException
    {
        if (_loader==null)
        {
            try{initClassLoader(false);}
            catch(Exception e)
            {
                log.warn(LogSupport.EXCEPTION,e);
                return null;
            }
        }

        if (className==null)
            return null;

        if (_loader == null) 
            return Class.forName(className); 
        return _loader.loadClass(className);
    }

    /* ------------------------------------------------------------ */
    /** Set the realm name.
     * @param realmName The name to use to retrieve the actual realm
     * from the HttpServer
     */
    public void setRealmName(String realmName)
    {
        _realmName=realmName;
    }

    /* ------------------------------------------------------------ */
    public String getRealmName()
    {
        return _realmName;
    }

    /* ------------------------------------------------------------ */
    /** Set the  realm.
     */
    public void setRealm(UserRealm realm)
    {
        _userRealm=realm;
    }

    /* ------------------------------------------------------------ */
    public UserRealm getRealm()
    {
        return _userRealm;
    }

    /* ------------------------------------------------------------ */
    public Authenticator getAuthenticator()
    {
        return _authenticator;
    }

    /* ------------------------------------------------------------ */
    public void setAuthenticator(Authenticator authenticator)
    {
        _authenticator=authenticator;
    }

    /* ------------------------------------------------------------ */
    public void addSecurityConstraint(String pathSpec, SecurityConstraint sc)
    {
        Object scs = _constraintMap.get(pathSpec);
        scs = LazyList.add(scs,sc);
        _constraintMap.put(pathSpec,scs);
        
        if(log.isDebugEnabled())log.debug("added "+sc+" at "+pathSpec);
    }

    /* ------------------------------------------------------------ */
    public void clearSecurityConstraints()
    {
        _constraintMap.clear();
    }

    /* ------------------------------------------------------------ */
    public boolean checkSecurityConstraints(
        String pathInContext,
        HttpRequest request,
        HttpResponse response)
        throws HttpException, IOException
    {
        UserRealm realm= getRealm();

        List scss= _constraintMap.getMatches(pathInContext);
        String pattern=null;
        if (scss != null && scss.size() > 0)
        {
            Object constraints= null;

            // for each path match
            // Add only constraints that have the correct method
            // break if the matching pattern changes.  This allows only
            // constraints with matching pattern and method to be combined.
            loop:
            for (int m= 0; m < scss.size(); m++)
            {
                Map.Entry entry= (Map.Entry)scss.get(m);
                Object scs= entry.getValue();
                String p=(String)entry.getKey();
                for (int c=0;c<LazyList.size(scs);c++)
                {
                	SecurityConstraint sc=(SecurityConstraint)LazyList.get(scs,c);
					if (!sc.forMethod(request.getMethod()))
						continue;
						
					if (pattern!=null && !pattern.equals(p))
						break loop;
					pattern=p;	
	                constraints= LazyList.add(constraints, sc);
                }
            }
            
            return SecurityConstraint.check(
                LazyList.getList(constraints),
                _authenticator,
                realm,
                pathInContext,
                request,
                response);
        }
        request.setUserPrincipal(HttpRequest.__NOT_CHECKED);
        return true;
    }

    /* ------------------------------------------------------------ */
    /** Set null path redirection.
     * @param b if true a /context request will be redirected to
     * /context/ if there is not path in the context.
     */
    public void setRedirectNullPath(boolean b)
    {
        _redirectNullPath=b;
    }

    /* ------------------------------------------------------------ */
    /**
     * @return True if a /context request is redirected to /context/ if
     * there is not path in the context.
     */
    public boolean isRedirectNullPath()
    {
        return _redirectNullPath;
    }



    /* ------------------------------------------------------------ */
    /** Set the permissions to be used for this context.
     * The collection of permissions set here are used for all classes
     * loaded by this context.  This is simpler that creating a
     * security policy file, as not all code sources may be statically
     * known.
     * @param permissions
     */
    public void setPermissions(PermissionCollection permissions)
    {
        _permissions=permissions;
    }

    /* ------------------------------------------------------------ */
    /** Get the permissions to be used for this context.
     */
    public PermissionCollection getPermissions()
    {
        return _permissions;
    }

    /* ------------------------------------------------------------ */
    /** Add a permission to this context.
     * The collection of permissions set here are used for all classes
     * loaded by this context.  This is simpler that creating a
     * security policy file, as not all code sources may be statically
     * known.
     * @param permission
     */
    public void addPermission(Permission permission)
    {
        if (_permissions==null)
            _permissions=new Permissions();
        _permissions.add(permission);
    }

    /* ------------------------------------------------------------ */
    /** RestishHandler request.
     * Determine the path within the context and then call
     * handle(pathInContext,request,response).
     * @param request
     * @param response
     * @exception HttpException
     * @exception IOException
     */
    public void handle(HttpRequest request,
                       HttpResponse response)
        throws HttpException, IOException
    {
        if (!isStarted() || _gracefulStop)
            return;

        // reject requests by real host
        if (_hosts!=null && _hosts.size()>0)
        {
            Object o = request.getHttpConnection().getConnection();
            if (o instanceof Socket)
            {
                Socket s=(Socket)o;
                if (!_hosts.contains(s.getLocalAddress()))
                {
                    if(log.isDebugEnabled())log.debug(s.getLocalAddress()+" not in "+_hosts);
                    return;
                }
            }
        }
        
        // handle stats
        if (_statsOn)
        {
            synchronized(_statsLock)
            {
                _requests++;
                _requestsActive++;
                if (_requestsActive>_requestsActiveMax)
                    _requestsActiveMax=_requestsActive;
            }
        }

        String pathInContext = URI.canonicalPath(request.getPath());
        if (pathInContext==null)
        {
            // Must be a bad request.
            throw new HttpException(HttpResponse.__400_Bad_Request);
        }

        if (_contextPath.length()>1)
            pathInContext=pathInContext.substring(_contextPath.length());

        if (_redirectNullPath && (pathInContext==null ||
                                  pathInContext.length()==0))
        {
            StringBuffer buf=request.getRequestURL();
            buf.append("/");
            String q=request.getQuery();
            if (q!=null&&q.length()!=0)
                buf.append("?"+q);
                
            response.sendRedirect(buf.toString());
            if (log.isDebugEnabled())
                log.debug(this+" consumed all of path "+
                             request.getPath()+
                             ", redirect to "+buf.toString());
            return;
        }

        String pathParams=null;
        int semi = pathInContext.lastIndexOf(';');
        if (semi>=0)
        {
            int pl = pathInContext.length()-semi;
            String ep=request.getEncodedPath();
            if(';'==ep.charAt(ep.length()-pl))
            {
                pathParams=pathInContext.substring(semi+1);
                pathInContext=pathInContext.substring(0,semi);
            }
        }

        try
        {
            handle(pathInContext,pathParams,request,response);
        }
        finally
        {
            if (_userRealm!=null && request.hasUserPrincipal())
                _userRealm.disassociate(request.getUserPrincipal());
        }
    }

    /* ------------------------------------------------------------ */
    /** RestishHandler request.
     * Call each HttpHandler until request is handled.
     * @param pathInContext Path in context
     * @param pathParams Path parameters such as encoded Session ID
     * @param request
     * @param response
     * @exception HttpException
     * @exception IOException
     */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
        throws HttpException, IOException
    {
        Object old_scope= null;
        try
        {
            old_scope= enterContextScope(request,response);
            HttpHandler[] handlers= getHandlers();
            for (int k= 0; k < handlers.length; k++)
            {
                HttpHandler handler= handlers[k];
                if (handler == null)
                {
                    handlers= getHandlers();
                    k= -1;
                    continue;
                }
                if (!handler.isStarted())
                {
                    if (log.isDebugEnabled())
                        log.debug(handler + " not started in " + this);
                    continue;
                }
                if (log.isDebugEnabled())
                    log.debug("RestishHandler " + handler);
                handler.handle(pathInContext, pathParams, request, response);
                if (request.isHandled())
                {
                    if (log.isDebugEnabled())
                        log.debug("Handled by " + handler);
                    return;
                }
            }
            return;
        }
        finally
        {
            leaveContextScope(request, response, old_scope);
        }
    }

    /* ------------------------------------------------------------ */
    /** Enter the context scope.
     * This method is called (by handle or servlet dispatchers) to indicate that
     * request handling is entering the scope of this context.  The opaque scope object
     * returned, should be passed to the leaveContextScope method.
     */
    public Object enterContextScope(HttpRequest request, HttpResponse response)
    {
        // Save the thread context loader
        Thread thread = Thread.currentThread();
        ClassLoader cl=thread.getContextClassLoader();
        HttpContext c=response.getHttpContext();

        Scope scope=null;
        if (cl!=HttpContext.class.getClassLoader() || c!=null)
        {
            scope=new Scope();
            scope._classLoader=cl;
            scope._httpContext=c;
        }
        
        if (_loader!=null)
            thread.setContextClassLoader(_loader);
        response.setHttpContext(this);
            
        return scope;
    }
    
    /* ------------------------------------------------------------ */
    /** Leave the context scope.
     * This method is called (by handle or servlet dispatchers) to indicate that
     * request handling is leaveing the scope of this context.  The opaque scope object
     * returned by enterContextScope should be passed in.
     */
    public void leaveContextScope(HttpRequest request, HttpResponse response,Object oldScope)
    {
        if (oldScope==null)
        {
            Thread.currentThread()
                .setContextClassLoader(HttpContext.class.getClassLoader());
            response.setHttpContext(null);
        }
        else
        {
            Scope old = (Scope)oldScope;
            Thread.currentThread().setContextClassLoader(old._classLoader);
            response.setHttpContext(old._httpContext);
        }
    }
    

    /* ------------------------------------------------------------ */
    public String getHttpContextName()
    {
        if (_contextName==null)
            _contextName = (_vhosts.size()>1?(_vhosts.toString()+":"):"")+_contextPath;
        return _contextName;
    }

    /* ------------------------------------------------------------ */
    public void setHttpContextName(String s)
    {
        _contextName=s;
    }
    
    /* ------------------------------------------------------------ */
    public String toString()
    {
        return "HttpContext["+getContextPath()+","+getHttpContextName()+"]";
    }

    /* ------------------------------------------------------------ */
    public String toString(boolean detail)
    {
        return "HttpContext["+getContextPath()+","+getHttpContextName()+"]" +
            (detail?("="+_handlers):"");
    }

    
    /* ------------------------------------------------------------ */
    protected synchronized void doStart()
        throws Exception
    {
        if (isStarted())
            return;

        if (_httpServer.getServerClasses()!=null)
            _serverClasses=_httpServer.getServerClasses();
        if (_httpServer.getSystemClasses()!=null)
            _systemClasses=_httpServer.getSystemClasses();
        
        _resources.start();
        
        statsReset();

        if (_httpServer==null)
            throw new IllegalStateException("No server for "+this);

        // start the context itself
        _resources.getMimeMap();
        _resources.getEncodingMap();

        // Setup realm
        if (_userRealm==null && _authenticator!=null)
        {
            _userRealm=_httpServer.getRealm(_realmName);
            if (_userRealm==null)
                log.warn("No Realm: "+_realmName);
        }

        // setup the context loader
        initClassLoader(false);

        // Set attribute if needed
        String attr = getInitParameter(__fileClassPathAttr);
        if (attr!=null && attr.length()>0)
            setAttribute(attr,getFileClassPath());

        // Start the handlers
        Thread thread = Thread.currentThread();
        ClassLoader lastContextLoader=thread.getContextClassLoader();
        try
        {
            if (_loader!=null)
                thread.setContextClassLoader(_loader);

            if (_requestLog!=null)
                _requestLog.start();
            
            startHandlers();
        }
        finally
        {
            thread.setContextClassLoader(lastContextLoader);
            getHandlers();
        }

    }

    /* ------------------------------------------------------------ */
    /** Start the handlers.
     * This is called by start after the classloader has been
     * initialized and set as the thread context loader.
     * It may be specialized to provide custom handling
     * before any handlers are started.
     * @exception Exception
     */
    protected void startHandlers()
        throws Exception
    {
        // Prepare a multi exception
        MultiException mx = new MultiException();

        Iterator handlers = _handlers.iterator();
        while(handlers.hasNext())
        {
            HttpHandler handler=(HttpHandler)handlers.next();
            if (!handler.isStarted())
                try{handler.start();}catch(Exception e){mx.add(e);}
        }
        mx.ifExceptionThrow();
    }

    /* ------------------------------------------------------------ */
    /** Stop the context.
     * @param graceful If true and statistics are on, then this method will wait
     * for requestsActive to go to zero before calling stop()
     */
    public void stop(boolean graceful)
        throws InterruptedException
    {
        boolean gs=_gracefulStop;
        try
        {
            _gracefulStop=true;
            
            // wait for all requests to complete.
            while (graceful && _statsOn && _requestsActive>0 && _httpServer!=null)
                try {Thread.sleep(100);}
            catch (InterruptedException e){throw e;}
            catch (Exception e){LogSupport.ignore(log,e);}
            
            stop();
        }
        finally
        {
            _gracefulStop=gs;
        }
    }

    /* ------------------------------------------------------------ */
    /** Stop the context.
     */
    protected void doStop()
        throws Exception
    {
        if (_httpServer==null)
            throw new InterruptedException("Destroy called");

        synchronized(this)
        {
            // Notify the container for the stop
            Thread thread = Thread.currentThread();
            ClassLoader lastContextLoader=thread.getContextClassLoader();
            try
            {
                if (_loader!=null)
                    thread.setContextClassLoader(_loader);
                Iterator handlers = _handlers.iterator();
                while(handlers.hasNext())
                {
                    HttpHandler handler=(HttpHandler)handlers.next();
                    if (handler.isStarted())
                    {
                        try{handler.stop();}
                        catch(Exception e){log.warn(LogSupport.EXCEPTION,e);}
                    }
                }
                
                if (_requestLog!=null)
                    _requestLog.stop();
            }
            finally
            {
                thread.setContextClassLoader(lastContextLoader);
            }
            
            // TODO this is a poor test
            if (_loader instanceof ContextLoader)
            {
                ((ContextLoader)_loader).destroy();
                LogFactory.release(_loader);
            }
            
            _loader=null;
        }
        _resources.flushCache();
        _resources.stop();
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

        if (_httpServer!=null)
            _httpServer.removeContext(this);

        _httpServer=null;
        
        if (_handlers!=null)
            _handlers.clear();
        
        _handlers=null;
        _parent=null;
        _loader=null;
        if (_attributes!=null)
            _attributes.clear();
        _attributes=null;
        if (_initParams!=null)
            _initParams.clear();
        _initParams=null;
        if (_vhosts!=null)
            _vhosts.clear();
        _vhosts=null;
        _hosts=null;
        _tmpDir=null;

        _permissions=null;
        
        removeComponent(_resources);
        if (_resources!=null)
        {
            _resources.flushCache();
            if (_resources.isStarted())
                try{_resources.stop();}catch(Exception e){LogSupport.ignore(log,e);}
                _resources.destroy();
        }
        _resources=null;
        
        super.destroy();
        
    }


    /* ------------------------------------------------------------ */
    /** Set the request log.
     * @param log RequestLog to use.
     */
    public void setRequestLog(RequestLog log)
    {
        _requestLog=log;
    }

    /* ------------------------------------------------------------ */
    public RequestLog getRequestLog()
    {
        return _requestLog;
    }


    /* ------------------------------------------------------------ */
    /** Send an error response.
     * This method may be specialized to provide alternative error handling for
     * errors generated by the container.  The default implemenation calls HttpResponse.sendError
     * @param response the response to send
     * @param code The error code
     * @param msg The message for the error or null for the default
     * @throws IOException Problem sending response.
     */
    public void sendError(HttpResponse response,int code,String msg)
    	throws IOException
    {
        response.sendError(code,msg);
    }
    
    /* ------------------------------------------------------------ */
    /** Send an error response.
     * This method obtains the responses context and call sendError for context specific
     * error handling.
     * @param response the response to send
     * @param code The error code
     * @param msg The message for the error or null for the default
     * @throws IOException Problem sending response.
     */
    public static void sendContextError(HttpResponse response,int code,String msg)
    	throws IOException
    {
        HttpContext context = response.getHttpContext();
        if (context!=null)
            context.sendError(response,code,msg);
        else
            response.sendError(code,msg);
    }
    
    /* ------------------------------------------------------------ */
    /** True set statistics recording on for this context.
     * @param on If true, statistics will be recorded for this context.
     */
    public void setStatsOn(boolean on)
    {
        log.info("setStatsOn "+on+" for "+this);
        _statsOn=on;
        statsReset();
    }

    /* ------------------------------------------------------------ */
    public boolean getStatsOn() {return _statsOn;}

    /* ------------------------------------------------------------ */
    public long getStatsOnMs()
    {return _statsOn?(System.currentTimeMillis()-_statsStartedAt):0;}

    /* ------------------------------------------------------------ */
    public void statsReset()
    {
        synchronized(_statsLock)
        {
            if (_statsOn)
                _statsStartedAt=System.currentTimeMillis();
            _requests=0;
            _requestsActiveMax=_requestsActive;
            _responses1xx=0;
            _responses2xx=0;
            _responses3xx=0;
            _responses4xx=0;
            _responses5xx=0;
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * @return Get the number of requests handled by this context
     * since last call of statsReset(). If setStatsOn(false) then this
     * is undefined.
     */
    public int getRequests() {return _requests;}

    /* ------------------------------------------------------------ */
    /**
     * @return Number of requests currently active.
     * Undefined if setStatsOn(false).
     */
    public int getRequestsActive() {return _requestsActive;}

    /* ------------------------------------------------------------ */
    /**
     * @return Maximum number of active requests
     * since statsReset() called. Undefined if setStatsOn(false).
     */
    public int getRequestsActiveMax() {return _requestsActiveMax;}

    /* ------------------------------------------------------------ */
    /**
     * @return Get the number of responses with a 2xx status returned
     * by this context since last call of statsReset(). Undefined if
     * if setStatsOn(false).
     */
    public int getResponses1xx() {return _responses1xx;}

    /* ------------------------------------------------------------ */
    /**
     * @return Get the number of responses with a 100 status returned
     * by this context since last call of statsReset(). Undefined if
     * if setStatsOn(false).
     */
    public int getResponses2xx() {return _responses2xx;}

    /* ------------------------------------------------------------ */
    /**
     * @return Get the number of responses with a 3xx status returned
     * by this context since last call of statsReset(). Undefined if
     * if setStatsOn(false).
     */
    public int getResponses3xx() {return _responses3xx;}

    /* ------------------------------------------------------------ */
    /**
     * @return Get the number of responses with a 4xx status returned
     * by this context since last call of statsReset(). Undefined if
     * if setStatsOn(false).
     */
    public int getResponses4xx() {return _responses4xx;}

    /* ------------------------------------------------------------ */
    /**
     * @return Get the number of responses with a 5xx status returned
     * by this context since last call of statsReset(). Undefined if
     * if setStatsOn(false).
     */
    public int getResponses5xx() {return _responses5xx;}


    /* ------------------------------------------------------------ */
    /** Log a request and response.
     * Statistics are also collected by this method.
     * @param request
     * @param response
     */
    public void log(HttpRequest request,
                    HttpResponse response,
                    int length)
    {
        if (_statsOn)
        {
            synchronized(_statsLock)
            {
                if (--_requestsActive<0)
                    _requestsActive=0;

                if (response!=null)
                {
                    switch(response.getStatus()/100)
                    {
                      case 1: _responses1xx++;break;
                      case 2: _responses2xx++;break;
                      case 3: _responses3xx++;break;
                      case 4: _responses4xx++;break;
                      case 5: _responses5xx++;break;
                    }
                }
            }
        }

        if (_requestLog!=null &&
            request!=null &&
            response!=null)
            _requestLog.log(request,response,length);
        else if (_httpServer!=null)
            _httpServer.log(request,response,length);
    }

    

    /* ------------------------------------------------------------ */
    /* Class to save scope of nested context calls
     */
    private static class Scope 
    {
        ClassLoader _classLoader;
        HttpContext _httpContext;
    }

    /* 
     * @see org.openqa.jetty.http.HttpHandler#getName()
     */
    public String getName()
    {
        return this.getContextPath();
    }

    /* 
     * @see org.openqa.jetty.http.HttpHandler#getHttpContext()
     */
    public HttpContext getHttpContext()
    {
        return this;
    }

    /* 
     * @see org.openqa.jetty.http.HttpHandler#initialize(org.openqa.jetty.http.HttpContext)
     */
    public void initialize(HttpContext context)
    {
        throw new UnsupportedOperationException();
    }   
    
    /**
     * @return A Resource object from our local ResourceCache object.
     */
    public Resource getBaseResource()
    {
        return _resources.getBaseResource();
    }

    /**
     * @param type
     * @return A String with the MIME type encoding method in it.
     */
    public String getEncodingByMimeType(String type)
    {
        return _resources.getEncodingByMimeType(type);
    }
    /**
     * @return A Map object from our local ResourcesCache.getEncodingMap() method.
     */
    public Map getEncodingMap()
    {
        return _resources.getEncodingMap();
    }
    /**
     * @return An int with the max cached file size from our CachedResources object.
     */
    public int getMaxCachedFileSize()
    {
        return _resources.getMaxCachedFileSize();
    }
    /**
     * @return An int with the max cache size from our CachedResources object.
     */
    public int getMaxCacheSize()
    {
        return _resources.getMaxCacheSize();
    }
    /**
     * @param filename
     * @return A String with the MIME type as reported from our CachedResources
     * object based on the passed filename.
     */
    public String getMimeByExtension(String filename)
    {
        return _resources.getMimeByExtension(filename);
    }
    /**
     * @return A Map returned from getMimeMap() using our CachedResources object.
     */
    public Map getMimeMap()
    {
        return _resources.getMimeMap();
    }
    /**
     * @param pathInContext
     * @return A Resource object using the getResource(pathInContext) method of
     * our CachedResources object.
     * @throws IOException
     */
    public Resource getResource(String pathInContext) throws IOException
    {
        return _resources.getResource(pathInContext);
    }
    /**
     * @return The String returned by the getResourceBase() method of our
     * CachedResources object.
     */
    public String getResourceBase()
    {
        return _resources.getResourceBase();
    }
    /**
     * @param resource
     * @return The ResourceMetaData object returned from our CachedResources
     * object using the getResourceMetaData(resource) method.
     */
    public ResourceMetaData getResourceMetaData(Resource resource)
    {
        return _resources.getResourceMetaData(resource);
    }
    /**
     * @param base
     */
    public void setBaseResource(Resource base)
    {
        _resources.setBaseResource(base);
    }
    /**
     * @param encodingMap
     */
    public void setEncodingMap(Map encodingMap)
    {
        _resources.setEncodingMap(encodingMap);
    }
    /**
     * @param maxCachedFileSize
     */
    public void setMaxCachedFileSize(int maxCachedFileSize)
    {
        _resources.setMaxCachedFileSize(maxCachedFileSize);
    }
    /**
     * @param maxCacheSize
     */
    public void setMaxCacheSize(int maxCacheSize)
    {
        _resources.setMaxCacheSize(maxCacheSize);
    }
    /**
     * @param mimeMap
     */
    public void setMimeMap(Map mimeMap)
    {
        _resources.setMimeMap(mimeMap);
    }
    /**
     * @param extension
     * @param type
     */
    public void setMimeMapping(String extension, String type)
    {
        _resources.setMimeMapping(extension, type);
    }
    /**
     * @param resourceBase
     */
    public void setResourceBase(String resourceBase)
    {
        _resources.setResourceBase(resourceBase);
    }
    /**
     * @param mimeType
     * @param encoding
     */
    public void setTypeEncoding(String mimeType, String encoding)
    {
        _resources.setTypeEncoding(mimeType, encoding);
    }
}
