// ========================================================================
// $Id: AJP13OutputStream.java,v 1.14 2006/10/08 14:13:05 gregwilkins Exp $
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
import java.io.OutputStream;
import java.util.Enumeration;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.BufferedOutputStream;
import org.openqa.jetty.http.HttpMessage;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.LogSupport;

/**
 * OutputStream for AJP13 protocol.
 * 
 * 
 * @version $Revision: 1.14 $
 * @author Greg Wilkins (gregw)
 */
public class AJP13OutputStream extends BufferedOutputStream
{
    private static Log log=LogFactory.getLog(AJP13OutputStream.class);

    private AJP13ResponsePacket _packet;
    private boolean _complete;
    private boolean _completed;
    private boolean _persistent=true;
    private AJP13ResponsePacket _ajpResponse;

    /* ------------------------------------------------------------ */
    AJP13OutputStream(OutputStream out, int bufferSize)
    {
        super(out,bufferSize,AJP13ResponsePacket.__DATA_HDR,AJP13ResponsePacket.__DATA_HDR,1);
        setFixed(true);
        _packet=new AJP13ResponsePacket(_buf);
        _packet.prepare();

        setBypassBuffer(false);
        setFixed(true);

        _ajpResponse=new AJP13ResponsePacket(bufferSize);
        _ajpResponse.prepare();
    }

    /* ------------------------------------------------------------ */
    public void writeHeader(HttpMessage httpMessage) throws IOException
    {
        HttpResponse response=(HttpResponse)httpMessage;
        response.setState(HttpMessage.__MSG_SENDING);

        _ajpResponse.resetData();
        _ajpResponse.addByte(AJP13ResponsePacket.__SEND_HEADERS);
        _ajpResponse.addInt(response.getStatus());
        _ajpResponse.addString(response.getReason());

        int mark=_ajpResponse.getMark();
        _ajpResponse.addInt(0);
        int nh=0;
        Enumeration e1=response.getFieldNames();
        while (e1.hasMoreElements())
        {
            String h=(String)e1.nextElement();
            Enumeration e2=response.getFieldValues(h);
            while (e2.hasMoreElements())
            {
                _ajpResponse.addHeader(h);
                _ajpResponse.addString((String)e2.nextElement());
                nh++;
            }
        }

        if (nh>0)
            _ajpResponse.setInt(mark,nh);
        _ajpResponse.setDataSize();

        write(_ajpResponse);

        _ajpResponse.resetData();
    }

    /* ------------------------------------------------------------ */
    public void write(AJP13Packet packet) throws IOException
    {
        packet.write(_out);
    }

    /* ------------------------------------------------------------ */
    public void flush() throws IOException
    {
        super.flush();
        if (_complete&&!_completed)
        {
            _completed=true;

            _packet.resetData();
            _packet.addByte(AJP13ResponsePacket.__END_RESPONSE);
            _packet.addBoolean(_persistent);
            _packet.setDataSize();
            write(_packet);
            _packet.resetData();
        }
    }

    /* ------------------------------------------------------------ */
    public void close() throws IOException
    {
        _complete=true;
        flush();
    }

    /* ------------------------------------------------------------ */
    public void resetStream()
    {
        _complete=false;
        _completed=false;
        super.resetStream();
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        if (_packet!=null)
            _packet.destroy();
        _packet=null;
        if (_ajpResponse!=null)
            _ajpResponse.destroy();
        _ajpResponse=null;
        _out=null;
    }

    /* ------------------------------------------------------------ */
    public void end() throws IOException
    {
        _persistent=false;
    }

    /* ------------------------------------------------------------ */
    protected void wrapBuffer() throws IOException
    {
        if (size()==0)
            return;

        if (_buf!=_packet.getBuffer())
        {
            _packet=new AJP13ResponsePacket(_buf);
            _packet.prepare();
        }

        prewrite(_buf,0,AJP13ResponsePacket.__DATA_HDR);
        _packet.resetData();
        _packet.addByte(AJP13ResponsePacket.__SEND_BODY_CHUNK);
        _packet.setDataSize(size()-AJP13ResponsePacket.__HDR_SIZE);
        postwrite((byte)0);
    }

    /* ------------------------------------------------------------ */
    protected void bypassWrite(byte[] b, int offset, int length) throws IOException
    {
        log.warn(LogSupport.NOT_IMPLEMENTED);
    }


    /* ------------------------------------------------------------ */
    public void writeTo(OutputStream out) throws IOException
    {
        int sz=size();

        if (sz<=AJP13ResponsePacket.__MAX_BUF)
            super.writeTo(out);
        else
        {
            int offset=preReserve();
            int data=sz-AJP13ResponsePacket.__DATA_HDR;

            while (data>AJP13ResponsePacket.__MAX_DATA)
            {
                _packet.setDataSize(AJP13ResponsePacket.__MAX_BUF-AJP13ResponsePacket.__HDR_SIZE);
                if (offset>0)
                    System.arraycopy(_buf,0,_buf,offset,AJP13ResponsePacket.__DATA_HDR);
                out.write(_buf,offset,AJP13ResponsePacket.__MAX_BUF);

                data-=AJP13ResponsePacket.__MAX_DATA;
                offset+=AJP13ResponsePacket.__MAX_DATA;
            }

            int len=data+AJP13ResponsePacket.__DATA_HDR;
            _packet.setDataSize(len-AJP13ResponsePacket.__HDR_SIZE);
            if (offset>0)
                System.arraycopy(_buf,0,_buf,offset,AJP13ResponsePacket.__DATA_HDR);
            out.write(_buf,offset,len);
        }
    }
}
