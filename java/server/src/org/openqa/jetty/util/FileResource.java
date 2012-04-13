// ========================================================================
// $Id: FileResource.java,v 1.31 2006/01/04 13:55:31 gregwilkins Exp $
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
package org.openqa.jetty.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.security.Permission;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;


/* ------------------------------------------------------------ */
/** File Resource.
 *
 * Handle resources of implied or explicit file type.
 * This class can check for aliasing in the filesystem (eg case
 * insensitivity).  By default this is turned on if the platform does
 * not have the "/" path separator, or it can be controlled with the
 * "org.openqa.jetty.util.FileResource.checkAliases" system parameter.
 *
 * If alias checking is turned on, then aliased resources are
 * treated as if they do not exist, nor can they be created.
 *
 * @version $Revision: 1.31 $
 * @author Greg Wilkins (gregw)
 */
public class FileResource extends URLResource
{
	private static Log log = LogFactory.getLog(Credential.class);
    private static boolean __checkAliases;
    static
    {
        __checkAliases=
            "true".equalsIgnoreCase
            (System.getProperty("org.openqa.jetty.util.FileResource.checkAliases","true"));
 
       if (__checkAliases)
            log.info("Checking Resource aliases");
    }
    
    /* ------------------------------------------------------------ */
    private File _file;
    private transient URL _alias=null;
    private transient boolean _aliasChecked=false;

    /* ------------------------------------------------------------------------------- */
    /** setCheckAliases.
     * @param checkAliases True of resource aliases are to be checked for (eg case insensitivity or 8.3 short names) and treated as not found.
     */
    public static void setCheckAliases(boolean checkAliases)
    {
        __checkAliases=checkAliases;
    }

    /* ------------------------------------------------------------------------------- */
    /** getCheckAliases.
     * @return True of resource aliases are to be checked for (eg case insensitivity or 8.3 short names) and treated as not found.
     */
    public static boolean getCheckAliases()
    {
        return __checkAliases;
    }
    
    /* -------------------------------------------------------- */
    FileResource(URL url)
        throws IOException, URISyntaxException
    {
        super(url,null);

        try
        {
            // Try standard API to convert URL to file.
            _file =new File(new URI(url.toString()));
        }
        catch (Exception e)
        {
            LogSupport.ignore(log,e);
            try
            {
                // Assume that File.toURL produced unencoded chars. So try
                // encoding them.
                String urls=
                    "file:"+org.openqa.jetty.util.URI.encodePath(url.toString().substring(5));
                _file =new File(new URI(urls));
            }
            catch (Exception e2)
            {
                LogSupport.ignore(log,e2);

                // Still can't get the file.  Doh! try good old hack!
                checkConnection();
                Permission perm = _connection.getPermission();
                _file = new File(perm==null?url.getFile():perm.getName());
            }
        }
        
        if (_file.isDirectory() && !_urlString.endsWith("/"))
            _urlString=_urlString+"/";
    }
    
    /* -------------------------------------------------------- */
    FileResource(URL url, URLConnection connection, File file)
    {
        super(url,connection);
        _file=file;
        if (_file.isDirectory() && !_urlString.endsWith("/"))
            _urlString=_urlString+"/";
    }
    
    /* -------------------------------------------------------- */
    public Resource addPath(String path)
        throws IOException,MalformedURLException
    {
        FileResource r=null;

        if (!isDirectory())
        {
            r=(FileResource)super.addPath(path);
        }
        else
        {
            path = org.openqa.jetty.util.URI.canonicalPath(path);
            
            // treat all paths being added as relative
            String rel=path;
            if (path.startsWith("/"))
                rel = path.substring(1);
            
            File newFile = new File(_file,rel.replace('/', File.separatorChar));
            r=new FileResource(newFile.toURI().toURL(),null,newFile);
        }
        
        String encoded=org.openqa.jetty.util.URI.encodePath(path);
        int expected=r._urlString.length()-encoded.length();
        int index = r._urlString.lastIndexOf(encoded, expected);
        
        if (expected!=index && ((expected-1)!=index || path.endsWith("/") || !r.isDirectory()))
        {
            r._alias=r._url;
            r._aliasChecked=true;
        }                   
        return r;
    }
   
    
    /* ------------------------------------------------------------ */
    public URL getAlias()
    {
        if (__checkAliases && !_aliasChecked)
        {
            try
            {    
                String abs=_file.getAbsolutePath();
                String can=_file.getCanonicalPath();
                
                if (abs.length()!=can.length() || !abs.equals(can))
                    _alias=new File(can).toURI().toURL();
                
                _aliasChecked=true;
                
                if (_alias!=null && log.isDebugEnabled())
                {
                    log.debug("ALIAS abs="+abs);
                    log.debug("ALIAS can="+can);
                }
            }
            catch(Exception e)
            {
                log.warn(LogSupport.EXCEPTION,e);
                return getURL();
            }                
        }
        return _alias;
    }
    
    /* -------------------------------------------------------- */
    /**
     * Returns true if the resource exists.
     */
    public boolean exists()
    {
        return _file.exists();
    }
        
    /* -------------------------------------------------------- */
    /**
     * Returns the last modified time
     */
    public long lastModified()
    {
        return _file.lastModified();
    }

    /* -------------------------------------------------------- */
    /**
     * Returns true if the respresenetd resource is a container/directory.
     */
    public boolean isDirectory()
    {
        return _file.isDirectory();
    }

    /* --------------------------------------------------------- */
    /**
     * Return the length of the resource
     */
    public long length()
    {
        return _file.length();
    }
        

    /* --------------------------------------------------------- */
    /**
     * Returns the name of the resource
     */
    public String getName()
    {
        return _file.getAbsolutePath();
    }
        
    /* ------------------------------------------------------------ */
    /**
     * Returns an File representing the given resource or NULL if this
     * is not possible.
     */
    public File getFile()
    {
        return _file;
    }
        
    /* --------------------------------------------------------- */
    /**
     * Returns an input stream to the resource
     */
    public InputStream getInputStream() throws IOException
    {
        return new FileInputStream(_file);
    }
        
    /* --------------------------------------------------------- */
    /**
     * Returns an output stream to the resource
     */
    public OutputStream getOutputStream()
        throws java.io.IOException, SecurityException
    {
        return new FileOutputStream(_file);
    }
        
    /* --------------------------------------------------------- */
    /**
     * Deletes the given resource
     */
    public boolean delete()
        throws SecurityException
    {
        return _file.delete();
    }

    /* --------------------------------------------------------- */
    /**
     * Rename the given resource
     */
    public boolean renameTo( Resource dest)
        throws SecurityException
    {
        if( dest instanceof FileResource)
            return _file.renameTo( ((FileResource)dest)._file);
        else
            return false;
    }

    /* --------------------------------------------------------- */
    /**
     * Returns a list of resources contained in the given resource
     */
    public String[] list()
    {
        String[] list =_file.list();
        if (list==null)
            return null;
        for (int i=list.length;i-->0;)
        {
            if (new File(_file,list[i]).isDirectory() &&
                !list[i].endsWith("/"))
                list[i]+="/";
        }
        return list;
    }
         
    /* ------------------------------------------------------------ */
    /** Encode according to this resource type.
     * File URIs are encoded.
     * @param uri URI to encode.
     * @return The uri unchanged.
     */
    public String encode(String uri)
    {
        return uri;
    }
    
    /* ------------------------------------------------------------ */
    /** 
     * @param o
     * @return True if o is a FileResource object, and o._file is the same as
     *         _file for this instance, and _file is not <i>null</i>.
     */
    public boolean equals( Object o)
    {
        if (this == o)
            return true;

        if (null == o || ! (o instanceof FileResource))
            return false;

        FileResource f=(FileResource)o;
        return f._file == _file || (null != _file && _file.equals(f._file));
    }

    /* ------------------------------------------------------------ */
    /**
     * @return the hashcode.
     */
    public int hashCode()
    {
       return null == _file ? super.hashCode() : _file.hashCode();
    }
}
