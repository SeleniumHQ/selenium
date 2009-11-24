// ========================================================================
// $Id: ChunkingInputStream.java,v 1.7 2005/08/13 00:01:24 gregwilkins Exp $
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

package org.openqa.jetty.http;

import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;


/* ------------------------------------------------------------ */
/** Dechunk input.
 * Or limit content length.
 */
public class ChunkingInputStream extends InputStream
{
    private static Log log = LogFactory.getLog(ChunkingInputStream.class);
    private static final String __UNEXPECTED_EOF="Unexpected EOF while chunking";

    /* ------------------------------------------------------------ */
    int _chunkSize=0;
    HttpFields _trailer=null;
    LineInput _in;
    
    /* ------------------------------------------------------------ */
    /** Constructor.
     */
    public ChunkingInputStream(LineInput in)
    {
        _in=in;
    }
    
    /* ------------------------------------------------------------ */
    public void resetStream()
    {
        _chunkSize=0;
        _trailer=null;
    }
    
    /* ------------------------------------------------------------ */
    public int read()
        throws IOException
    {
        int b=-1;
        if (_chunkSize<=0 && getChunkSize()<=0)
            return -1;
        b=_in.read();
        if (b<0)
        {
            _chunkSize=-1;
            throw new IOException(__UNEXPECTED_EOF);
        }
        _chunkSize--;
        return b;
    }
    
    /* ------------------------------------------------------------ */
    public int read(byte b[]) throws IOException
    {
        int len = b.length;
        if (_chunkSize<=0 && getChunkSize()<=0)
            return -1;
        if (len > _chunkSize)
            len=_chunkSize;
        len=_in.read(b,0,len);
        if (len<0)
        {
            _chunkSize=-1;
            throw new IOException(__UNEXPECTED_EOF);
        }
        _chunkSize=_chunkSize-len;
        return len;
    }
    
    /* ------------------------------------------------------------ */
    public int read(byte b[], int off, int len) throws IOException
    {  
        if (_chunkSize<=0 && getChunkSize()<=0)
            return -1;
        if (len > _chunkSize)
            len=_chunkSize;
        len=_in.read(b,off,len);
        if (len<0)
        {
            _chunkSize=-1;
            throw new IOException(__UNEXPECTED_EOF);
        }
        _chunkSize=_chunkSize-len;
        return len;
    }
    
    /* ------------------------------------------------------------ */
    public long skip(long len) throws IOException
    { 
        if (_chunkSize<=0 && getChunkSize()<=0)
                return -1;
        if (len > _chunkSize)
            len=_chunkSize;
        len=_in.skip(len);
        if (len<0)
        {
            _chunkSize=-1;
            throw new IOException(__UNEXPECTED_EOF);
        }
        _chunkSize=_chunkSize-(int)len;
        return len;
    }
    
    /* ------------------------------------------------------------ */
    public int available()
        throws IOException
    {
        int len = _in.available();
        if (len<=_chunkSize || _chunkSize==0)
            return len;
        return _chunkSize;
    }
    
    /* ------------------------------------------------------------ */
    public void close()
        throws IOException
    {
        _chunkSize=-1;
    }
    
    /* ------------------------------------------------------------ */
    /** Mark is not supported.
     * @return false
     */
    public boolean markSupported()
    {
        return false;
    }
    
    /* ------------------------------------------------------------ */
    /** Not Implemented.
     */
    public void reset()
    {
        log.warn(LogSupport.NOT_IMPLEMENTED);
    }
    
    /* ------------------------------------------------------------ */
    /** Not Implemented.
     * @param readlimit 
     */
    public void mark(int readlimit)
    {
        log.warn(LogSupport.NOT_IMPLEMENTED);
    }
    
    /* ------------------------------------------------------------ */
    /* Get the size of the next chunk.
     * @return size of the next chunk or -1 for EOF.
     * @exception IOException 
     */
    private int getChunkSize()
        throws IOException
    {
        if (_chunkSize<0)
            return -1;
        
        _trailer=null;
        _chunkSize=-1;
        
        // Get next non blank line
        org.openqa.jetty.util.LineInput.LineBuffer line_buffer
            =_in.readLineBuffer();
        while(line_buffer!=null && line_buffer.size==0)
            line_buffer=_in.readLineBuffer();
        
        // Handle early EOF or error in format
        if (line_buffer==null)
            throw new IOException("Unexpected EOF");
        
        String line= new String(line_buffer.buffer,0,line_buffer.size);
        
        
        // Get chunksize
        int i=line.indexOf(';');
        if (i>0)
            line=line.substring(0,i).trim();
        try
        {
            _chunkSize = Integer.parseInt(line,16);
        }
        catch (NumberFormatException e)
        {
            _chunkSize=-1;
            log.warn("Bad Chunk:"+line);
            log.debug(LogSupport.EXCEPTION,e);
            throw new IOException("Bad chunk size");
        }
                 
        // check for EOF
        if (_chunkSize==0)
        {
            _chunkSize=-1;
            // Look for trailers
            _trailer = new HttpFields();
            _trailer.read(_in);
        }
        
        return _chunkSize;
    }
}
