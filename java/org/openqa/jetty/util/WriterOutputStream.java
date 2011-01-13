// ========================================================================
// $Id: WriterOutputStream.java,v 1.3 2004/05/09 20:33:05 gregwilkins Exp $
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

package org.openqa.jetty.util;

import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;


/* ------------------------------------------------------------ */
/** Wrap a Writer as an OutputStream.
 * When all you have is a Writer and only an OutputStream will do.
 * Try not to use this as it indicates that your design is a dogs
 * breakfast (JSP made me write it).
 * @version $Id: WriterOutputStream.java,v 1.3 2004/05/09 20:33:05 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class WriterOutputStream extends OutputStream
{
    protected Writer _writer;
    protected String _encoding;
    private byte[] _buf=new byte[1];
    
    /* ------------------------------------------------------------ */
    public WriterOutputStream(Writer writer, String encoding)
    {
        _writer=writer;
        _encoding=encoding;
    }
    
    /* ------------------------------------------------------------ */
    public WriterOutputStream(Writer writer)
    {
        _writer=writer;
    }

    /* ------------------------------------------------------------ */
    public void close()
        throws IOException
    {
        _writer.close();
        _writer=null;
        _encoding=null;
    }
    
    /* ------------------------------------------------------------ */
    public void flush()
        throws IOException
    {
        _writer.flush();
    }
    
    /* ------------------------------------------------------------ */
    public void write(byte[] b) 
        throws IOException
    {
        if (_encoding==null)
            _writer.write(new String(b));
        else
            _writer.write(new String(b,_encoding));
    }
    
    /* ------------------------------------------------------------ */
    public void write(byte[] b, int off, int len)
        throws IOException
    {
        if (_encoding==null)
            _writer.write(new String(b,off,len));
        else
            _writer.write(new String(b,off,len,_encoding));
    }
    
    /* ------------------------------------------------------------ */
    public synchronized void write(int b)
        throws IOException
    {
        _buf[0]=(byte)b;
        write(_buf);
    }
}

