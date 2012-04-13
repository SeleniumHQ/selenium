// ========================================================================
// $Id: HttpInputStream.java,v 1.13 2005/08/23 20:02:26 gregwilkins Exp $
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

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.StringUtil;


/* ------------------------------------------------------------ */
/** HTTP Chunking InputStream. 
 * This FilterInputStream acts as a BufferedInputStream until
 * setChunking(true) is called.  Once chunking is
 * enabled, the raw stream is chunk decoded as per RFC2616.
 *
 * The "8859-1" encoding is used on underlying LineInput instance for
 * line based reads from the raw stream.
 *
 * This class is not synchronized and should be synchronized
 * explicitly if an instance is used by multiple threads.
 *
 * @see org.openqa.jetty.util.LineInput
 * @version $Id: HttpInputStream.java,v 1.13 2005/08/23 20:02:26 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class HttpInputStream extends FilterInputStream
{
    private static Log log = LogFactory.getLog(HttpInputStream.class);

    /* ------------------------------------------------------------ */
    private static ClosedStream __closedStream=new ClosedStream();
    
    /* ------------------------------------------------------------ */
    private ChunkingInputStream _deChunker;
    private LineInput _realIn;
    private boolean _chunking;
    private OutputStream _expectContinues;
    
    /* ------------------------------------------------------------ */
    /** Constructor.
     */
    public HttpInputStream( InputStream in)
    {
        this(in,4096);
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor.
     */
    public HttpInputStream(InputStream in, int bufferSize)
    {
        super(null);
        try {
            _realIn= new LineInput(in,bufferSize,StringUtil.__ISO_8859_1);
        }
        catch(UnsupportedEncodingException e)
        {
            log.fatal(e); System.exit(1);
        }
        this.in=_realIn;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @return OutputStream object set by setExpectContinues()
     * @see #expectContinues()
     */
    public OutputStream getExpectContinues()
    {
        return _expectContinues;
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @param expectContinues The expectContinues to set.
     */
    public void setExpectContinues(OutputStream expectContinues)
    {
        _expectContinues = expectContinues;
    }
    
    /* ------------------------------------------------------------ */
    /* 
     * @see java.io.InputStream#read()
     */
    public int read() throws IOException
    {
        if (_expectContinues!=null)
            expectContinues();
        return super.read();
    }
    
    /* ------------------------------------------------------------ */
    /* 
     * @see java.io.InputStream#read(byte[], int, int)
     */
    public int read(byte[] b, int off, int len) throws IOException
    {
        if (_expectContinues!=null)
            expectContinues();
        return super.read(b, off, len);
    }
    
    /* ------------------------------------------------------------ */
    /* 
     * @see java.io.InputStream#read(byte[])
     */
    public int read(byte[] b) throws IOException
    {
        if (_expectContinues!=null)
            expectContinues();
        return super.read(b);
    }
    
    /* ------------------------------------------------------------ */
    /* 
     * @see java.io.InputStream#skip(long)
     */
    public long skip(long n) throws IOException
    {
        if (_expectContinues!=null)
            expectContinues();
        return super.skip(n);
    }
    
    /* ------------------------------------------------------------ */
    private void expectContinues()
    	throws IOException	
    	{
        try
        {
            if (available()<=0)
            {
                _expectContinues.write(HttpResponse.__Continue);
                _expectContinues.flush();
            }
        }
        finally
        {
            _expectContinues=null;
        }
            
    }
    
    /* ------------------------------------------------------------ */
    /** Get the raw stream.
     * A stream without filters or chunking is returned. This stream
     * may still be buffered and uprocessed bytes may be in the buffer.
     * @return Raw InputStream.
     */
    public InputStream getInputStream()
    {
        return _realIn;
    }
    
    /* ------------------------------------------------------------ */
    /** Get Filter InputStream.
     * Get the current top of the InputStream filter stack
     * @return InputStream.
     */
    public InputStream getFilterStream()
    {
        return in;
    }
    
    /* ------------------------------------------------------------ */
    /** Set Filter InputStream.
     * Set input filter stream, which should be constructed to wrap
     * the stream returned from get FilterStream.
     */
    public void setFilterStream(InputStream filter)
    {
        in=filter;
    }
    
    /* ------------------------------------------------------------ */
    /** Get chunking mode 
     */
    public boolean isChunking()
    {
        return _chunking;
    }
    
    /* ------------------------------------------------------------ */
    /** Set chunking mode.
     * Chunking can only be turned off with a call to resetStream().
     * @exception IllegalStateException Checking cannot be set if
     * a content length has been set.
     */
    public void setChunking()
        throws IllegalStateException
    {
        if (_realIn.getByteLimit()>=0)
            throw new IllegalStateException("Has Content-Length");
        if (_deChunker==null)
            _deChunker=new ChunkingInputStream(_realIn);
        in=_deChunker;
        
        _chunking=true;
        _deChunker._trailer=null;
    }

    /* ------------------------------------------------------------ */
    /** Reset the stream.
     * Turn chunking off and disable all filters.
     * @exception IllegalStateException The stream cannot be reset if
     * there is some unread chunked input or a content length greater
     * than zero remaining.
     */
    public void resetStream()
        throws IllegalStateException
    {
        if ((_deChunker!=null && _deChunker._chunkSize>0) ||
            _realIn.getByteLimit()>0)
            throw new IllegalStateException("Unread input");
        if(log.isTraceEnabled())log.trace("resetStream()");
        in=_realIn;
        if (_deChunker!=null)
            _deChunker.resetStream();
        _chunking=false;
        _realIn.setByteLimit(-1);
    }
 
    /* ------------------------------------------------------------ */
    public void close()
        throws IOException
    {
        in=__closedStream;
    }
    
    
    /* ------------------------------------------------------------ */
    /** Set the content length.
     * Only this number of bytes can be read before EOF is returned.
     * @param len length.
     */
    public void setContentLength(int len)
    {
        if (_chunking && len>=0 && getExpectContinues()==null)
            throw new IllegalStateException("Chunking");
        _realIn.setByteLimit(len);
    }

    /* ------------------------------------------------------------ */
    void unsafeSetContentLength(int len) 
    {
        _realIn.setByteLimit(len);
    } 
    
    /* ------------------------------------------------------------ */
    /** Get the content length.
     * @return Number of bytes until EOF is returned or -1 for no limit.
     */
    public int getContentLength()
    {
        return _realIn.getByteLimit();
    }

    /* ------------------------------------------------------------ */
    public HttpFields getTrailer()
    {
        return _deChunker._trailer;
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        if (_realIn!=null)
            _realIn.destroy();
        _realIn=null;
        _deChunker=null;
        _expectContinues=null;
    }
    
    
    /* ------------------------------------------------------------ */
    /** A closed input stream.
     */
    private static class ClosedStream extends InputStream
    {
        /* ------------------------------------------------------------ */
        public int read()
            throws IOException
        {
            return -1;
        }
    }    
}
