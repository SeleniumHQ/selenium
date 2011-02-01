// ========================================================================
// $Id: ServletIn.java,v 1.6 2004/05/09 20:32:27 gregwilkins Exp $
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

import java.io.IOException;

import javax.servlet.ServletInputStream;

import org.openqa.jetty.http.HttpInputStream;


class ServletIn extends ServletInputStream
{
    HttpInputStream _in;

    /* ------------------------------------------------------------ */
    ServletIn(HttpInputStream in)
    {
        _in=in;
    }
    
    /* ------------------------------------------------------------ */
    public int read()
        throws IOException
    {
        return _in.read();
    }
    
    /* ------------------------------------------------------------ */
    public int read(byte b[]) throws IOException
    {
        return _in.read(b);
    }
    
    /* ------------------------------------------------------------ */
    public int read(byte b[], int off, int len) throws IOException
    {    
        return _in.read(b,off,len);
    }
    
    /* ------------------------------------------------------------ */
    public long skip(long len) throws IOException
    {
        return _in.skip(len);
    }
    
    /* ------------------------------------------------------------ */
    public int available()
        throws IOException
    {
        return _in.available();
    }
    
    /* ------------------------------------------------------------ */
    public void close()
        throws IOException
    {
        _in.close();
    }
    
    /* ------------------------------------------------------------ */
    public boolean markSupported()
    {
        return _in.markSupported();
    }
    
    /* ------------------------------------------------------------ */
    public void reset()
        throws IOException
    {
        _in.reset();
    }
    
    /* ------------------------------------------------------------ */
    public void mark(int readlimit)
    {
        _in.mark(readlimit);
    }
    
}


