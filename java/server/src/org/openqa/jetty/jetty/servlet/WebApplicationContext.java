// ========================================================================
// $Id: WebApplicationContext.java,v 1.136 2005/10/26 08:11:04 gregwilkins Exp $
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

package org.openqa.jetty.jetty.servlet;

import java.io.Externalizable;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.security.PermissionCollection;
import java.util.Collections;
import java.util.EventListener;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpHandler;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.UserRealm;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.util.JarResource;
import org.openqa.jetty.util.LazyList;
import org.openqa.jetty.util.Loader;
import org.openqa.jetty.util.MultiException;
import org.openqa.jetty.util.Resource;

/* ------------------------------------------------------------ */
/** Standard web.xml configured HttpContext.
 *
 * This specialization of HttpContext uses the standardized web.xml
 * to describe a web application and configure the handlers for the
 * HttpContext.
 *
 * If a file named web-jetty.xml or jetty-web.xml is found in the
 * WEB-INF directory it is applied to the context using the
 * XmlConfiguration format.
 *
 * A single WebApplicationHandler instance is used to provide
 * security, filter, sevlet and resource handling.
 *
 * @see org.openqa.jetty.jetty.servlet.WebApplicationHandler
 * @version $Id: WebApplicationContext.java,v 1.136 2005/10/26 08:11:04 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class WebApplicationContext extends ServletHttpContext implements Externalizable
{
    private static Log log= LogFactory.getLog(WebApplicationContext.class);

    /* ------------------------------------------------------------ */
    private String _defaultsDescriptor= "org/openqa/jetty/jetty/servlet/webdefault.xml";
    private String _war;
    private boolean _extract;
    private boolean _ignorewebjetty;
    private boolean _distributable;
    private Configuration[] _configurations;
    private String[] _configurationClassNames;

    private transient Map _resourceAliases;
    private transient Resource _webApp;
    private transient Resource _webInf;
    private transient WebApplicationHandler _webAppHandler;
    private transient Object _contextListeners;
    private transient Map _errorPages;

    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public WebApplicationContext()
    {
    }

    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param webApp The Web application directory or WAR file.
     */
    public WebApplicationContext(String webApp)
    {
        _war= webApp;
    }

    /* ------------------------------------------------------------ */
    public void writeExternal(java.io.ObjectOutput out) throws java.io.IOException
    {
        out.writeObject(getContextPath());
        out.writeObject(getVirtualHosts());
        HttpHandler[] handlers= getHandlers();
        for (int i= 0; i < handlers.length; i++)
        {
            if (handlers[i] instanceof WebApplicationHandler)
                break;
            out.writeObject(handlers[i]);
        }
        out.writeObject(getAttributes());
        out.writeBoolean(isRedirectNullPath());
        out.writeInt(getMaxCachedFileSize());
        out.writeInt(getMaxCacheSize());
        out.writeBoolean(getStatsOn());
        out.writeObject(getPermissions());
        out.writeBoolean(isClassLoaderJava2Compliant());

        out.writeObject(_defaultsDescriptor);
        out.writeObject(_war);
        out.writeBoolean(_extract);
        out.writeBoolean(_ignorewebjetty);
        out.writeBoolean(_distributable);
        
        out.writeObject(_configurationClassNames);
    }

    /* ------------------------------------------------------------ */
    public void readExternal(java.io.ObjectInput in) throws java.io.IOException, ClassNotFoundException
    {
        setContextPath((String)in.readObject());
        setVirtualHosts((String[])in.readObject());
        Object o= in.readObject();

        while (o instanceof HttpHandler)
        {
            addHandler((HttpHandler)o);
            o= in.readObject();
        }
        setAttributes((Map)o);
        setRedirectNullPath(in.readBoolean());
        setMaxCachedFileSize(in.readInt());
        setMaxCacheSize(in.readInt());
        setStatsOn(in.readBoolean());
        setPermissions((PermissionCollection)in.readObject());
        setClassLoaderJava2Compliant(in.readBoolean());

        _defaultsDescriptor= (String)in.readObject();
        _war= (String)in.readObject();
        _extract= in.readBoolean();
        _ignorewebjetty= in.readBoolean();
        _distributable= in.readBoolean();
        _configurationClassNames=(String[])in.readObject();
    }

    

    /* ------------------------------------------------------------ */
    public void setConfigurationClassNames (String[] configurationClassNames)
    {
        if (null != configurationClassNames)
        {
            _configurationClassNames = new String[configurationClassNames.length];
            System.arraycopy (configurationClassNames, 0, _configurationClassNames, 0, configurationClassNames.length);
        }
    }

    /* ------------------------------------------------------------ */
    public String[] getConfigurationClassNames ()
    {
        return _configurationClassNames;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @param war Filename or URL of the web application directory or WAR file. 
     */
    public void setWAR(String war)
    {
        _war= war;
    }

    /* ------------------------------------------------------------ */
    public String getWAR()
    {
        return _war;
    }

    /* ------------------------------------------------------------ */
    public WebApplicationHandler getWebApplicationHandler()
    {
        if (_webAppHandler == null)
            getServletHandler();
        return _webAppHandler;
    }

    /* ------------------------------------------------------------ */
    private void resolveWebApp() throws IOException
    {
        if (_webApp == null && _war != null && _war.length() > 0)
        {
            // Set dir or WAR
            _webApp= Resource.newResource(_war);

            // Accept aliases for WAR files
            if (_webApp.getAlias() != null)
            {
                log.info(_webApp + " anti-aliased to " + _webApp.getAlias());
                _webApp= Resource.newResource(_webApp.getAlias());
            }

            if (log.isDebugEnabled())
                log.debug(
                    "Try webapp=" + _webApp + ", exists=" + _webApp.exists() + ", directory=" + _webApp.isDirectory());

            // Is the WAR usable directly?
            if (_webApp.exists() && !_webApp.isDirectory() && !_webApp.toString().startsWith("jar:"))
            {
                // No - then lets see if it can be turned into a jar URL.
                Resource jarWebApp= Resource.newResource("jar:" + _webApp + "!/");
                if (jarWebApp.exists() && jarWebApp.isDirectory())
                {
                    _webApp= jarWebApp;
                    _war= _webApp.toString();
                    if (log.isDebugEnabled())
                        log.debug(
                            "Try webapp="
                                + _webApp
                                + ", exists="
                                + _webApp.exists()
                                + ", directory="
                                + _webApp.isDirectory());
                }
            }

            // If we should extract or the URL is still not usable
            if (_webApp.exists()
                && (!_webApp.isDirectory()
                    || (_extract && _webApp.getFile() == null)
                    || (_extract && _webApp.getFile() != null && !_webApp.getFile().isDirectory())))
            {
                // Then extract it.
                File tempDir= new File(getTempDirectory(), "webapp");
                if (tempDir.exists())
                    tempDir.delete();
                tempDir.mkdir();
                tempDir.deleteOnExit();
                log.info("Extract " + _war + " to " + tempDir);
                JarResource.extract(_webApp, tempDir, true);
                _webApp= Resource.newResource(tempDir.getCanonicalPath());

                if (log.isDebugEnabled())
                    log.debug(
                        "Try webapp="
                            + _webApp
                            + ", exists="
                            + _webApp.exists()
                            + ", directory="
                            + _webApp.isDirectory());
            }

            // Now do we have something usable?
            if (!_webApp.exists() || !_webApp.isDirectory())
            {
                log.warn("Web application not found " + _war);
                throw new java.io.FileNotFoundException(_war);
            }

            if (log.isDebugEnabled())
                log.debug("webapp=" + _webApp);

            // Iw there a WEB-INF directory?
            _webInf= _webApp.addPath("WEB-INF/");
            if (!_webInf.exists() || !_webInf.isDirectory())
                _webInf= null;
            else
            {
                // Is there a WEB-INF work directory
                Resource work= _webInf.addPath("work");
                if (work.exists()
                    && work.isDirectory()
                    && work.getFile() != null
                    && work.getFile().canWrite()
                    && getAttribute("javax.servlet.context.tempdir") == null)
                    setAttribute("javax.servlet.context.tempdir", work.getFile());
            }

            // ResourcePath
            super.setBaseResource(_webApp);
        }
    }


    /* ------------------------------------------------------------ */
    public Resource getWebInf() throws IOException
    {
        if (_webInf==null)
            resolveWebApp();
        return _webInf;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the context ServletHandler.
     * Conveniance method. If no ServletHandler exists, a new one is added to
     * the context.  This derivation of the method creates a
     * WebApplicationHandler extension of ServletHandler.
     * @return WebApplicationHandler
     */
    public synchronized ServletHandler getServletHandler()
    {
        if (_webAppHandler == null)
        {
            _webAppHandler= (WebApplicationHandler)getHandler(WebApplicationHandler.class);
            if (_webAppHandler == null)
            {
                if (getHandler(ServletHandler.class) != null)
                    throw new IllegalStateException("Cannot have ServletHandler in WebApplicationContext");
                _webAppHandler= new WebApplicationHandler();
                addHandler(_webAppHandler);
            }
        }
        return _webAppHandler;
    }

    /* ------------------------------------------------------------ */
    public void setPermissions(PermissionCollection permissions)
    {
        if (!_ignorewebjetty)
            log.warn("Permissions set with web-jetty.xml enabled");
        super.setPermissions(permissions);
    }

    /* ------------------------------------------------------------ */
    public boolean isIgnoreWebJetty()
    {
        return _ignorewebjetty;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param b If TRUE, web-jetty.xml and jetty-web.xml configuration
     * files are ignored. 
     */
    public void setIgnoreWebJetty(boolean b)
    {
        _ignorewebjetty= b;
        if (b && getPermissions() != null)
            log.warn("Permissions set with web-jetty.xml enabled");
    }

    /* ------------------------------------------------------------ */
    public boolean isDistributable()
    {
        return _distributable;
    }

    /* ------------------------------------------------------------ */
    public void setDistributable(boolean distributable)
    {
        _distributable=distributable;
    }

    /* ------------------------------------------------------------ */
    public Configuration[] getConfigurations ()
    {
        return _configurations;
    }

    /* ------------------------------------------------------------ */
    protected Configuration[] loadConfigurations() throws Exception
    {
        String[] names = _configurationClassNames;
        
        //if this webapp does not have its own set of configurators, use the defaults
        if (null==names)
            names = ((Server)getHttpServer()).getWebApplicationConfigurationClassNames();
        
        if (null!=names)
        {
            //instantiate instances for each
            Object[] nullArgs = new Object[0];
            Configuration[] configurations = new Configuration[names.length];
            for (int i=0; i< names.length; i++)
            {
                configurations[i] =
                    (Configuration)Loader.loadClass(WebApplicationContext.class, names[i]).getConstructors()[0].newInstance(nullArgs);
                if (log.isDebugEnabled()){log.debug("Loaded instance of "+names[i]);};
            }
            return configurations;
        }
        else
            return new Configuration[0];
    }

    /* ------------------------------------------------------------ */
    protected void configureClassPath() throws Exception
    {
        //call each of the instances
        // first, configure the classpaths
        for (int i=0; i<_configurations.length;i++)
        {
            _configurations[i].setWebApplicationContext(this);
            _configurations[i].configureClassPath();
        }
    }

    /* ------------------------------------------------------------ */
    protected void configureDefaults() throws Exception
    {
        //next, configure default settings
        for (int i=0;i<_configurations.length;i++)
        {
            _configurations[i].setWebApplicationContext(this);
            _configurations[i].configureDefaults();
        }
    }

    /* ------------------------------------------------------------ */
    protected void configureWebApp () throws Exception
    {
        //finally, finish configuring the webapp
        for (int i=0;i<_configurations.length;i++)
        {
            _configurations[i].setWebApplicationContext(this);
            _configurations[i].configureWebApp();
        }
        
    }
 
    /* ------------------------------------------------------------ */
    /** Start the Web Application.
     * @exception IOException 
     */
    protected void doStart() throws Exception
    {
        if (isStarted())
            return;

        // save context classloader
        Thread thread= Thread.currentThread();
        ClassLoader lastContextLoader= thread.getContextClassLoader();

        MultiException mex= null;
        try
        {
            // Find the webapp
            resolveWebApp();

            // Get the handler
            getServletHandler();
          
            _configurations=loadConfigurations();
            
            // initialize the classloader            
            configureClassPath();
            initClassLoader(true);
            thread.setContextClassLoader(getClassLoader());
            initialize();
            
            // Do the default configuration
            configureDefaults();

            // Set classpath for Jasper.
            Map.Entry entry= _webAppHandler.getHolderEntry("test.jsp");
            if (entry != null)
            {
                ServletHolder jspHolder= (ServletHolder)entry.getValue();
                if (jspHolder != null && jspHolder.getInitParameter("classpath") == null)
                {
                    String fileClassPath= getFileClassPath();
                    jspHolder.setInitParameter("classpath", fileClassPath);
                    if (log.isDebugEnabled())
                        log.debug("Set classpath=" + fileClassPath + " for " + jspHolder);
                }
            }
            
            // configure webapp
            configureWebApp();

            // If we have servlets, don't init them yet
            _webAppHandler.setAutoInitializeServlets(false);

            // Start handlers
            super.doStart();

            mex= new MultiException();
            // Context listeners
            if (_contextListeners != null && _webAppHandler != null)
            {
                ServletContextEvent event= new ServletContextEvent(getServletContext());
                for (int i= 0; i < LazyList.size(_contextListeners); i++)
                {
                    try
                    {
                        ((ServletContextListener)LazyList.get(_contextListeners, i)).contextInitialized(event);
                    }
                    catch (Exception ex)
                    {
                        mex.add(ex);
                    }
                }
            }

            // OK to Initialize servlets now
            if (_webAppHandler != null && _webAppHandler.isStarted())
            {
                try
                {
                    _webAppHandler.initializeServlets();
                }
                catch (Exception ex)
                {
                    mex.add(ex);
                }
            }
        }
        catch (Exception e)
        {
            log.warn("Configuration error on " + _war, e);
            throw e;
        }
        finally
        {
            thread.setContextClassLoader(lastContextLoader);
        }

        if (mex != null)
            mex.ifExceptionThrow();
    }

    /* ------------------------------------------------------------ */
    /** Stop the web application.
     * Handlers for resource, servlet, filter and security are removed
     * as they are recreated and configured by any subsequent call to start().
     * @exception InterruptedException 
     */
    protected void doStop() throws Exception
    {
        MultiException mex=new MultiException();
        
        
        Thread thread= Thread.currentThread();
        ClassLoader lastContextLoader= thread.getContextClassLoader();
        
        try
        {
            // Context listeners
            if (_contextListeners != null)
            {
                if (_webAppHandler != null)
                {
                    ServletContextEvent event= new ServletContextEvent(getServletContext());
                    
                    for (int i= LazyList.size(_contextListeners); i-- > 0;)
                    {
                        try 
                        {
                            ((ServletContextListener)LazyList.get(_contextListeners, i)).contextDestroyed(event);
                        }
                        catch (Exception e)
                        {
                            mex.add(e);
                        }
                    }
                }
            }
            _contextListeners= null;
            
            // Stop the context
            try
            {
                super.doStop();
            }
            catch (Exception e)
            {
                mex.add(e);
            }
            
            // clean up
            clearSecurityConstraints();
            
            if (_webAppHandler != null)
                removeHandler(_webAppHandler);
            _webAppHandler= null;
            
            if (_errorPages != null)
                _errorPages.clear();
            _errorPages= null;
            
            _webApp=null;
            _webInf=null;
            
            _configurations=null;
            
        }
        finally
        {
            thread.setContextClassLoader(lastContextLoader);
        }
        
        if (mex!=null)
            mex.ifExceptionThrow();
    }
    

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        super.destroy();
        if (isStarted())
            throw new IllegalStateException();

        _defaultsDescriptor=null;
        _war=null;
        _configurationClassNames=null;
        if (_resourceAliases!=null)
            _resourceAliases.clear();
        _resourceAliases=null;
        _contextListeners=null;
        if (_errorPages!=null)
            _errorPages.clear();
        _errorPages=null;
    }

    /* ------------------------------------------------------------ */
    public void handle(String pathInContext, String pathParams, HttpRequest httpRequest, HttpResponse httpResponse)
        throws HttpException, IOException
    {
        if (!isStarted())
            return;
        try
        {
            super.handle(pathInContext, pathParams, httpRequest, httpResponse);
        }
        finally
        {
            if (!httpRequest.isHandled())
                httpResponse.sendError(HttpResponse.__404_Not_Found);
            httpRequest.setHandled(true);
            if (!httpResponse.isCommitted())
            {
                httpResponse.completing();
                httpResponse.commit();
            }
        }
    }

    /* ------------------------------------------------------------ */
    public synchronized void addEventListener(EventListener listener) throws IllegalArgumentException
    {
        if (listener instanceof ServletContextListener)
        {
            _contextListeners= LazyList.add(_contextListeners, listener);
        }
 
        super.addEventListener(listener);
    }

    /* ------------------------------------------------------------ */
    public synchronized void removeEventListener(EventListener listener)
    {
        _contextListeners= LazyList.remove(_contextListeners, listener);
        super.removeEventListener(listener);
    }

    /* ------------------------------------------------------------ */
    public String getDisplayName()
    {
        return getHttpContextName();
    }
    
    /* ------------------------------------------------------------ */
    public void setDisplayName(String name)
    {
        setHttpContextName(name);
    }

    /* ------------------------------------------------------------ */
    /** Set the defaults web.xml file.
     * The default web.xml is used to configure all webapplications
     * before the WEB-INF/web.xml file is applied.  By default the
     * org/mortbay/jetty/servlet/webdefault.xml resource from the
     * org.openqa.jetty.jetty.jar is used.
     * @param defaults File, Resource, URL or null.
     */
    public void setDefaultsDescriptor(String defaults)
    {
        _defaultsDescriptor= defaults;
    }

    /* ------------------------------------------------------------ */
    public String getDefaultsDescriptor()
    {
        return _defaultsDescriptor;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param extract If true, a WAR is extracted to a temporary
     * directory before being deployed. 
     */
    public void setExtractWAR(boolean extract)
    {
        _extract= extract;
    }

    /* ------------------------------------------------------------ */
    public boolean getExtractWAR()
    {
        return _extract;
    }

    /* ------------------------------------------------------------ */
    /**
     * Initialize is called by the start method after the contexts classloader
     * has been initialied, but before the defaults descriptor has been applied.
     * The default implementation does nothing.
     *
     * @exception Exception if an error occurs
     */
    protected void initialize() throws Exception
    {
    }


    /* ------------------------------------------------------------ */
    protected UserRealm getUserRealm(String name)
    {
        return getHttpServer().getRealm(name);
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        String name = getDisplayName();
        return "WebApplicationContext[" + getContextPath() + "," + (name == null ? _war : name) + "]";
    }

    /* ------------------------------------------------------------ */
    /** Set Resource Alias.
     * Resource aliases map resource uri's within a context.
     * They may optionally be used by a handler when looking for
     * a resource.  
     * @param alias 
     * @param uri 
     */
    public void setResourceAlias(String alias, String uri)
    {
        if (_resourceAliases == null)
            _resourceAliases= new HashMap(5);
        _resourceAliases.put(alias, uri);
    }

    /* ------------------------------------------------------------ */
    public Map getResourceAliases()
    {
        if (_resourceAliases == null)
            return null;
        return Collections.unmodifiableMap(_resourceAliases);
    }
    
    /* ------------------------------------------------------------ */
    public String getResourceAlias(String alias)
    {
        if (_resourceAliases == null)
            return null;
        return (String)_resourceAliases.get(alias);
    }

    /* ------------------------------------------------------------ */
    public String removeResourceAlias(String alias)
    {
        if (_resourceAliases == null)
            return null;
        return (String)_resourceAliases.remove(alias);
    }

    /* ------------------------------------------------------------ */
    public Resource getResource(String uriInContext) throws IOException
    {
        IOException ioe= null;
        Resource resource= null;
        try
        {
            resource= super.getResource(uriInContext);
            if (resource != null && resource.exists())
                return resource;
        }
        catch (IOException e)
        {
            ioe= e;
        }

        String aliasedUri= getResourceAlias(uriInContext);
        if (aliasedUri != null)
            return super.getResource(aliasedUri);

        if (ioe != null)
            throw ioe;

        return resource;
    }

    /* ------------------------------------------------------------ */
    /** set error page URI.
     * @param error A string representing an error code or a
     * exception classname
     * @param uriInContext
     */
    public void setErrorPage(String error, String uriInContext)
    {
        if (_errorPages == null)
            _errorPages= new HashMap();
        _errorPages.put(error, uriInContext);
    }

    /* ------------------------------------------------------------ */
    /** get error page URI.
     * @param error A string representing an error code or a
     * exception classname
     * @return URI within context
     */
    public String getErrorPage(String error)
    {
        if (_errorPages == null)
            return null;
        return (String)_errorPages.get(error);
    }

    /* ------------------------------------------------------------ */
    public String removeErrorPage(String error)
    {
        if (_errorPages == null)
            return null;
        return (String)_errorPages.remove(error);
    }
    
 
    
    /* ------------------------------------------------------------------------------- */
    /** Base Class for WebApplicationContext Configuration.
     * This class can be extended to customize or extend the configuration
     * of the WebApplicationContext.  If WebApplicationContext.setConfiguration is not
     * called, then an XMLConfiguration instance is created.
     * 
     * @version $Revision: 1.136 $
     * @author gregw
     */
    public static interface Configuration extends Serializable
    {
        /* ------------------------------------------------------------------------------- */
        /** Set up a context on which to perform the configuration.
         * @param context
         */
        public void setWebApplicationContext (WebApplicationContext context);

        /* ------------------------------------------------------------------------------- */
        /** Get the context on which the configuration is performed.
         * @return A WebApplicationContext object.
         */
        public WebApplicationContext getWebApplicationContext ();
        
        /* ------------------------------------------------------------------------------- */
        /** Configure ClassPath.
         * This method is called before the context ClassLoader is created.  
         * Paths and libraries should be added to the context using the setClassPath,
         * addClassPath and addClassPaths methods.  The default implementation looks
         * for WEB-INF/classes, WEB-INF/lib/*.zip and WEB-INF/lib/*.jar
         * @throws Exception
         */
        public  void configureClassPath()
        throws Exception;

        /* ------------------------------------------------------------------------------- */
        /** Configure Defaults.
         * This method is called to intialize the context to the containers default configuration.
         * Typically this would mean application of the webdefault.xml file.  The default 
         * implementation does nothing.
         * @throws Exception
         */
        public  void configureDefaults()
        throws Exception;
        

        /* ------------------------------------------------------------------------------- */
        /** Configure WebApp.
         * This method is called to apply the standard and vendor deployment descriptors.
         * Typically this is web.xml and jetty-web.xml.  The default implementation does nothing.
         * @throws Exception
         */
        public  void configureWebApp()
        throws Exception;
        
    }

}
