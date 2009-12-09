// ========================================================================
// $Id: CachedResource.java,v 1.6 2004/05/09 20:32:49 gregwilkins Exp $
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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;

/* ------------------------------------------------------------ */
/** Cached resource class.
 *
 * This resource caches in memory the contents of another resource.
 * The update() method must be called to check if the real resource has
 * been modified.
 * @version $Id: CachedResource.java,v 1.6 2004/05/09 20:32:49 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */

public class CachedResource extends Resource
{
    Resource _resource;
    long _lastModified;
    byte[] _buf ;
    String[] _list;
    
    /* ------------------------------------------------------------ */
    CachedResource(Resource resource)
        throws IOException
    {
        _resource=resource;
        update();
    }

    /* ------------------------------------------------------------ */
    public synchronized boolean isUptoDate()
        throws IOException
    {
        return _resource!=null && _resource.exists() &&
            _resource.lastModified()==_lastModified;
    }
    
    /* ------------------------------------------------------------ */
    public synchronized boolean update()
        throws IOException
    {
        if (_resource!=null && !_resource.exists())
        {
            clear();
            return true;
        }
        
        long lm=_resource.lastModified();
        
        if (lm==_lastModified && (_buf!=null || _list!=null))
            return false;
        _lastModified=lm;
        
        if (_resource.isDirectory())
            _list=_resource.list();

        if (_list==null)
        {
            int l=(int)_resource.length();
            if (l<0)
                l=1024;
            ByteArrayOutputStream2 bout = new ByteArrayOutputStream2(l);
            InputStream in = _resource.getInputStream();
            try{IO.copy(in,bout);} finally {in.close();}
            _buf=bout.getBuf();
            if (_buf.length!=l)
                _buf=bout.toByteArray();
        }
        return true;
    }
    
    /* ------------------------------------------------------------ */
    public synchronized void clear()
    {
        _buf=null;
        _list=null;
    }

    /* ------------------------------------------------------------ */
    /** Release any resources held by the resource.
     */
    public void release()
    {
        clear();
        _resource.release();
    }

    /* ------------------------------------------------------------ */
    /**
     * Returns true if the respresened resource exists.
     */
    public synchronized boolean exists()
    {
        return _buf!=null || _list!=null;
    }

    /* ------------------------------------------------------------ */
    public boolean isDirectory()
    {
        return _list!=null;
    }


    /* ------------------------------------------------------------ */
    public long lastModified()
    {
        return _lastModified;
    }

    /* ------------------------------------------------------------ */
    public long length()
    {
        if (_buf!=null)
            return _buf.length;
        return -1;
    }

    /* ------------------------------------------------------------ */
    public URL getURL()
    {
        return _resource.getURL();
    }

    /* ------------------------------------------------------------ */
    public File getFile()
        throws IOException
    {
        return _resource.getFile();
    }

    /* ------------------------------------------------------------ */
    /**
     * Returns the name of the resource
     */
    public String getName()
    {
        return _resource.getName();
    }

    /* ------------------------------------------------------------ */
    /**
     * Returns an input stream to the resource
     */
    public InputStream getInputStream()
        throws IOException
    {
        if (_buf!=null)
            return new ByteArrayInputStream(_buf);
        return _resource.getInputStream();
    }


    /* ------------------------------------------------------------ */
    /**
     * Returns an output stream to the resource
     */
    public OutputStream getOutputStream()
        throws java.io.IOException, SecurityException
    {
        return _resource.getOutputStream();
    }

    /* ------------------------------------------------------------ */
    /**
     * Deletes the given resource
     */
    public synchronized boolean delete()
        throws SecurityException
    {
        if (_resource.delete())
        {
            clear();
            return true;
        }
        return false;
    }

    /* ------------------------------------------------------------ */
    /**
     * Rename the given resource
     */
    public synchronized boolean renameTo( Resource dest)
        throws SecurityException
    {
        if (_resource.renameTo(dest))
        {
            clear();
            return true;
        }
        return false;
    }

    /* ------------------------------------------------------------ */
    /**
     * Returns a list of resource names contained in the given resource
     */
    public String[] list()
    {
        return _list;
    }

    /* ------------------------------------------------------------ */
    /**
     * Returns the resource contained inside the current resource with the
     * given name
     */
    public Resource addPath(String path)
        throws IOException,MalformedURLException
    {
        return _resource.addPath(path);
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        return _resource.toString();
    }

    /* ------------------------------------------------------------ */
    public int hashCode()
    {
        return _resource.hashCode();
    }
    
    /* ------------------------------------------------------------ */
    public boolean equals( Object o)
    {
        return _resource.equals(o);
    }

    /* ------------------------------------------------------------ */
    public void writeTo(OutputStream os, long startByte, long count) 
        throws IOException
    {
        if (count<0)
            count=_buf.length-startByte;
        if (_buf!=null)
            os.write(_buf, (int) startByte, (int) count);
    }
    
    /* ------------------------------------------------------------ */
    public byte[] getCachedData()
    {
        return _buf;
    }
    
    /* ------------------------------------------------------------ */
    public void setCachedData(byte[] buf)
    {
        _buf = buf;
    }

    
}
