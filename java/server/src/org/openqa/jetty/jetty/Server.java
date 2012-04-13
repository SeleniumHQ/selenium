// ========================================================================
// $Id: Server.java,v 1.40 2005/10/21 13:52:11 gregwilkins Exp $
// Copyright 2002-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.jetty;

import org.apache.commons.logging.Log;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpServer;
import org.openqa.jetty.jetty.servlet.ServletHttpContext;
import org.openqa.jetty.jetty.servlet.WebApplicationContext;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.Resource;
import org.openqa.jetty.xml.XmlConfiguration;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.*;


/* ------------------------------------------------------------ */
/** The Jetty HttpServer.
 *
 * This specialization of org.openqa.jetty.http.HttpServer adds knowledge
 * about servlets and their specialized contexts.   It also included
 * support for initialization from xml configuration files
 * that follow the XmlConfiguration dtd.
 *
 * HttpContexts created by Server are of the type
 * org.openqa.jetty.jetty.servlet.ServletHttpContext unless otherwise
 * specified.
 *
 * This class also provides a main() method which starts a server for
 * each config file passed on the command line.  If the system
 * property JETTY_NO_SHUTDOWN_HOOK is not set to true, then a shutdown
 * hook is thread is registered to stop these servers.   
 *
 * @see org.openqa.jetty.xml.XmlConfiguration
 * @see org.openqa.jetty.jetty.servlet.ServletHttpContext
 * @version $Revision: 1.40 $
 * @author Greg Wilkins (gregw)
 */
public class Server extends HttpServer 
{
    static Log log = LogFactory.getLog(Server.class);
    private String[] _webAppConfigurationClassNames = 
        new String[]{"org.openqa.jetty.jetty.servlet.XMLConfiguration", "org.openqa.jetty.jetty.servlet.JettyWebConfiguration"};
    private String _configuration;
    private String _rootWebApp;
    private static ShutdownHookThread hookThread = new ShutdownHookThread();
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public Server()
    {
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param configuration The filename or URL of the XML
     * configuration file.
     */
    public Server(String configuration)
        throws IOException
    {
        this(Resource.newResource(configuration).getURL());
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param configuration The filename or URL of the XML
     * configuration file.
     */
    public Server(Resource configuration)
        throws IOException
    {
        this(configuration.getURL());
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param configuration The filename or URL of the XML
     * configuration file.
     */
    public Server(URL configuration)
        throws IOException
    {
        _configuration=configuration.toString();
        Server.hookThread.add(this);
        try
        {
            XmlConfiguration config=new XmlConfiguration(configuration);
            config.configure(this);
        }
        catch(IOException e)
        {
            throw e;
        }
        catch(InvocationTargetException e)
        {
            log.warn(LogSupport.EXCEPTION,e.getTargetException());
            throw new IOException("Jetty configuration problem: "+e.getTargetException());
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            throw new IOException("Jetty configuration problem: "+e);
        }
    }

    /* ------------------------------------------------------------ */
    public boolean getStopAtShutdown()
    {
        return hookThread.contains(this);
    }
    
    /* ------------------------------------------------------------ */
    public void setStopAtShutdown(boolean stop)
    {
        if (stop)
            hookThread.add(this);
        else
            hookThread.remove(this);
    }

    /* ------------------------------------------------------------ */
    /** Get the root webapp name.
     * @return The name of the root webapp (eg. "root" for root.war). 
     */
    public String getRootWebApp()
    {
        return _rootWebApp;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the root webapp name.
     * @param rootWebApp The name of the root webapp (eg. "root" for root.war). 
     */
    public void setRootWebApp(String rootWebApp)
    {
        _rootWebApp = rootWebApp;
    }
    
    /* ------------------------------------------------------------ */
    /**  Configure the server from an XML file.
     * @param configuration The filename or URL of the XML
     * configuration file.
     */
    public void configure(String configuration)
        throws IOException
    {

        URL url=Resource.newResource(configuration).getURL();
        if (_configuration!=null && _configuration.equals(url.toString()))
            return;
        if (_configuration!=null)
            throw new IllegalStateException("Already configured with "+_configuration);
        try
        {
            XmlConfiguration config=new XmlConfiguration(url);
            _configuration=url.toString();
            config.configure(this);
        }
        catch(IOException e)
        {
            throw e;
        }
        catch(Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            throw new IOException("Jetty configuration problem: "+e);
        }
    }
    
    /* ------------------------------------------------------------ */
    public String getConfiguration()
    {
        return _configuration;
    }
    
    /* ------------------------------------------------------------ */
    /** Create a new ServletHttpContext.
     * Ths method is called by HttpServer to creat new contexts.  Thus
     * calls to addContext or getContext that result in a new Context
     * being created will return an
     * org.openqa.jetty.jetty.servlet.ServletHttpContext instance.
     * @return ServletHttpContext
     */
    protected HttpContext newHttpContext()
    {
        return new ServletHttpContext();
    }
    
    /* ------------------------------------------------------------ */
    /** Create a new WebApplicationContext.
     * Ths method is called by Server to creat new contexts for web 
     * applications.  Thus calls to addWebApplication that result in 
     * a new Context being created will return an correct class instance.
     * Derived class can override this method to create instance of its
     * own class derived from WebApplicationContext in case it needs more
     * functionality.
     * @param webApp The Web application directory or WAR file.
     * @return WebApplicationContext
     */
    protected WebApplicationContext newWebApplicationContext(
       String webApp
    )
    {
        return new WebApplicationContext(webApp);
    }

    /* ------------------------------------------------------------ */
    /** Add Web Application.
     * @param contextPathSpec The context path spec. Which must be of
     * the form / or /path/*
     * @param webApp The Web application directory or WAR file.
     * @return The WebApplicationContext
     * @exception IOException 
     */
    public WebApplicationContext addWebApplication(String contextPathSpec,
                                                   String webApp)
        throws IOException
    {
        return addWebApplication(null,contextPathSpec,webApp);
    }
    
    /* ------------------------------------------------------------ */
    /** Add Web Application.
     * @param virtualHost Virtual host name or null
     * @param contextPathSpec The context path spec. Which must be of
     * the form / or /path/*
     * @param webApp The Web application directory or WAR file.
     * @return The WebApplicationContext
     * @exception IOException 
     */
    public WebApplicationContext addWebApplication(String virtualHost,
                                                   String contextPathSpec,
                                                   String webApp)
        throws IOException
    {
        WebApplicationContext appContext =
            newWebApplicationContext(webApp);
        appContext.setContextPath(contextPathSpec);
        addContext(virtualHost,appContext);
        if(log.isDebugEnabled())log.debug("Web Application "+appContext+" added");
        return appContext;
    }

    
    /* ------------------------------------------------------------ */
    /**  Add Web Applications.
     * Add auto webapplications to the server.  The name of the
     * webapp directory or war is used as the context name. If a
     * webapp is called "root" it is added at "/".
     * @param webapps Directory file name or URL to look for auto webapplication.
     * @exception IOException 
     */
    public WebApplicationContext[] addWebApplications(String webapps)
        throws IOException
    {
        return addWebApplications(null,webapps,null,false);
    }
    
    /* ------------------------------------------------------------ */
    /**  Add Web Applications.
     * Add auto webapplications to the server.  The name of the
     * webapp directory or war is used as the context name. If the
     * webapp matches the rootWebApp it is added as the "/" context.
     * @param host Virtual host name or null
     * @param webapps Directory file name or URL to look for auto webapplication.
     * @exception IOException 
     */
    public WebApplicationContext[] addWebApplications(String host,
                                                      String webapps)
        throws IOException
    {
        return addWebApplications(host,webapps,null,false);
    }
        
    /* ------------------------------------------------------------ */
    /**  Add Web Applications.
     * Add auto webapplications to the server.  The name of the
     * webapp directory or war is used as the context name. If the
     * webapp matches the rootWebApp it is added as the "/" context.
     * @param host Virtual host name or null
     * @param webapps Directory file name or URL to look for auto
     * webapplication.
     * @param extract If true, extract war files
     * @exception IOException 
     */
    public WebApplicationContext[] addWebApplications(String host,
                                                      String webapps,
                                                      boolean extract)
        throws IOException
    {
        return addWebApplications(host,webapps,null,extract);
    }
    
    /* ------------------------------------------------------------ */
    /**  Add Web Applications.
     * Add auto webapplications to the server.  The name of the
     * webapp directory or war is used as the context name. If the
     * webapp matches the rootWebApp it is added as the "/" context.
     * @param host Virtual host name or null
     * @param webapps Directory file name or URL to look for auto
     * webapplication.
     * @param defaults The defaults xml filename or URL which is
     * loaded before any in the web app. Must respect the web.dtd.
     * If null the default defaults file is used. If the empty string, then
     * no defaults file is used.
     * @param extract If true, extract war files
     * @exception IOException 
     */
    public WebApplicationContext[] addWebApplications(String host,
                                                      String webapps,
                                                      String defaults,
                                                      boolean extract)
        throws IOException
    {
        return addWebApplications(host,webapps,defaults,extract,true);
    }

    /* ------------------------------------------------------------ */
    /**  Add Web Applications.
     * Add auto webapplications to the server.  The name of the
     * webapp directory or war is used as the context name. If the
     * webapp matches the rootWebApp it is added as the "/" context.
     * @param host Virtual host name or null
     * @param webapps Directory file name or URL to look for auto
     * webapplication.
     * @param defaults The defaults xml filename or URL which is
     * loaded before any in the web app. Must respect the web.dtd.
     * If null the default defaults file is used. If the empty string, then
     * no defaults file is used.
     * @param extract If true, extract war files
     * @param java2CompliantClassLoader True if java2 compliance is applied to all webapplications
     * @exception IOException 
     */
    public WebApplicationContext[] addWebApplications(String host,
                                                      String webapps,
                                                      String defaults,
                                                      boolean extract,
						      boolean java2CompliantClassLoader)
        throws IOException
    {
        ArrayList wacs = new ArrayList();
        Resource r=Resource.newResource(webapps);
        if (!r.exists())
            throw new IllegalArgumentException("No such webapps resource "+r);
        
        if (!r.isDirectory())
            throw new IllegalArgumentException("Not directory webapps resource "+r);
        
        String[] files=r.list();
        
        for (int f=0;files!=null && f<files.length;f++)
        {
            String context=files[f];
            
            if (context.equalsIgnoreCase("CVS/") ||
                context.equalsIgnoreCase("CVS") ||
                context.startsWith("."))
                continue;

            
            String app = r.addPath(r.encode(files[f])).toString();
            if (context.toLowerCase().endsWith(".war") ||
                context.toLowerCase().endsWith(".jar"))
            {
                context=context.substring(0,context.length()-4);
                Resource unpacked=r.addPath(context);
                if (unpacked!=null && unpacked.exists() && unpacked.isDirectory())
                    continue;
            }
            
            if (_rootWebApp!=null && (context.equals(_rootWebApp)||context.equals(_rootWebApp+"/")))
                context="/";
            else
                context="/"+context;

            WebApplicationContext wac= addWebApplication(host,
                                                         context,
                                                         app);
            wac.setExtractWAR(extract);
	    wac.setClassLoaderJava2Compliant(java2CompliantClassLoader);
            if (defaults!=null)
            {
                if (defaults.length()==0)
                    wac.setDefaultsDescriptor(null);
                else
                    wac.setDefaultsDescriptor(defaults);
            }
            wacs.add(wac);
        }

        return (WebApplicationContext[])wacs.toArray(new WebApplicationContext[wacs.size()]);
    }

    
    /* ------------------------------------------------------------ */
    /** setWebApplicationConfigurationClasses
     * Set up the list of classnames of WebApplicationContext.Configuration
     * implementations that will be applied to configure every webapp.
     * The list can be overridden by individual WebApplicationContexts.
     * @param configurationClassNames
     */
    public void setWebApplicationConfigurationClassNames (String[] configurationClassNames)
    {
        if (configurationClassNames != null)
        {
            _webAppConfigurationClassNames = new String[configurationClassNames.length];
            System.arraycopy(configurationClassNames, 0, _webAppConfigurationClassNames, 0, configurationClassNames.length);
        }
    }
    
    public String[] getWebApplicationConfigurationClassNames ()
    {
        return _webAppConfigurationClassNames;
    }
    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    public static void main(String[] arg)
    {
        String[] dftConfig={"etc/jetty.xml"};
        
        if (arg.length==0)
        {
            log.info("Using default configuration: etc/jetty.xml");
            arg=dftConfig;
        }

        final Server[] servers=new Server[arg.length];

        // create and start the servers.
        for (int i=0;i<arg.length;i++)
        {
            try
            {
                servers[i] = new Server(arg[i]);
                servers[i].setStopAtShutdown(true);
                servers[i].start();

            }
            catch(Exception e)
            {
                log.warn(LogSupport.EXCEPTION,e);
            }
        }
        
        // create and start the servers.
        for (int i=0;i<arg.length;i++)
        {
            try{servers[i].join();}
            catch (Exception e){LogSupport.ignore(log,e);}
        }
    }
    
   /**
    * ShutdownHook thread for stopping all servers.
    * 
    * Thread is hooked first time list of servers is changed.
    */
  private static class ShutdownHookThread extends Thread {  // Memory model reviewed
    private volatile boolean hooked = false;
    private final List<Server> servers = Collections.synchronizedList(new ArrayList<Server>());

    /**
     * Hooks this thread for shutdown.
     * @see java.lang.Runtime#addShutdownHook(java.lang.Thread)
     */
    private void createShutdownHook() {
      if (!Boolean.getBoolean("JETTY_NO_SHUTDOWN_HOOK") && !hooked) {
        try {
          Method shutdownHook = java.lang.Runtime.class.getMethod("addShutdownHook",
              new Class[] { java.lang.Thread.class });
          shutdownHook.invoke(Runtime.getRuntime(), new Object[] { this });
          this.hooked = true;
        } catch (Exception e) {
          if (log.isDebugEnabled()) log.debug("No shutdown hook in JVM ", e);
        }
      }
    }

    /**
     * Add Server to servers list.
     */
    public boolean add(Server server) {
      createShutdownHook();
      return this.servers.add(server);
    }
    
    /**
     * Contains Server in servers list?
     */
    public boolean contains(Server server) {
      return this.servers.contains(server);
    }

    /**
     * Append all Servers from Collection
     */
    public boolean addAll(Collection c) {
      createShutdownHook();
      return this.servers.addAll(c);
    }

    /**
     * Clear list of Servers.
     */
    public void clear() {
      createShutdownHook();
      this.servers.clear();
    }

    /**
     * Remove Server from list.
     */
    public boolean remove(Server server) {
      createShutdownHook();
      return this.servers.remove(server);
    }

    /**
     * Remove all Servers in Collection from list.
     */
    public boolean removeAll(Collection c) {
      createShutdownHook();
      return this.servers.removeAll(c);
    }

    /**
     * Stop all Servers in list.
     */
    public void run() {
      setName("Shutdown");
      log.info("Shutdown hook executing");
      for (Server svr : servers) {
        if (svr == null) continue;
        try {
          svr.stop();
        } catch (Exception e) {
          log.warn(LogSupport.EXCEPTION, e);
        }
        log.info("Shutdown hook complete");

        // Try to avoid JVM crash
        try {
          Thread.sleep(1000);
        } catch (Exception e) {
          log.warn(LogSupport.EXCEPTION, e);
        }
      }
    }
  }
}




