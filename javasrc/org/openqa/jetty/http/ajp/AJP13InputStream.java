// ========================================================================
// $Id: AJP13InputStream.java,v 1.11 2006/10/08 14:13:05 gregwilkins Exp $
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

package org.openqa.jetty.http.ajp;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class AJP13InputStream extends InputStream
{
    /* ------------------------------------------------------------ */
    private AJP13RequestPacket _packet;
    private AJP13RequestPacket _getBodyChunk;
    private InputStream _in;
    private OutputStream _out;
    private boolean _gotFirst=false;
    private boolean _closed;

    /* ------------------------------------------------------------ */
    AJP13InputStream(InputStream in, OutputStream out, int bufferSize)
    {
        _in=in;
        _out=out;
        _packet=new AJP13RequestPacket(bufferSize);
        _getBodyChunk=new AJP13RequestPacket(8);
        _getBodyChunk.addByte((byte)'A');
        _getBodyChunk.addByte((byte)'B');
        _getBodyChunk.addInt(3);
        _getBodyChunk.addByte(AJP13RequestPacket.__GET_BODY_CHUNK);
        _getBodyChunk.addInt(bufferSize);
    }

    /* ------------------------------------------------------------ */
    public void resetStream()
    {
        _gotFirst=false;
        _closed=false;
        _packet.reset();
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        if (_packet!=null)
            _packet.destroy();
        _packet=null;
        if (_getBodyChunk!=null)
            _getBodyChunk.destroy();
        _getBodyChunk=null;
        _in=null;
        _out=null;
    }

    /* ------------------------------------------------------------ */
    public int available() throws IOException
    {
        if (_closed)
            return 0;
        if (_packet.unconsumedData()==0)
            fillPacket();
        return _packet.unconsumedData();
    }

    /* ------------------------------------------------------------ */
    public void close() throws IOException
    {
        _closed=true;
    }

    /* ------------------------------------------------------------ */
    public void mark(int readLimit)
    {
    }

    /* ------------------------------------------------------------ */
    public boolean markSupported()
    {
        return false;
    }

    /* ------------------------------------------------------------ */
    public void reset() throws IOException
    {
        throw new IOException("reset() not supported");
    }

    /* ------------------------------------------------------------ */
    public int read() throws IOException
    {
        if (_closed)
            return -1;

        if (_packet.unconsumedData()<=0)
        {
            fillPacket();
            if (_packet.unconsumedData()<=0)
            {
                _closed=true;
                return -1;
            }
        }
        return _packet.getByte();
    }

    /* ------------------------------------------------------------ */
    public int read(byte[] b, int off, int len) throws IOException
    {
        if (_closed)
            return -1;

        if (_packet.unconsumedData()==0)
        {
            fillPacket();
            if (_packet.unconsumedData()==0)
            {
                _closed=true;
                return -1;
            }
        }

        return _packet.getBytes(b,off,len);
    }

    /* ------------------------------------------------------------ */
    /**
     * @return The next packet from the stream. The packet is recycled and is
     *         only valid until the next call to nextPacket or read().
     * @exception IOException
     */
    public AJP13RequestPacket nextPacket() throws IOException
    {
        if (_packet.read(_in))
            return _packet;
        return null;
    }

    /* ------------------------------------------------------------ */
    private void fillPacket() throws IOException
    {
        if (_closed)
            return;

        if (_gotFirst||_in.available()==0)
            _getBodyChunk.write(_out);
        _gotFirst=true;

        // read packet
        if (!_packet.read(_in))
            throw new IOException("EOF");

        if (_packet.unconsumedData()<=0)
            _closed=true;
        else if (_packet.getInt()>_packet.getBufferSize())
            throw new IOException("AJP Protocol error");
    }

    /* ------------------------------------------------------------ */
    public long skip(long n) throws IOException
    {
        if (_closed)
            return -1;

        for (int i=0; i<n; i++)
            if (read()<0)
                return i==0?-1:i;
        return n;
    }
}
