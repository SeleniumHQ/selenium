// ========================================================================
// $Id: ContextLoader.java,v 1.37 2006/01/09 07:26:12 gregwilkins Exp $
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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.security.CodeSource;
import java.security.PermissionCollection;
import java.util.Arrays;
import java.util.StringTokenizer;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.Resource;

/* ------------------------------------------------------------ */
/** ClassLoader for HttpContext.
 * Specializes URLClassLoader with some utility and file mapping
 * methods.
 *
 * This loader defaults to the 2.3 servlet spec behaviour where non
 * system classes are loaded from the classpath in preference to the
 * parent loader.  Java2 compliant loading, where the parent loader
 * always has priority, can be selected with the setJava2Complient method.
 *
 * @version $Id: ContextLoader.java,v 1.37 2006/01/09 07:26:12 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class ContextLoader extends URLClassLoader
{
    private static Log log= LogFactory.getLog(ContextLoader.class);

    private boolean _java2compliant= false;
    private ClassLoader _parent;
    private PermissionCollection _permissions;
    private String _urlClassPath;
    private HttpContext _context;
    
    /* ------------------------------------------------------------ */
    /** Constructor.
     * @param classPath Comma separated path of filenames or URLs
     * pointing to directories or jar files. Directories should end
     * with '/'.
     * @exception IOException
     */
    public ContextLoader(HttpContext context, String classPath, ClassLoader parent, PermissionCollection permisions)
        throws MalformedURLException, IOException
    {
        super(new URL[0], parent);
        _context=context;
        _permissions= permisions;
        _parent= parent;
        
        if (_parent == null)
            _parent= getSystemClassLoader();

        if (classPath == null)
        {
            _urlClassPath= "";
        }
        else
        {
            StringTokenizer tokenizer= new StringTokenizer(classPath, ",;");

            while (tokenizer.hasMoreTokens())
            {
                Resource resource= Resource.newResource(tokenizer.nextToken());
                if (log.isDebugEnabled())
                    log.debug("Path resource=" + resource);

                // Resolve file path if possible
                File file= resource.getFile();

                if (file != null)
                {
                    URL url= resource.getURL();
                    addURL(url);
                    _urlClassPath= (_urlClassPath == null) ? url.toString() : (_urlClassPath + "," + url.toString());
                }
                else
                {
                    // Add resource or expand jar/
                    if (!resource.isDirectory() && file == null)
                    {
                        InputStream in= resource.getInputStream();
                        File lib= new File(context.getTempDirectory(), "lib");
                        if (!lib.exists())
                        {
                            lib.mkdir();
                            lib.deleteOnExit();
                        }
                        File jar= File.createTempFile("Jetty-", ".jar", lib);

                        jar.deleteOnExit();
                        if (log.isDebugEnabled())
                            log.debug("Extract " + resource + " to " + jar);
                        FileOutputStream out = null;
                        try
                        {
                            out= new FileOutputStream(jar);
                            IO.copy(in, out);
                        }
                        finally
                        {
                            IO.close(out);
                        }

                        URL url= jar.toURL();
                        addURL(url);
                        _urlClassPath=
                            (_urlClassPath == null) ? url.toString() : (_urlClassPath + "," + url.toString());
                    }
                    else
                    {
                        URL url= resource.getURL();
                        addURL(url);
                        _urlClassPath=
                            (_urlClassPath == null) ? url.toString() : (_urlClassPath + "," + url.toString());
                    }
                }
            }
        }

        if (log.isDebugEnabled())
        {
            if (log.isDebugEnabled())
                log.debug("ClassPath=" + _urlClassPath);
            if (log.isDebugEnabled())
                log.debug("Permissions=" + _permissions);
            if (log.isDebugEnabled())
                log.debug("URL=" + Arrays.asList(getURLs()));
        }
    }

    /* ------------------------------------------------------------ */
    /** Set Java2 compliant status.
     * @param compliant 
     */
    public void setJava2Compliant(boolean compliant)
    {
        _java2compliant= compliant;
    }

    /* ------------------------------------------------------------ */
    public boolean isJava2Compliant()
    {
        return _java2compliant;
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        return "ContextLoader@" + hashCode() + "(" + _urlClassPath + ")\n  --parent--> " + _parent.toString();
    }

    /* ------------------------------------------------------------ */
    public PermissionCollection getPermissions(CodeSource cs)
    {
        PermissionCollection pc= (_permissions == null) ? super.getPermissions(cs) : _permissions;
        if (log.isDebugEnabled())
            log.debug("loader.getPermissions(" + cs + ")=" + pc);
        return pc;
    }

    /* ------------------------------------------------------------ */
    public Class loadClass(String name) throws ClassNotFoundException
    {
        return loadClass(name, false);
    }

    /* ------------------------------------------------------------ */
    protected Class loadClass(String name, boolean resolve) throws ClassNotFoundException
    {
        Class c= findLoadedClass(name);
        ClassNotFoundException ex= null;
        boolean tried_parent= false;
        if (c == null && (_java2compliant || isSystemPath(name)) && !isServerPath(name) && _parent!=null)
        {
            if (log.isTraceEnabled())
                log.trace("try loadClass " + name + " from " + _parent);
            tried_parent= true;
            try
            {
                c= _parent.loadClass(name);
                if (log.isTraceEnabled())
                    log.trace("p0 loaded " + c);
            }
            catch (ClassNotFoundException e)
            {
                ex= e;
            }
        }

        if (c == null)
        {
            if (log.isTraceEnabled())
                log.trace("try findClass " + name + " from " + _urlClassPath);
            try
            {
                c= this.findClass(name);
                if (log.isTraceEnabled())
                    log.trace("cx loaded " + c);
            }
            catch (ClassNotFoundException e)
            {
                ex= e;
            }
        }

        if (c == null && !tried_parent && !isServerPath(name) && _parent!=null)
        {
            if (log.isTraceEnabled())
                log.trace("try loadClass " + name + " from " + _parent);
            c= _parent.loadClass(name);
            if (log.isTraceEnabled())
                log.trace("p1 loaded " + c);
        }
        
        if (c == null)
            throw ex;

        if (resolve)
            resolveClass(c);

        return c;
    }

    /* ------------------------------------------------------------ */
    public URL getResource(String name)
    {
        URL url= null;
        boolean tried_parent= false;
        if (_parent!=null &&(_java2compliant || isSystemPath(name)))
        {
            if (log.isTraceEnabled())
                log.trace("try getResource " + name + " from " + _parent);
            tried_parent= true;
            url= _parent.getResource(name);
        }

        if (url == null)
        {
            if (log.isTraceEnabled())
                log.trace("try findResource " + name + " from " + _urlClassPath);
            url= this.findResource(name);

            if (url == null && name.startsWith("/"))
            {
                if (log.isDebugEnabled())
                    log.debug("HACK leading / off " + name);
                url= this.findResource(name.substring(1));
            }
        }

        if (_parent!=null && url == null && !tried_parent)
        {
            if (log.isTraceEnabled())
                log.trace("try getResource " + name + " from " + _parent);
            url= _parent.getResource(name);
        }

        if (url != null)
            if (log.isTraceEnabled())
                log.trace("found " + url);

        return url;
    }

    /* ------------------------------------------------------------ */
    public boolean isServerPath(String name)
    {
        name=name.replace('/','.');
        while(name.startsWith("."))
            name=name.substring(1);

        String[] server_classes=_context.getServerClasses();
        
        if (server_classes!=null)
        {
            for (int i=0;i<server_classes.length;i++)
            {
                boolean result=true;
                String c=server_classes[i];
                if (c.startsWith("-"))
                {
                    c=c.substring(1);
                    result=false;
                }
                
                if (c.endsWith("."))
                {
                    if (name.startsWith(c))
                        return result;
                }
                else if (name.equals(c))
                {
                    return result;
                }
            }
        }
        return false;
    }

    /* ------------------------------------------------------------ */
    public boolean isSystemPath(String name)
    {
        name=name.replace('/','.');
        while(name.startsWith("."))
            name=name.substring(1);

        String[] system_classes=_context.getSystemClasses();
        if (system_classes!=null)
        {
            for (int i=0;i<system_classes.length;i++)
            {
                boolean result=true;
                String c=system_classes[i];
                if (c.startsWith("-"))
                {
                    c=c.substring(1);
                    result=false;
                }
                
                if (c.endsWith("."))
                {
                    if (name.startsWith(c))
                        return result;
                }
                else if (name.equals(c))
                    return result;
            }
        }
        
        return false;
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        this._parent=null;
        this._permissions=null;
        this._urlClassPath=null;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @return Returns the serverClasses.
     */
    String[] getServerClasses()
    {
        return _context.getServerClasses();
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @param serverClasses The serverClasses to set.
     */
    void setServerClasses(String[] serverClasses)
    {
        _context.setServerClasses(serverClasses);
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @return Returns the systemClasses.
     */
    String[] getSystemClasses()
    {
        return _context.getSystemClasses();
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @param systemClasses The systemClasses to set.
     */
    void setSystemClasses(String[] systemClasses)
    {
        _context.setSystemClasses(systemClasses);
    }
}
