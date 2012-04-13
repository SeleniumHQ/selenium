// ========================================================================
// $Id: SocketChannelListener.java,v 1.6 2005/11/03 18:21:59 gregwilkins Exp $
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
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;

import org.apache.commons.logging.Log;
import org.openqa.jetty.http.HttpConnection;
import org.openqa.jetty.http.HttpHandler;
import org.openqa.jetty.http.HttpListener;
import org.openqa.jetty.http.HttpMessage;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpServer;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.ThreadPool;

/* ------------------------------------------------------------------------------- */
/**  EXPERIMENTAL NIO listener!
 * 
 * @version $Revision: 1.6 $
 * @author gregw
 */
public class SocketChannelListener extends ThreadPool implements HttpListener
{
    private static Log log= LogFactory.getLog(SocketChannelListener.class);
    
    private InetSocketAddress _address;
    private int _bufferSize= 4096;
    private int _bufferReserve= 512;
    private int _sslPort;
    private int _lingerTimeSecs=5;
    private HttpHandler _handler;
    
    private transient HttpServer _server;

    private transient ServerSocketChannel _acceptChannel;
    private transient Selector _selector;
    private transient SelectorThread _selectorThread;
    private transient boolean _isLow=false;
    private transient boolean _isOut=false;
    private transient long _warned=0;
    
    
    /* ------------------------------------------------------------------------------- */
    /** Constructor.
     * 
     */
    public SocketChannelListener()
    {
        super();
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#setHttpServer(org.openqa.jetty.http.HttpServer)
     */
    public void setHttpServer(HttpServer server)
    {
        _server=server;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getHttpServer()
     */
    public HttpServer getHttpServer()
    {
        return _server;
    }

    /* ------------------------------------------------------------------------------- */
    /**
     * @see org.openqa.jetty.http.HttpListener#setHost(java.lang.String)
     */
    public void setHost(String host) throws UnknownHostException
    {
        _address = new InetSocketAddress(host, _address == null ? 0 : _address.getPort());
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getHost()
     */
    public String getHost()
    {
        if (_address == null || _address.getAddress() == null)
            return null;
        return _address.getHostName();
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#setPort(int)
     */
    public void setPort(int port)
    {
        if (_address == null || _address.getHostName() == null)
            _address= new InetSocketAddress(port);
        else
            _address= new InetSocketAddress(_address.getHostName(), port);
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getPort()
     */
    public int getPort()
    {
        if (_address == null)
            return 0;
        return _address.getPort();
    }

    /* ------------------------------------------------------------ */
    public void setBufferSize(int size)
    {
        _bufferSize= size;
    }
    
    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getBufferSize()
     */
    public int getBufferSize()
    {
        return _bufferSize;
    }

    /* ------------------------------------------------------------ */
    public void setBufferReserve(int size)
    {
        _bufferReserve= size;
    }
    
    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getBufferReserve()
     */
    public int getBufferReserve()
    {
        return _bufferReserve;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getDefaultScheme()
     */
    public String getDefaultScheme()
    {
        return HttpMessage.__SCHEME;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#customizeRequest(org.openqa.jetty.http.HttpConnection, org.openqa.jetty.http.HttpRequest)
     */
    public void customizeRequest(HttpConnection connection, HttpRequest request)
    {
        // Nothing to do
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#persistConnection(org.openqa.jetty.http.HttpConnection)
     */
    public void persistConnection(HttpConnection connection)
    {
        // TODO low resources check?
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#isLowOnResources()
     */
    public boolean isLowOnResources()
    {
        boolean low = (getMaxThreads()-getThreads()+getIdleThreads())<getMinThreads();
        
        if (low && !_isLow)
        {
            log.info("LOW ON THREADS (("+
                      getMaxThreads()+"-"+
                      getThreads()+"+"+
                      getIdleThreads()+")<"+
                      getMinThreads()+") on "+ this);
            _warned=System.currentTimeMillis();
            _isLow=true;
        }
        else if (!low && _isLow)
        {
            if (System.currentTimeMillis()-_warned > 1000)
            {
                _isOut=false;
                _isLow=false;
            }
        }
        return low;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#isOutOfResources()
     */
    public boolean isOutOfResources()
    {
        boolean out =
            getThreads()==getMaxThreads() &&
            getIdleThreads()==0;
        
        if (out && !_isOut)
        {
            log.warn("OUT OF THREADS: "+this);
            _warned=System.currentTimeMillis();
            _isLow=true;
            _isOut=true;
        }
        
        return out;
    }

    /* ------------------------------------------------------------------------------- */
    /** get_sslPort.
     * @return  Port to redirect integral and confidential requests to.
     */
    public int getSslPort()
    {
        return _sslPort;
    }

    /* ------------------------------------------------------------------------------- */
    /** set_sslPort.
     * @param p Port to redirect integral and confidential requests to.
     */
    public void setSslPort(int p)
    {
        _sslPort= p;
    }
    
    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#isIntegral(org.openqa.jetty.http.HttpConnection)
     */
    public boolean isIntegral(HttpConnection connection)
    {
        return false;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getIntegralScheme()
     */
    public String getIntegralScheme()
    {
        return HttpMessage.__SSL_SCHEME;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getIntegralPort()
     */
    public int getIntegralPort()
    {
        return _sslPort;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#isConfidential(org.openqa.jetty.http.HttpConnection)
     */
    public boolean isConfidential(HttpConnection connection)
    {
        return false;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getConfidentialScheme()
     */
    public String getConfidentialScheme()
    {
        return HttpMessage.__SSL_SCHEME;
    }

    /* ------------------------------------------------------------------------------- */
    /*
     * @see org.openqa.jetty.http.HttpListener#getConfidentialPort()
     */
    public int getConfidentialPort()
    {
        return _sslPort;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @param ls Seconds to linger or -1 to disable linger.
     */
    public void setLingerTimeSecs(int ls)
    {
        _lingerTimeSecs= ls;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return seconds.
     */
    public int getLingerTimeSecs()
    {
        return _lingerTimeSecs;
    }
    
    /* ------------------------------------------------------------ */
    public void setHttpHandler(HttpHandler handler)
    {
        _handler= handler;
    }
    
    /* ------------------------------------------------------------------------------- */
    /**
     * @see org.openqa.jetty.http.HttpListener#getHttpHandler()
     */
    public HttpHandler getHttpHandler()
    {
        return _handler;
    }


    /* ------------------------------------------------------------ */
    public void start() throws Exception
    {
        if (isStarted())
            throw new IllegalStateException("Started");

        // Create a new server socket and set to non blocking mode
        _acceptChannel= ServerSocketChannel.open();
        _acceptChannel.configureBlocking(false);

        // Bind the server socket to the local host and port
        _acceptChannel.socket().bind(_address);

        // Read the address back from the server socket to fix issues
        // with listeners on anonymous ports
        _address= (InetSocketAddress)_acceptChannel.socket().getLocalSocketAddress();

        // create a selector;
        _selector= Selector.open();

        // Register accepts on the server socket with the selector.
        _acceptChannel.register(_selector, SelectionKey.OP_ACCEPT);

        // Start selector thread
        _selectorThread= new SelectorThread();
        _selectorThread.start();

        // Start the thread Pool
        super.start();
        log.info("Started SocketChannelListener on " + getHost()+":"+getPort());
    }
    

    /* ------------------------------------------------------------ */
    public void stop() throws InterruptedException
    {
        if (_selectorThread != null)
            _selectorThread.doStop();
            
        super.stop();
        log.info("Stopped SocketChannelListener on " + getHost()+":"+getPort());
    }


    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class SelectorThread extends Thread  // Thread safety reviewed
    {
        boolean _running= false;

        /* ------------------------------------------------------------ */
        public void run()
        {
            try
            {
                _running= true;
                while (_running)
                {

                    SelectionKey key= null;
                    try
                    {
                        _selector.select();
                        Iterator iter= _selector.selectedKeys().iterator();

                        while (iter.hasNext())
                        {
                            key= (SelectionKey)iter.next();
                            if (key.isAcceptable())
                                doAccept(key);
                            if (key.isReadable())
                                doRead(key);
                            key= null;
                            iter.remove();
                        }
                    }
                    catch (Exception e)
                    {
                        if (_running)
                            log.warn("selector", e);
                        if (key != null)
                            key.cancel();
                    }
                }
            }
            finally
            {
                log.info("Stopping " + this.getName());

                try
                {
                    if (_acceptChannel != null)
                        _acceptChannel.close();
                }
                catch (IOException e)
                {
                    LogSupport.ignore(log, e);
                }
                try
                {
                    if (_selector != null)
                        _selector.close();
                }
                catch (IOException e)
                {
                    LogSupport.ignore(log, e);
                }

                _selector= null;
                _acceptChannel= null;
                _selectorThread= null;
            }
        }

        /* ------------------------------------------------------------ */
        void doAccept(SelectionKey key)
            throws IOException, InterruptedException
        {            
            if (isLowOnResources())
                return;
                
            ServerSocketChannel server = (ServerSocketChannel) key.channel();
            SocketChannel channel = server.accept();
            channel.configureBlocking(false);
            SelectionKey readKey = channel.register(_selector, SelectionKey.OP_READ);
            
            Socket socket=channel.socket();
            try
            {
                if (getMaxIdleTimeMs() >= 0)
                    socket.setSoTimeout(getMaxIdleTimeMs());
                if (_lingerTimeSecs >= 0)
                    socket.setSoLinger(true, _lingerTimeSecs);
                else
                    socket.setSoLinger(false, 0);
            }
            catch (Exception e)
            {
                LogSupport.ignore(log, e);
            }

            Connection connection=new Connection(channel,readKey, SocketChannelListener.this);
            readKey.attach(connection);
        }

        /* ------------------------------------------------------------ */
        void doRead(SelectionKey key) 
            throws IOException
        {
            Connection connection = (Connection)key.attachment();
            if (connection._idle && isOutOfResources())
                // Don't handle idle connections if out of resources.
                return;
            ByteBuffer buf= connection._in.getBuffer();
            int count = ((SocketChannel)key.channel()).read(buf);
            if (count<0)
            {
                connection.close();
            }
            else 
            {
                buf.flip();
                connection.write(buf);
            }
        }   

        void doStop()
        {
            _running=false;
            _selector.wakeup();
            Thread.yield();
        }
    }


    /* ------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------- */
    private static class Connection 
      extends HttpConnection
      implements Runnable
    {
        boolean _idle=true;
        SocketChannel _channel;
        SelectionKey _key;
        ByteBufferInputStream _in;
        SocketChannelOutputStream _out;
        SocketChannelListener _listener;
        
        Connection(SocketChannel channel,SelectionKey key, SocketChannelListener listener)
        {
            super(listener,
                         channel.socket().getInetAddress(),
                         new ByteBufferInputStream(listener.getBufferSize()),
                         new SocketChannelOutputStream(channel,listener.getBufferSize()),
                         channel);
            _channel=channel;
            _key=key;
            _listener=listener;
            _in=(ByteBufferInputStream) ((LineInput)(getInputStream().getInputStream())).getInputStream();
            _out=(SocketChannelOutputStream)(getOutputStream().getOutputStream());
            _in.setTimeout(listener.getMaxIdleTimeMs());
        }
        

        /* ------------------------------------------------------------------------------- */
        void write(ByteBuffer buf)
        {
            if (!_idle)
                _in.write(buf);
            else
            {
                boolean written=false;
                
                // Is there any actual content there?
                for (int i=buf.position();i<buf.limit();i++)
                {
                    byte b = buf.get(i);
                    
                    if (b>' ')
                    {
                        buf.position(i);
                    
                        try
                        {
                            written=true;
                            _in.write(buf);
                            _listener.run(this);
                            _idle=false;
                        }
                        catch(InterruptedException e)
                        {
                            LogSupport.ignore(log, e);
                        }
                        finally
                        {
                            i=buf.limit();
                        }
                    }
                }
                
                if (!written)
                {
                    _in.recycle(buf);
                }
            }
        }
        
        /* ------------------------------------------------------------------------------- */
        /**
         */
        public void run()
        {
            try
            {
                associateThread();
                while (_in!=null && _in.available()>0 && _listener.isStarted())
                {
                    if (handleNext())
                        recycle();
                    else
                        destroy();
                }
            }
            catch(IOException e)
            {
                log.warn(e.toString());
                log.debug(e);
                destroy();
            }
            finally
            {
                _idle=true;
                disassociateThread();
            }
        }

        /* ------------------------------------------------------------------------------- */
        public synchronized void close()
            throws IOException
         {
                 _out.close();
                 _in.close();
                 if (!_channel.isOpen())
                    return;
                 _key.cancel();
                 _channel.socket().shutdownOutput();
                 _channel.close();
                 _channel.socket().close();
                 super.close();
                 _channel.close();
         }
         
        /* ------------------------------------------------------------------------------- */
        public void destroy()
        {
            super.destroy();
            if (_in!=null)
                _in.destroy();
            _in=null;
            if (_out!=null)
                _out.destroy();
            _out=null;
            _channel=null;
            _key=null;
            _listener=null;
        }
        
    }
    
}
