// ========================================================================
// $Id: SocketChannelOutputStream.java,v 1.4 2005/08/13 00:01:26 gregwilkins Exp $
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
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LogSupport;

/* ------------------------------------------------------------------------------- */
/** 
 * Blocking output stream on non-blocking SocketChannel.  Makes the 
 * assumption that writes will rarely need to block.
 * All writes flush to the channel, and no additional buffering is done.
 * @version $Revision: 1.4 $
 * @author gregw
 */
public class SocketChannelOutputStream extends OutputStream
{
    private static Log log= LogFactory.getLog(SocketChannelOutputStream.class);
    
    ByteBuffer _buffer;
    ByteBuffer _flush;
    SocketChannel _channel;
    Selector _selector;
    
    /* ------------------------------------------------------------------------------- */
    /** Constructor.
     * 
     */
    public SocketChannelOutputStream(SocketChannel channel,
                                                                             int bufferSize)
    {
        _channel=channel;
        _buffer=ByteBuffer.allocateDirect(bufferSize);
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.OutputStream#write(int)
     */
    public void write(int b) throws IOException
    {
        _buffer.clear();
        _buffer.put((byte)b);
        _buffer.flip();
        _flush=_buffer;
        flushBuffer();
    }

    
    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.OutputStream#close()
     */
    public void close() throws IOException
    {
        _channel.close();
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.OutputStream#flush()
     */
    public void flush() throws IOException
    {
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.OutputStream#write(byte[], int, int)
     */
    public void write(byte[] buf, int offset, int length) throws IOException
    {
        if (length>_buffer.capacity())
            _flush=ByteBuffer.wrap(buf,offset,length);
        else
         {
             _buffer.clear();
             _buffer.put(buf,offset,length);
             _buffer.flip();
             _flush=_buffer;
         }
         flushBuffer();
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see java.io.OutputStream#write(byte[])
     */
    public void write(byte[] buf) throws IOException
    {
        if (buf.length>_buffer.capacity())
            _flush=ByteBuffer.wrap(buf);
        else
         {
             _buffer.clear();
             _buffer.put(buf);
             _buffer.flip();
             _flush=_buffer;
         }
         flushBuffer();
    }


    /* ------------------------------------------------------------------------------- */
    private void flushBuffer() throws IOException
    {
        while (_flush.hasRemaining())
        {
            int len=_channel.write(_flush);
            if (len<0)
                throw new IOException("EOF");
            if (len==0)
            {
                // write channel full.  Try letting other threads have a go.
                Thread.yield();
                len=_channel.write(_flush);
                if (len<0)
                    throw new IOException("EOF");
                if (len==0)
                {
                    // still full.  need to  block until it is writable.
                    if (_selector==null)
                     {
                            _selector=Selector.open();
                            _channel.register(_selector,SelectionKey.OP_WRITE);
                     }

                     _selector.select();
                }
            }
        }
    }

    /* ------------------------------------------------------------------------------- */
    public void destroy()
    {
        if (_selector!=null)
        {
            try{_selector.close();}
            catch(IOException e){ LogSupport.ignore(log,e);}
            _selector=null;
            _buffer=null;
            _flush=null;
            _channel=null;
        }
    }
}
