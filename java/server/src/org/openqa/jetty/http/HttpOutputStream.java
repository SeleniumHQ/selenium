// ========================================================================
// $Id: HttpOutputStream.java,v 1.28 2006/10/08 14:13:05 gregwilkins Exp $
// Copyright 199-2004 Mort Bay Consulting Pty. Ltd.
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
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.ByteArrayPool;
import org.openqa.jetty.util.IO;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.OutputObserver;
import org.openqa.jetty.util.StringUtil;


/* ---------------------------------------------------------------- */
/** HTTP Http OutputStream.
 * Acts as a BufferedOutputStream until setChunking() is called.
 * Once chunking is enabled, the raw stream is chunk encoded as per RFC2616.
 *
 * Implements the following HTTP and Servlet features: <UL>
 * <LI>Filters for content and transfer encodings.
 * <LI>Allows output to be reset if not committed (buffer never flushed).
 * <LI>Notification of significant output events for filter triggering,
 *     header flushing, etc.
 * </UL>
 *
 * This class is not synchronized and should be synchronized
 * explicitly if an instance is used by multiple threads.
 *
 * @version $Id: HttpOutputStream.java,v 1.28 2006/10/08 14:13:05 gregwilkins Exp $
 * @author Greg Wilkins
*/
public class HttpOutputStream extends OutputStream
    implements OutputObserver, HttpMessage.HeaderWriter
{
    private static Log log = LogFactory.getLog(HttpOutputStream.class);

    /* ------------------------------------------------------------ */
    final static int __BUFFER_SIZE=4096;
    final static int __FIRST_RESERVE=512;
    
    public final static Class[] __filterArg = {java.io.OutputStream.class};
    
    /* ------------------------------------------------------------ */
    private OutputStream _out;
    private OutputStream _realOut;
    private BufferedOutputStream _bufferedOut;   
    private boolean _written;
    private ArrayList _observers;
    private int _bufferSize;
    private int _headerReserve;
    private HttpWriter _iso8859writer;
    private HttpWriter _utf8writer;
    private HttpWriter _asciiwriter;
    private boolean _nulled;
    private boolean _closing=false;
    private int _contentLength=-1;
	private int _bytes;
	private boolean _disableFlush;
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param outputStream The outputStream to buffer or chunk to.
     */
    public HttpOutputStream(OutputStream outputStream)
    {
        this (outputStream,__BUFFER_SIZE,__FIRST_RESERVE);
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param outputStream The outputStream to buffer or chunk to.
     */
    public HttpOutputStream(OutputStream outputStream, int bufferSize)
    {
        this (outputStream,bufferSize,__FIRST_RESERVE);
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param outputStream The outputStream to buffer or chunk to.
     */
    public HttpOutputStream(OutputStream outputStream,
                            int bufferSize,
                            int headerReserve)
    {
        _written=false;
        _bufferSize=bufferSize;
        _headerReserve=headerReserve;
        _realOut=outputStream;
        _out=_realOut;
    }

    /* ------------------------------------------------------------ */
    public void setContentLength(int length)
    {
        if (length>=0 && length<_bytes)
            throw new IllegalStateException();
        _contentLength=length;
    }
    
    /* ------------------------------------------------------------ */
    public void setBufferedOutputStream(BufferedOutputStream bos)
    {
        _bufferedOut=bos;
        _bufferedOut.setCommitObserver(this);
        if (_out!=null && _out!=_realOut)
            _out=_bufferedOut;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the backing output stream.
     * A stream without filters or chunking is returned.
     * @return Raw OutputStream.
     */
    public OutputStream getOutputStream()
    {
        return _realOut;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the buffered output stream.
     */
    public OutputStream getBufferedOutputStream()
    {
        return _out;
    }
    
    /* ------------------------------------------------------------ */
    /** Has any data been written to the stream.
     * @return True if write has been called.
     */
    public boolean isWritten()
    {
        return _written;
    }
        
    /* ------------------------------------------------------------ */
    /** Get the output buffer capacity.
     * @return Buffer capacity in bytes.
     */
    public int getBufferSize()
    {
        return _bufferSize;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the output buffer size.
     * Note that this is the minimal buffer size and that installed
     * filters may perform their own buffering and are likely to change
     * the size of the output. Also the pre and post reserve buffers may be
     * allocated within the buffer for headers and chunking.
     * @param size Minimum buffer size in bytes
     * @exception IllegalStateException If output has been written.
     */
    public void setBufferSize(int size)
        throws IllegalStateException
    {
        if (size<=_bufferSize)
            return;
        
        if (_bufferedOut!=null && _bufferedOut.size()>0)
            throw new IllegalStateException("Not Reset");

        try
        {
            _bufferSize=size;
            if (_bufferedOut!=null)
            {
                boolean fixed=_bufferedOut.isFixed();
                _bufferedOut.setFixed(false);
                _bufferedOut.ensureSize(size);
                _bufferedOut.setFixed(fixed);
            }
            
        }
        catch (IOException e){log.warn(LogSupport.EXCEPTION,e);}
    }

    /* ------------------------------------------------------------ */
    public int getBytesWritten()
    {
        return _bytes;
    }
    
    /* ------------------------------------------------------------ */
    /** Reset Buffered output.
     * If no data has been committed, the buffer output is discarded and
     * the filters may be reinitialized.
     * @exception IllegalStateException
     */
    public void resetBuffer()
        throws IllegalStateException
    {
        // Shutdown filters without observation
        
        if (_out!=null && _out!=_realOut)
        {
            ArrayList save_observers=_observers;
            _observers=null;
            _nulled=true;
            try
            {
                // discard current buffer and set it to output
                if (_bufferedOut!=null)    
                {
                    _bufferedOut.resetStream();
                    if (_bufferedOut instanceof ChunkingOutputStream)
                        ((ChunkingOutputStream)_bufferedOut).setChunking(false);
                }
            }
            catch(Exception e)
            {
                LogSupport.ignore(log,e);
            }
            finally
            {
                _observers=save_observers;
            }
        }
        _contentLength=-1;
        _nulled=false;
	    _bytes=0;
        _written=false;
        _out=_realOut;
        try
        {
            notify(OutputObserver.__RESET_BUFFER);
        }
        catch(IOException e)
        {
            LogSupport.ignore(log,e);
        }
    }

    /* ------------------------------------------------------------ */
    /** Add an Output Observer.
     * Output Observers get notified of significant events on the
     * output stream. Observers are called in the reverse order they
     * were added.
     * They are removed when the stream is closed.
     * @param observer The observer. 
     */
    public void addObserver(OutputObserver observer)
    {
        if (_observers==null)
            _observers=new ArrayList(4);
        _observers.add(observer);
        _observers.add(null);
    }
    
    /* ------------------------------------------------------------ */
    /** Add an Output Observer.
     * Output Observers get notified of significant events on the
     * output stream. Observers are called in the reverse order they
     * were added.
     * They are removed when the stream is closed.
     * @param observer The observer. 
     * @param data Data to be passed wit notify calls. 
     */
    public void addObserver(OutputObserver observer, Object data)
    {
        if (_observers==null)
            _observers=new ArrayList(4);
        _observers.add(observer);
        _observers.add(data);
    }
    
    /* ------------------------------------------------------------ */
    /** Reset the observers.
     */
    public void resetObservers()
    {
        _observers=null;
    }
    
    /* ------------------------------------------------------------ */
    /** Null the output.
     * All output written is discarded until the stream is reset. Used
     * for HEAD requests.
     */
    public void nullOutput()
        throws IOException
    {
        _nulled=true;
    }
    
    /* ------------------------------------------------------------ */
    /** is the output Nulled?
     */
    public boolean isNullOutput()
        throws IOException
    {
        return _nulled;
    }
    
    /* ------------------------------------------------------------ */
    /** Set chunking mode.
     */
    public void setChunking()
    {
        checkOutput();
        if (_bufferedOut instanceof ChunkingOutputStream)
            ((ChunkingOutputStream)_bufferedOut).setChunking(true);
        else
            throw new IllegalStateException(_bufferedOut.getClass().toString());
    }
    
    /* ------------------------------------------------------------ */
    /** Get chunking mode 
     */
    public boolean isChunking()
    {
        return (_bufferedOut instanceof ChunkingOutputStream) &&
            ((ChunkingOutputStream)_bufferedOut).isChunking();
    }
    
    /* ------------------------------------------------------------ */
    /** Reset the stream.
     * Turn disable all filters.
     * @exception IllegalStateException The stream cannot be
     * reset if chunking is enabled.
     */
    public void resetStream()
        throws IOException, IllegalStateException
    {
        if (isChunking())
            close();
        
        _out=null;
        _nulled=true;
        if (_bufferedOut!=null)
        {
            _bufferedOut.resetStream();
            if (_bufferedOut instanceof ChunkingOutputStream)
                ((ChunkingOutputStream)_bufferedOut).setChunking(false);
        }
        if (_iso8859writer!=null)
            _iso8859writer.flush();
        if (_utf8writer!=null)
            _utf8writer.flush();
        if (_asciiwriter!=null)
            _asciiwriter.flush();

        _bytes=0;
        _written=false;
        _out=_realOut;
        _closing=false;
        _contentLength=-1;
        _nulled=false;
        
        if (_observers!=null)
            _observers.clear();
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        if (_bufferedOut!=null)
            _bufferedOut.destroy();
        _bufferedOut=null;
        if (_iso8859writer!=null)
            _iso8859writer.destroy();
        _iso8859writer=null;
        if (_utf8writer!=null)
            _utf8writer.destroy();
        _utf8writer=null;
        if (_asciiwriter!=null)
            _asciiwriter.destroy();
        _asciiwriter=null;
    }
    
    
    /* ------------------------------------------------------------ */
    public void writeHeader(HttpMessage httpMessage)
        throws IOException
    {
        checkOutput();
        _bufferedOut.writeHeader(httpMessage);
    }
    
    /* ------------------------------------------------------------ */
    public void write(int b) throws IOException
    {
        prepareOutput(1);
        if (!_nulled)
            _out.write(b);
        if (_bytes==_contentLength)
            flush();
    }

    /* ------------------------------------------------------------ */
    public void write(byte b[]) throws IOException
    {
        write(b,0,b.length);
    }

    /* ------------------------------------------------------------ */
    public void write(byte b[], int off, int len)
        throws IOException
    {     
        len=prepareOutput(len);
        if (!_nulled)
            _out.write(b,off,len);
        if (_bytes==_contentLength)
            flush();
    }

    /* ------------------------------------------------------------ */
    protected void checkOutput()
    {
        if (_out==_realOut)
        {
            if (_bufferedOut==null)
            {
                _bufferedOut=new ChunkingOutputStream(_realOut,
                                                      _bufferSize,
                                                      _headerReserve,
                                                      false);
                _bufferedOut.setCommitObserver(this);
                _bufferedOut.setBypassBuffer(true);
                _bufferedOut.setFixed(true);
            }
            _out=_bufferedOut;
        }
    }
    
    /* ------------------------------------------------------------ */
    protected int prepareOutput(int length)
        throws IOException
    {   
        if (_out==null)
            throw new IOException("closed");
        checkOutput();
        if (!_written)
        {
            _written=true;
            notify(OutputObserver.__FIRST_WRITE);
        }        
        
        if (_contentLength>=0)
        {
            if (_bytes+length>=_contentLength)
            {
                length=_contentLength-_bytes;
                if (length==0)
                    _nulled=true;
            }
        }
        _bytes+=length;
        return length;
    }
    
    /* ------------------------------------------------------------ */
    public void flush()
        throws IOException
    {
       if (!_disableFlush && _out!=null && !_closing)
          _out.flush();
    }
    
    /* ------------------------------------------------------------ */
    /** Close the stream.
     * @exception IOException 
     */
    public boolean isClosed()
        throws IOException
    {
        return _out==null;
    }
    
    /* ------------------------------------------------------------ */
    /** Close the stream.
     * @exception IOException 
     */
    public void close()
        throws IOException
    {        
        // Are we already closed?
        if (_out==null)
            return;
        _closing=true;
        // Close
        try {
            notify(OutputObserver.__CLOSING);

            OutputStream out =_out;
            _out=null;
            
            if (out!=_bufferedOut)
                out.close();
            else
                _bufferedOut.close();
            
            notify(OutputObserver.__CLOSED);
        }
        catch (IOException e)
        {
            LogSupport.ignore(log,e);
        }
    }

    /* ------------------------------------------------------------ */
    /** Output Notification.
     * Called by the internal Buffered Output and the event is passed on to
     * this streams observers.
     */
    public void outputNotify(OutputStream out, int action, Object ignoredData)
        throws IOException
    {
        notify(action);
    }

    /* ------------------------------------------------------------ */
    /* Notify observers of action.
     * @see OutputObserver
     * @param action the action.
     */
    private void notify(int action)
        throws IOException
    {
        if (_observers!=null)
        {
            for (int i=_observers.size();i-->0;)
            {
                Object data=_observers.get(i--);
                ((OutputObserver)_observers.get(i)).outputNotify(this,action,data);
            }
        }
    }

    /* ------------------------------------------------------------ */
    public void write(InputStream in, int len)
        throws IOException
    {
        IO.copy(in,this,len);
    }

    /* ------------------------------------------------------------ */
    private Writer getISO8859Writer()
        throws IOException
    {
        if (_iso8859writer==null)
            _iso8859writer=new HttpWriter(StringUtil.__ISO_8859_1,
                                          getBufferSize());
        return _iso8859writer;
    }
    
    /* ------------------------------------------------------------ */
    private Writer getUTF8Writer()
        throws IOException
    {
        if (_utf8writer==null)
            _utf8writer=new HttpWriter("UTF-8",getBufferSize());
        return _utf8writer;
    }
    
    /* ------------------------------------------------------------ */
    private Writer getASCIIWriter()
        throws IOException
    {
        if (_asciiwriter==null)
            _asciiwriter=new HttpWriter("US-ASCII",getBufferSize());
        return _asciiwriter;
    }
    
    /* ------------------------------------------------------------ */
    public Writer getWriter(String encoding)
        throws IOException
    {
        if (encoding==null ||
            StringUtil.__ISO_8859_1.equalsIgnoreCase(encoding)  ||
            "ISO8859_1".equalsIgnoreCase(encoding))
            return getISO8859Writer();

        if ("UTF-8".equalsIgnoreCase(encoding) ||
            "UTF8".equalsIgnoreCase(encoding))
            return getUTF8Writer();
        
        if ("US-ASCII".equalsIgnoreCase(encoding))
            return getASCIIWriter();

        return new OutputStreamWriter(this,encoding);
    }
    
    /* ------------------------------------------------------------ */
    public String toString()
    {
        return super.toString() +
            "\nout="+_out+
            "\nrealOut="+_realOut+
            "\nbufferedOut="+_bufferedOut;
    }
    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class HttpWriter extends Writer
    {
        private OutputStreamWriter _writer=null;
        private boolean _writting=false;
        private byte[] _buf;
        private String _encoding;
        
        /* -------------------------------------------------------- */
        HttpWriter(String encoding,int bufferSize)
        {
            _buf = ByteArrayPool.getByteArray(bufferSize);
            _encoding=encoding;
        }
        
        /* -------------------------------------------------------- */
        public Object getLock()
        {
            return lock;
        }
        
        /* -------------------------------------------------------- */
        public void write(char c)
            throws IOException
        {
            HttpOutputStream.this.prepareOutput(1);
            if (!_nulled)
            {
                if (_writting)
                    _writer.write(c);
                else if (c>=0&&c<=0x7f)
                    HttpOutputStream.this.write((int)c);
                else
                {
                    char[] ca ={c};
                    writeEncoded(ca,0,1);
                }
                
                if (_bytes==_contentLength)
                    flush();
            }
        }
    
        /* ------------------------------------------------------------ */
        public void write(char[] ca)
            throws IOException
        {
            this.write(ca,0,ca.length);
        }
        
        /* ------------------------------------------------------------ */
        public void write(char[] ca,int offset, int len)
            throws IOException
        {
            if (_writting)
                _writer.write(ca,offset,len);
            else
            {
                int s=0;
                for (int i=0;i<len;i++)
                {
                    char c=ca[offset+i];
                    if (c>=0&&c<=0x7f)
                    {
                        _buf[s++]=(byte)c;
                        if (s==_buf.length)
                        {
                            s=HttpOutputStream.this.prepareOutput(s);
                            if (!_nulled)
                                HttpOutputStream.this._out.write(_buf,0,s);
                            s=0;
                        }
                    }
                    else
                    {
                        if (s>0)
                        {
                            s=HttpOutputStream.this.prepareOutput(s);
                            if (!_nulled)
                                HttpOutputStream.this._out.write(_buf,0,s);
                            s=0;
                        }
                        writeEncoded(ca,offset+i,len-i);
                        break;
                    }
                }
                
                if (s>0)
                {
                    s=HttpOutputStream.this.prepareOutput(s);
                    if (!_nulled)
                        HttpOutputStream.this._out.write(_buf,0,s);
                    s=0;
                }
            }

            if (!_nulled && _bytes==_contentLength)
                flush();
        }
    
        /* ------------------------------------------------------------ */
        public void write(String s)
            throws IOException
        {
            this.write(s,0,s.length());
        }
    
        /* ------------------------------------------------------------ */
        public void write(String str,int offset, int len)
            throws IOException
        {
            if (_writting)
                _writer.write(str,offset,len);
            else
            {
                int s=0;
                for (int i=0;i<len;i++)
                {
                    char c=str.charAt(offset+i);
                    if (c>=0&&c<=0x7f)
                    {
                        _buf[s++]=(byte)c;
                        if (s==_buf.length)
                        {
                            s=HttpOutputStream.this.prepareOutput(s);
                            if (!_nulled)
                                HttpOutputStream.this._out.write(_buf,0,s);
                            s=0;
                        }
                    }
                    else
                    {
                        if (s>0)
                        {
                            s=HttpOutputStream.this.prepareOutput(s);
                            if (!_nulled)
                                HttpOutputStream.this._out.write(_buf,0,s);
                            s=0;
                        }
                        char[] chars = str.toCharArray();
                        writeEncoded(chars,offset+i,len-i);
                        break;
                    }
                }
                if (s>0)
                {
                    s=HttpOutputStream.this.prepareOutput(s);
                    if (!_nulled)
                        HttpOutputStream.this._out.write(_buf,0,s);
                    s=0;
                }
            }

            if (_bytes==_contentLength)
                flush();
        }

        /* ------------------------------------------------------------ */
        private void writeEncoded(char[] ca,int offset, int length)
            throws IOException
        {
        	_writting=true;
            if (_writer==null)
                _writer = new OutputStreamWriter(HttpOutputStream.this,_encoding);
      
            try
            {
                HttpOutputStream.this._disableFlush=true;
                _writer.write(ca,offset,length);
                if (HttpOutputStream.this._contentLength>=0)
                    _writer.flush();
            }
            finally
            {
                HttpOutputStream.this._disableFlush=false;
            }
        }
        
        /* ------------------------------------------------------------ */
        public void flush()
            throws IOException
        {
            if (_writting)
                _writer.flush();
            else
                HttpOutputStream.this.flush();
            _writting=false;
        }
        
        /* ------------------------------------------------------------ */
        public void close()
            throws IOException
        {
            _closing=true;
            if (_writting)        
                _writer.flush();
            HttpOutputStream.this.close();
            _writting=false;
        }
        
        /* ------------------------------------------------------------ */
        public void destroy()
        {
            ByteArrayPool.returnByteArray(_buf);
            _buf=null;
            _writer=null;
            _encoding=null;
        }
    }
    /**
     * @return Returns the disableFlush.
     */
}
