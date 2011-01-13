// ========================================================================
// $Id: BadResource.java,v 1.5 2004/05/09 20:32:49 gregwilkins Exp $
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
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;


/* ------------------------------------------------------------ */
/** Bad Resource.
 *
 * A Resource that is returned for a bade URL.  Acts as a resource
 * that does not exist and throws appropriate exceptions.
 *
 * @version $Revision: 1.5 $
 * @author Greg Wilkins (gregw)
 */
class BadResource extends URLResource
{
    /* ------------------------------------------------------------ */
    private String _message=null;
        
    /* -------------------------------------------------------- */
    BadResource(URL url,  String message)
    {
        super(url,null);
        _message=message;
    }
    

    /* -------------------------------------------------------- */
    public boolean exists()
    {
        return false;
    }
        
    /* -------------------------------------------------------- */
    public long lastModified()
    {
        return -1;
    }

    /* -------------------------------------------------------- */
    public boolean isDirectory()
    {
        return false;
    }

    /* --------------------------------------------------------- */
    public long length()
    {
        return -1;
    }
        
        
    /* ------------------------------------------------------------ */
    public File getFile()
    {
        return null;
    }
        
    /* --------------------------------------------------------- */
    public InputStream getInputStream() throws IOException
    {
        throw new FileNotFoundException(_message);
    }
        
    /* --------------------------------------------------------- */
    public OutputStream getOutputStream()
        throws java.io.IOException, SecurityException
    {
        throw new FileNotFoundException(_message);
    }
        
    /* --------------------------------------------------------- */
    public boolean delete()
        throws SecurityException
    {
        throw new SecurityException(_message);
    }

    /* --------------------------------------------------------- */
    public boolean renameTo( Resource dest)
        throws SecurityException
    {
        throw new SecurityException(_message);
    }

    /* --------------------------------------------------------- */
    public String[] list()
    {
        return null;
    }

    /* ------------------------------------------------------------ */
    public String toString()
    {
        return super.toString()+"; BadResource="+_message;
    }
    
}
