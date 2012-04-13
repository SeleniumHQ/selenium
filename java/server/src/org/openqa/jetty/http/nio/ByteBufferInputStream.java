// ========================================================================
// $Id: ByteBufferInputStream.java,v 1.5 2005/08/13 00:01:26 gregwilkins Exp $
// Copyright 2003-2004 Mort Bay Consulting Pty. Ltd.
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
 
package org.openqa.jetty.http.nio;

import java.io.IOException;
import java.io.InputStream;
import java.io.InterruptedIOException;
import java.net.SocketTimeoutException;
import java.nio.ByteBuffer;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LazyList;

/* ------------------------------------------------------------------------------- */
/** 
 * 
 * @version $Revision: 1.5 $
 * @author gregw
 */
public class ByteBufferInputStream extends InputStream
{
    private static Log log= LogFactory.getLog(ByteBufferInputStream.class);
    
    long _timeout=30000;
    int _bufferSize;
    ByteBuffer _buffer;
    Object _buffers;
    Object _recycle;
    boolean _closed=false;
    
    /* ------------------------------------------------------------------------------- */
    /** Constructor.
     */
    public ByteBufferInputStream(int bufferSize)
    {
        super();
        _bufferSize=bufferSize;
    }


    /* ------------------------------------------------------------------------------- */
    /** getSoTimeout.
     * @return Timeout value for this instance.
     */
    public long getTimeout()
    {
        return _timeout;
    }

    /* ------------------------------------------------------------------------------- */
    /** setSoTimeout.
     * @param l
     */
    public void setTimeout(long l)
    {
        _timeout= l;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#read()
     */
    public synchronized int read() throws IOException
    {
        if (!waitForContent())
            return -1;
         return _buffer.get();
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#available()
     */
    public synchronized int available() throws IOException
    {
        if (!waitForContent())
            return -1;
         return _buffer.remaining();
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#close()
     */
    public synchronized void close() throws IOException
    {
        _closed=true;
        this.notify();
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#mark(int)
     */
    public synchronized void mark(int arg0)
    {
        // TODO Auto-generated method stub
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#markSupported()
     */
    public synchronized boolean markSupported()
    {
        // TODO Auto-generated method stub
        return false;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#read(byte[], int, int)
     */
    public synchronized int read(byte[] buf, int offset, int length) 
        throws IOException
    {

        if (!waitForContent())
            return -1;
            
         if (length>_buffer.remaining())
            length=_buffer.remaining();
            
         _buffer.get(buf, offset, length);
        return length;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#read(byte[])
     */
    public synchronized int read(byte[] buf) throws IOException
    {
        if (!waitForContent())
            return -1;
         int length=buf.length;
         if (length>_buffer.remaining())
            length=_buffer.remaining();
            
         _buffer.get(buf, 0, length);
        return length;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.InputStream#reset()
     */
    public synchronized void reset() throws IOException
    {
        // TODO Auto-generated method stub
        super.reset();
    }

    /* ------------------------------------------------------------------------------- */
    /**
     * @see java.io.InputStream#skip(long)
     */
    public long skip(long length) throws IOException
    {
        if (!waitForContent())
            return -1;
         if (length>_buffer.remaining())
            length=_buffer.remaining();
         _buffer.position((int)(_buffer.position()+length));
        return length;
    }

    /* ------------------------------------------------------------------------------- */
     public synchronized void write(ByteBuffer buffer)
     {
         if (buffer.hasRemaining())
         {
             _buffers=LazyList.add(_buffers,buffer); 
            this.notify();
         }
         else
             recycle(buffer);
     }

    /* ------------------------------------------------------------------------------- */
    private synchronized boolean waitForContent()
        throws InterruptedIOException
    {
        if (_buffer!=null)
        {
            if (_buffer.hasRemaining())
                return true;
             
             // recycle buffer
             recycle(_buffer);
             _buffer=null;
        }        
        
        while(!_closed && LazyList.size(_buffers)==0)
        {
            try
            {
                this.wait(_timeout);
            }
            catch(InterruptedException e)
            {
                log.debug(e);
                throw new InterruptedIOException(e.toString());
            }
        }    
        
        if (_closed)
            return false;
            
        if (LazyList.size(_buffers)==0)
            throw new SocketTimeoutException();
        
        _buffer=(ByteBuffer)LazyList.get(_buffers, 0);
        _buffers=LazyList.remove(_buffers, 0);
        
        return true;
    }
    

    /* ------------------------------------------------------------------------------- */
    /** Get a buffer to write to this InputStream.
     * The buffer wll either be a new direct buffer or a recycled buffer.
     */
    public synchronized ByteBuffer getBuffer()
    {
        ByteBuffer buf=null;
        int s=LazyList.size(_recycle);
        if (s>0)
        {
            s--;
             buf=(ByteBuffer)LazyList.get(_recycle, s);
             _recycle=LazyList.remove(_recycle,s);
             buf.clear();
        }
        else
        {
            buf=ByteBuffer.allocateDirect(_bufferSize);
        }
         return buf;     
    }

    /* ------------------------------------------------------------------------------- */
    public synchronized void recycle(ByteBuffer buf)
    {
         _recycle=LazyList.add(_recycle,buf);
    }

    /* ------------------------------------------------------------------------------- */
    public void destroy()
    {
        _buffer=null;
        _buffers=null;
        _recycle=null;
    }
    

}
