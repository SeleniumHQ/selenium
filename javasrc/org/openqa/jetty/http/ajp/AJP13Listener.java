// ========================================================================
// $Id: AJP13Listener.java,v 1.20 2006/10/08 14:13:05 gregwilkins Exp $
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
import java.net.InetAddress;
import java.net.Socket;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpConnection;
import org.openqa.jetty.http.HttpHandler;
import org.openqa.jetty.http.HttpListener;
import org.openqa.jetty.http.HttpMessage;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpServer;
import org.openqa.jetty.util.InetAddrPort;
import org.openqa.jetty.util.ThreadedServer;

/* ------------------------------------------------------------ */
/**
 * AJP 1.3 Protocol Listener. This listener takes requests from the mod_jk or
 * mod_jk2 modules used by web servers such as apache and IIS to forward
 * requests to a servlet container.
 * <p>
 * This code uses the AJP13 code from tomcat3.3 as the protocol specification,
 * but is new implementation.
 * 
 * @version $Id: AJP13Listener.java,v 1.20 2006/10/08 14:13:05 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class AJP13Listener extends ThreadedServer implements HttpListener
{
    private static Log log=LogFactory.getLog(AJP13Listener.class);

    /* ------------------------------------------------------------------- */
    private HttpServer _server;
    private boolean _lastOut=false;
    private boolean _lastLow=false;
    private String _integralScheme=HttpMessage.__SSL_SCHEME;
    private String _confidentialScheme=HttpMessage.__SSL_SCHEME;
    private int _integralPort=0;
    private int _confidentialPort=0;
    private boolean _identifyListener=false;
    private int _bufferSize=8192;
    private int _bufferReserve=512;
    private String[] _remoteServers;
    private HttpHandler _handler;

    /* ------------------------------------------------------------------- */
    public AJP13Listener()
    {
    }

    /* ------------------------------------------------------------------- */
    public AJP13Listener(InetAddrPort address)
    {
        super(address);
    }

    /* ------------------------------------------------------------ */
    public void setHttpServer(HttpServer server)
    {
        _server=server;
    }

    /* ------------------------------------------------------------ */
    public HttpServer getHttpServer()
    {
        return _server;
    }

    /* ------------------------------------------------------------ */
    public int getBufferSize()
    {
        return _bufferSize;
    }

    /* ------------------------------------------------------------ */
    public void setBufferSize(int size)
    {
        _bufferSize=size;
        if (_bufferSize>8192)
            log.warn("AJP Data buffer > 8192: "+size);
    }

    /* ------------------------------------------------------------ */
    public int getBufferReserve()
    {
        return _bufferReserve;
    }

    /* ------------------------------------------------------------ */
    public void setBufferReserve(int size)
    {
        _bufferReserve=size;
    }

    /* ------------------------------------------------------------ */
    public boolean getIdentifyListener()
    {
        return _identifyListener;
    }

    /* ------------------------------------------------------------ */
    /**
     * @param identifyListener
     *            If true, the listener name is added to all requests as the
     *            org.openqa.jetty.http.HttListener attribute
     */
    public void setIdentifyListener(boolean identifyListener)
    {
        _identifyListener=identifyListener;
    }

    /* --------------------------------------------------------------- */
    public String getDefaultScheme()
    {
        return HttpMessage.__SCHEME;
    }

    /* --------------------------------------------------------------- */
    public void start() throws Exception
    {
        super.start();
        log.info("Started AJP13Listener on "+getInetAddrPort());
        log.info("NOTICE: AJP13 is not a secure protocol. Please protect the port "+getInetAddrPort());
    }

    /* --------------------------------------------------------------- */
    public void stop() throws InterruptedException
    {
        super.stop();
        log.info("Stopped AJP13Listener on "+getInetAddrPort());
    }

    /* ------------------------------------------------------------ */
    /**
     * @return Array of accepted remote server hostnames or IPs.
     */
    public String[] getRemoteServers()
    {
        return _remoteServers;
    }

    /* ------------------------------------------------------------ */
    /**
     * Set accepted remote servers. The AJP13 protocol is not secure and
     * contains no authentication. If remote servers are set, then this listener
     * will only accept connections from hosts with matching addresses or
     * hostnames.
     * 
     * @param servers
     *            Array of accepted remote server hostnames or IPs
     */
    public void setRemoteServers(String[] servers)
    {
        _remoteServers=servers;
    }

    /* ------------------------------------------------------------ */
    /**
     * Handle Job. Implementation of ThreadPool.handle(), calls
     * handleConnection.
     * 
     * @param socket
     *            A Connection.
     */
    public void handleConnection(Socket socket) throws IOException
    {
        // Check acceptable remote servers
        if (_remoteServers!=null&&_remoteServers.length>0)
        {
            boolean match=false;
            InetAddress inetAddress=socket.getInetAddress();
            String hostAddr=inetAddress.getHostAddress();
            String hostName=inetAddress.getHostName();
            for (int i=0; i<_remoteServers.length; i++)
            {
                if (hostName.equals(_remoteServers[i])||hostAddr.equals(_remoteServers[i]))
                {
                    match=true;
                    break;
                }
            }
            if (!match)
            {
                log.warn("AJP13 Connection from un-approved host: "+inetAddress);
                return;
            }
        }

        // Handle the connection
        socket.setTcpNoDelay(true);
        socket.setSoTimeout(getMaxIdleTimeMs());
        AJP13Connection connection=createConnection(socket);
        try
        {
            connection.handle();
        }
        finally
        {
            connection.destroy();
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * Create an AJP13Connection instance. This method can be used to override
     * the connection instance.
     * 
     * @param socket
     *            The underlying socket.
     */
    protected AJP13Connection createConnection(Socket socket) throws IOException
    {
        return new AJP13Connection(this,socket.getInputStream(),socket.getOutputStream(),socket,getBufferSize());
    }

    /* ------------------------------------------------------------ */
    /**
     * Customize the request from connection. This method extracts the socket
     * from the connection and calls the customizeRequest(Socket,HttpRequest)
     * method.
     * 
     * @param request
     */
    public void customizeRequest(HttpConnection connection, HttpRequest request)
    {
        if (_identifyListener)
            request.setAttribute(HttpListener.ATTRIBUTE,getName());

        Socket socket=(Socket)(connection.getConnection());
        customizeRequest(socket,request);
    }

    /* ------------------------------------------------------------ */
    /**
     * Customize request from socket. Derived versions of SocketListener may
     * specialize this method to customize the request with attributes of the
     * socket used (eg SSL session ids).
     * 
     * @param request
     */
    protected void customizeRequest(Socket socket, HttpRequest request)
    {
    }

    /* ------------------------------------------------------------ */
    /**
     * Persist the connection.
     * 
     * @param connection
     */
    public void persistConnection(HttpConnection connection)
    {
    }

    /* ------------------------------------------------------------ */
    /**
     * @return True if low on idle threads.
     */
    public boolean isLowOnResources()
    {
        boolean low=getThreads()==getMaxThreads()&&getIdleThreads()<getMinThreads();
        if (low&&!_lastLow)
            log.info("LOW ON THREADS: "+this);
        else if (!low&&_lastLow)
        {
            log.info("OK on threads: "+this);
            _lastOut=false;
        }
        _lastLow=low;
        return low;
    }

    /* ------------------------------------------------------------ */
    /**
     * @return True if out of resources.
     */
    public boolean isOutOfResources()
    {
        boolean out=getThreads()==getMaxThreads()&&getIdleThreads()==0;
        if (out&&!_lastOut)
            log.warn("OUT OF THREADS: "+this);

        _lastOut=out;
        return out;
    }

    /* ------------------------------------------------------------ */
    public boolean isIntegral(HttpConnection connection)
    {
        return ((AJP13Connection)connection).isSSL();
    }

    /* ------------------------------------------------------------ */
    public boolean isConfidential(HttpConnection connection)
    {
        return ((AJP13Connection)connection).isSSL();
    }

    /* ------------------------------------------------------------ */
    public String getIntegralScheme()
    {
        return _integralScheme;
    }

    /* ------------------------------------------------------------ */
    public void setIntegralScheme(String integralScheme)
    {
        _integralScheme=integralScheme;
    }

    /* ------------------------------------------------------------ */
    public int getIntegralPort()
    {
        return _integralPort;
    }

    /* ------------------------------------------------------------ */
    public void setIntegralPort(int integralPort)
    {
        _integralPort=integralPort;
    }

    /* ------------------------------------------------------------ */
    public String getConfidentialScheme()
    {
        return _confidentialScheme;
    }

    /* ------------------------------------------------------------ */
    public void setConfidentialScheme(String confidentialScheme)
    {
        _confidentialScheme=confidentialScheme;
    }

    /* ------------------------------------------------------------ */
    public int getConfidentialPort()
    {
        return _confidentialPort;
    }

    /* ------------------------------------------------------------ */
    public void setConfidentialPort(int confidentialPort)
    {
        _confidentialPort=confidentialPort;
    }

    /* ------------------------------------------------------------ */
    public HttpHandler getHttpHandler()
    {
        return _handler;
    }

    /* ------------------------------------------------------------ */
    public void setHttpHandler(HttpHandler handler)
    {
        _handler=handler;
    }
}
