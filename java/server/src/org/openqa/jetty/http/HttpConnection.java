// ========================================================================
// $Id: HttpConnection.java,v 1.94 2006/02/28 12:45:01 gregwilkins Exp $
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
import java.net.InetAddress;
import java.net.Socket;
import java.util.Enumeration;
import java.util.List;

import javax.net.ssl.SSLSocket;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.InetAddrPort;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.OutputObserver;
import org.openqa.jetty.util.StringUtil;


/* ------------------------------------------------------------ */
/** A HTTP Connection.
 * This class provides the generic HTTP handling for
 * a connection to a HTTP server. An instance of HttpConnection
 * is normally created by a HttpListener and then given control
 * in order to run the protocol handling before and after passing
 * a request to the HttpServer of the HttpListener.
 *
 * This class is not synchronized as it should only ever be known
 * to a single thread.
 *
 * @see HttpListener
 * @see HttpServer
 * @version $Id: HttpConnection.java,v 1.94 2006/02/28 12:45:01 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class HttpConnection
    implements OutputObserver
{
    private static Log log = LogFactory.getLog(HttpConnection.class);

    /* ------------------------------------------------------------ */
    private static ThreadLocal __threadConnection=new ThreadLocal();

    /** Support for FRC2068 Continues.
     * If true, then 100 Continues will be sent when expected or for POST requests. If false, 100 Continues will
     * only be sent if expected. Can be configured with the org.openqa.jetty.http.HttpConnection.2068Continue system
     * property.
     */
    private static boolean __2068_Continues=Boolean.getBoolean("org.openqa.jetty.http.HttpConnection.2068Continue");
    
    /* ------------------------------------------------------------ */
    protected HttpRequest _request;
    protected HttpResponse _response;
    protected boolean _persistent;
    protected boolean _keepAlive;
    protected int _dotVersion;

    private HttpListener _listener;
    private HttpInputStream _inputStream;
    private HttpOutputStream _outputStream;
    private boolean _close;
    private boolean _firstWrite;
    private boolean _completing;
    private Thread _handlingThread;
    
    private InetAddress _remoteInetAddress;
    private String _remoteAddr;
    private String _remoteHost;
    private HttpServer _httpServer;
    private Object _connection;
    private boolean _throttled ;
    
    private boolean _statsOn;
    private long _tmpTime;
    private long _openTime;
    private long _reqTime;
    private int _requests;
    private Object _object;
    private HttpTunnel _tunnel ;
    private boolean _resolveRemoteHost;
    
    /* ------------------------------------------------------------ */
    /** Constructor.
     * @param listener The listener that created this connection.
     * @param remoteAddr The address of the remote end or null.
     * @param in InputStream to read request(s) from.
     * @param out OutputputStream to write response(s) to.
     * @param connection The underlying connection object, most likely
     * a socket. This is not used by HttpConnection other than to make
     * it available via getConnection().
     */
    public HttpConnection(HttpListener listener,
                          InetAddress remoteAddr,
                          InputStream in,
                          OutputStream out,
                          Object connection)
    {
        if(log.isDebugEnabled())log.debug("new HttpConnection: "+connection);
        _listener=listener;
        _remoteInetAddress=remoteAddr;
        int bufferSize=listener==null?4096:listener.getBufferSize();
        int reserveSize=listener==null?512:listener.getBufferReserve();
        _inputStream=new HttpInputStream(in,bufferSize);
        _outputStream=new HttpOutputStream(out,bufferSize,reserveSize);
        _outputStream.addObserver(this);
        _firstWrite=false;
        if (_listener!=null)
            _httpServer=_listener.getHttpServer();
        _connection=connection;
        
        _statsOn=_httpServer!=null && _httpServer.getStatsOn();
        if (_statsOn)
        {
            _openTime=System.currentTimeMillis();
            _httpServer.statsOpenConnection();
        }
        _reqTime=0;
        _requests=0;
        
        _request = new HttpRequest(this); 
        _response = new HttpResponse(this);

        _resolveRemoteHost=_listener!=null && _listener.getHttpServer()!=null && _listener.getHttpServer().getResolveRemoteHost();
    }

    /* ------------------------------------------------------------ */
    /** Get the ThreadLocal HttpConnection.
     * The ThreadLocal HttpConnection is set by the handle() method.
     * @return HttpConnection for this thread.
     */
    static HttpConnection getHttpConnection()
    {
        return (HttpConnection)__threadConnection.get();
    }
    
    /* ------------------------------------------------------------ */
    /** Get the Remote address.
     * @return the remote address
     */
    public InetAddress getRemoteInetAddress()
    {
        return _remoteInetAddress;
    }

    /* ------------------------------------------------------------ */
    /** Get the Remote address.
     * @return the remote host name
     */
    public String getRemoteAddr()
    {
        if (_remoteAddr==null)
        {
            if (_remoteInetAddress==null)
                return "127.0.0.1";
            _remoteAddr=_remoteInetAddress.getHostAddress();
        }
        return _remoteAddr;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the Remote address.
     * @return the remote host name
     */
    public String getRemoteHost()
    {
        if (_remoteHost==null)
        {
            if (_resolveRemoteHost)
            {
                if (_remoteInetAddress==null)
                    return "localhost";
                _remoteHost=_remoteInetAddress.getHostName();
            }
            else
            {
                if (_remoteInetAddress==null)
                    return "127.0.0.1";
                _remoteHost=getRemoteAddr();
            }
        }
        return _remoteHost;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the connections InputStream.
     * @return the connections InputStream
     */
    public HttpInputStream getInputStream()
    {
        return _inputStream;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the connections OutputStream.
     * @return the connections OutputStream
     */
    public HttpOutputStream getOutputStream()
    {
        return _outputStream;
    }

    /* ------------------------------------------------------------ */
    /** Get the underlying connection object.
     * This opaque object, most likely a socket. This is not used by
     * HttpConnection other than to make it available via getConnection().
     * @return Connection abject
     */
    public Object getConnection()
    {
        return _connection;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the request.
     * @return the request
     */
    public HttpRequest getRequest()
    {
        return _request;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the response.
     * @return the response
     */
    public HttpResponse getResponse()
    {
        return _response;
    }

    /* ------------------------------------------------------------ */
    /** Force the connection to not be persistent.
     */
    public void forceClose()
    {
        _persistent=false;
        _close=true;
    }
    
    /* ------------------------------------------------------------ */
    /** Close the connection.
     * This method calls close on the input and output streams and
     * interrupts any thread in the handle method.
     * may be specialized to close sockets etc.
     * @exception IOException 
     */
    public void close()
        throws IOException
    {
        try{
            _completing=true;
            if (_connection instanceof Socket && !(_connection instanceof SSLSocket))
                ((Socket)_connection).shutdownOutput();
            _outputStream.close();
            _inputStream.close();
        }
        finally
        {
            if (_handlingThread!=null && Thread.currentThread()!=_handlingThread)
                _handlingThread.interrupt();
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Get the connections listener. 
     * @return HttpListener that created this Connection.
     */
    public HttpListener getListener()
    {
        return _listener;
    }

    /* ------------------------------------------------------------ */
    /** Get the listeners HttpServer .
     * Conveniance method equivalent to getListener().getHttpServer().
     * @return HttpServer.
     */
    public HttpServer getHttpServer()
    {
        return _httpServer;
    }

    /* ------------------------------------------------------------ */
    /** Get the listeners Default scheme. 
     * Conveniance method equivalent to getListener().getDefaultProtocol().
     * @return HttpServer.
     */
    public String getDefaultScheme()
    {
        return _listener.getDefaultScheme();
    }
    
    /* ------------------------------------------------------------ */
    /** Get the listeners HttpServer.
     * But if the name is 0.0.0.0, then the real interface address is used.
     * @return HttpServer.
     */
    public String getServerName()
    {
        String host=_listener.getHost();
        if (InetAddrPort.__0_0_0_0.equals(host) &&
            _connection instanceof Socket)
            host = ((Socket)_connection).getLocalAddress().getHostName();
        
        return host;
    }
    
    /* ------------------------------------------------------------ */
    /** Get the listeners HttpServer.
     * @return HttpServer.
     */
    public String getServerAddr()
    {
        if (_connection instanceof Socket)
            return ((Socket)_connection).getLocalAddress().getHostAddress();
        return _listener.getHost();
    }
    
    /* ------------------------------------------------------------ */
    /** Get the listeners Port .
     * Conveniance method equivalent to getListener().getPort().
     * @return local port.
     */
    public int getServerPort()
    {
        return _listener.getPort();
    }
    
    /* ------------------------------------------------------------ */
    /** Get the remote Port .
     * @return remote port.
     */
    public int getRemotePort()
    {
        if (_connection instanceof Socket)
            return ((Socket)_connection).getPort();
        return 0;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return True if this connections state has been altered due
     * to low resources. 
     */
    public boolean isThrottled()
    {
        return _throttled;
    }
    
     /* ------------------------------------------------------------ */
    /** 
     * @param throttled True if this connections state has been altered due
     * to low resources. 
     */
    public void setThrottled(boolean throttled)
    {
        _throttled = throttled;
    }
    
    /* ------------------------------------------------------------ */
    /** Get associated object.
     * Used by a particular HttpListener implementation to associate
     * private datastructures with the connection.
     * @return An object associated with the connecton by setObject.
     */
    public Object getObject()
    {
        return _object;
    }
    
    /* ------------------------------------------------------------ */
    /** Set associated object.
     * Used by a particular HttpListener implementation to associate
     * private datastructures with the connection.
     * @param o An object associated with the connecton.
     */
    public void setObject(Object o)
    {
        _object=o;
    }

    /* ------------------------------------------------------------ */
    /** 
     * @return The HttpTunnel set for the connection or null.
     */
    public HttpTunnel getHttpTunnel()
    {
        return _tunnel;
    }
    
    /* ------------------------------------------------------------ */
    /** Set a HttpTunnel for the connection.
     * A HTTP tunnel is used if the connection is to be taken over for
     * non-HTTP communications. An example of this is the CONNECT method
     * in proxy handling.  If a HttpTunnel is set on a connection, then it's
     * handle method is called bu the next call to handleNext().
     * @param tunnel The HttpTunnel set for the connection or null.
     */
    public void setHttpTunnel(HttpTunnel tunnel)
    {
        _tunnel = tunnel;
    }
    
    /* ------------------------------------------------------------ */
    /* Verify HTTP/1.0 request
     * @exception HttpException problem with the request. 
     * @exception IOException problem with the connection.
     */
    private void verifyHTTP_1_0()
    {
        // Set content length
        int content_length=
            _request.getIntField(HttpFields.__ContentLength);
        if (content_length>=0)
            _inputStream.setContentLength(content_length);
        else if (content_length<0)
        {
            // TODO - can't do this check because IE does this after
            // a redirect.
            // Can't have content without a content length
            // String content_type=_request.getField(HttpFields.__ContentType);
            // if (content_type!=null && content_type.length()>0)
            //     throw new HttpException(_HttpResponse.__411_Length_Required);
            _inputStream.setContentLength(0);
        }

        // Check netscape proxy connection - this is not strictly correct.
        if (!_keepAlive && HttpFields.__KeepAlive.equalsIgnoreCase(_request.getField(HttpFields.__ProxyConnection)))
            _keepAlive=true;

        // persistent connections in HTTP/1.0 only if requested.
        _persistent=_keepAlive;
    }
    
    /* ------------------------------------------------------------ */
    /* Verify HTTP/1.1 request
     * @exception HttpException problem with the request. 
     * @exception IOException problem with the connection.
     */
    private void verifyHTTP_1_1()
        throws HttpException, IOException
    {        
        // Check Host Field exists
        String host=_request.getField(HttpFields.__Host);
        if (host==null)
            throw new HttpException(HttpResponse.__400_Bad_Request);
        
        // check and enable requests transfer encodings.
        String transfer_coding=
            _request.getField(HttpFields.__TransferEncoding);

        if (transfer_coding!=null && transfer_coding.length()>0)
        {
            // Handling of codings other than chunking is now
            // the responsibility of handlers, filters or servlets.
            // Thanks to the compression filter, we now don't know if
            // what we can handle here.
            if (transfer_coding.equalsIgnoreCase(HttpFields.__Chunked) ||
                StringUtil.endsWithIgnoreCase(transfer_coding,HttpFields.__Chunked))
                _inputStream.setChunking();
            else if (StringUtil.asciiToLowerCase(transfer_coding)
                     .indexOf(HttpFields.__Chunked)>=0)
                throw new HttpException(HttpResponse.__400_Bad_Request);
        }
        
        // Check input content length can be determined
        int content_length=_request.getIntField(HttpFields.__ContentLength);
        String content_type=_request.getField(HttpFields.__ContentType);
        if (!_inputStream.isChunking())
        {
            // If we have a content length, use it
            if (content_length>=0)
                _inputStream.setContentLength(content_length);
            // else if we have no content
            else if (content_type==null || content_type.length()==0)
                _inputStream.setContentLength(0);
            // else we need a content length
            else
            {
                // TODO - can't do this check as IE stuff up on
                // a redirect.
                // throw new HttpException(HttpResponse.__411_Length_Required);
                _inputStream.setContentLength(0);
            }
        }

        // Handle Continue Expectations
        String expect=_request.getField(HttpFields.__Expect);
        if (expect!=null && expect.length()>0)
        {
            if (StringUtil.asciiToLowerCase(expect).equals(HttpFields.__ExpectContinue))
            {
                _inputStream.setExpectContinues(_outputStream.getOutputStream());
            }
            else
                throw new HttpException(HttpResponse.__417_Expectation_Failed);
        }
        else if (__2068_Continues &&
                 _inputStream.available()<=0 &&
                 (HttpRequest.__PUT.equals(_request.getMethod()) ||
                  HttpRequest.__POST.equals(_request.getMethod())))
        {
            // Send continue for RFC 2068 exception
            OutputStream real_out=_outputStream.getOutputStream();
            real_out.write(HttpResponse.__Continue);
            real_out.flush();
        }            
             
        // Persistent unless requested otherwise
        _persistent=!_close;
    }

    /* ------------------------------------------------------------ */
    /** Output Notifications.
     * Trigger header and/or filters from output stream observations.
     * Also finalizes method of indicating response content length.
     * Called as a result of the connection subscribing for notifications
     * to the HttpOutputStream.
     * @see HttpOutputStream
     * @param out The output stream observed.
     * @param action The action.
     */
    public void outputNotify(OutputStream out, int action, Object ignoredData)
        throws IOException
    {
        if (_response==null)
            return;

        switch(action)
        {
          case OutputObserver.__FIRST_WRITE:
              if (!_firstWrite)
              {
                  firstWrite();
                  _firstWrite=true;
              }
              break;
              
          case OutputObserver.__RESET_BUFFER:
              resetBuffer();
              break;
              
          case OutputObserver.__COMMITING:
              commit();
              break;
              
          case OutputObserver.__CLOSING:
              
              if (_response!=null)
              {
                  completing();
                  if (!_response.isCommitted() &&
                  _request.getState()==HttpMessage.__MSG_RECEIVED)
                  commit();
              }
              break;
              
          case OutputObserver.__CLOSED:
              break;
        }
    }

    /* ------------------------------------------------------------ */
    /** Setup the reponse output stream.
     * Use the current state of the request and response, to set tranfer
     * parameters such as chunking and content length.
     */
    protected void firstWrite()
        throws IOException
    {
        if (_response.isCommitted())
            return;
        
        // Nobble the OutputStream for HEAD requests
        if (HttpRequest.__HEAD.equals(_request.getMethod()))
            _outputStream.nullOutput();    
            
        int length=_response.getIntField(HttpFields.__ContentLength);
        if (length>=0)
            _outputStream.setContentLength(length);
    }

    /**
     * Reset headers after response reset
     */
    private void resetBuffer()
    {
    }

    /* ------------------------------------------------------------ */
    /* Signal that the next commit/flush is the last */
    void completing()
    {
        _completing=true;
    }
    
    /* ------------------------------------------------------------ */
    protected void commit()
        throws IOException
    {        
        if (_response.isCommitted())
            return;

        int status=_response.getStatus();
        int length=-1;
        
        // Check if there is missing content expectations
        if (_inputStream.getExpectContinues()!=null)
        {
            // No input read yet - so assume it never will be
            _inputStream.setExpectContinues(null);
            _inputStream.unsafeSetContentLength(0);
        }
        
        // RestishHandler forced close, listener stopped or no idle threads left.
        boolean has_close=HttpFields.__Close.equals(_response.getField(HttpFields.__Connection));
        if (!_persistent || _close || _listener!=null && (!_listener.isStarted()||_listener.isOutOfResources()))
        {
            _close=true;
            if (!has_close)
                _response.setField(HttpFields.__Connection,HttpFields.__Close);
            has_close=true;
        }
        if (_close)
            _persistent=false;
        
        // Determine how to limit content length
        if (_persistent)
        {
            switch(_dotVersion)
            {
                case 1:
                {
                    String transfer_coding=_response.getField(HttpFields.__TransferEncoding);
                    if (transfer_coding==null || transfer_coding.length()==0 || HttpFields.__Identity.equalsIgnoreCase(transfer_coding))
                    {
                        // if (can have content and no content length)
                        if (status!=HttpResponse.__304_Not_Modified &&
                            status!=HttpResponse.__204_No_Content &&
                            _response.getField(HttpFields.__ContentLength)==null)
                        {
                            if (_completing)
                            {
                                length=_outputStream.getBytesWritten();
                                _response.setContentLength(length);
                            }
                            else
                            {   
                                // Chunk it!
                                _response.setField(HttpFields.__TransferEncoding,HttpFields.__Chunked);
                                _outputStream.setChunking();
                            }
                        }
                    }
                    else
                    {
                        // Use transfer encodings to determine length
                        _response.removeField(HttpFields.__ContentLength);
                        _outputStream.setChunking();

                        if (!HttpFields.__Chunked.equalsIgnoreCase(transfer_coding))
                        {
                            // Check against any TE field
                            List te = _request.getAcceptableTransferCodings();
                            Enumeration enm =
                                _response.getFieldValues(HttpFields.__TransferEncoding,
                                                         HttpFields.__separators);
                            while (enm.hasMoreElements())
                            {
                                String coding=(String)enm.nextElement();
                                if (HttpFields.__Identity.equalsIgnoreCase(coding) ||
                                    HttpFields.__Chunked.equalsIgnoreCase(coding))
                                    continue;
                                if (te==null || !te.contains(coding))
                                    throw new HttpException(HttpResponse.__501_Not_Implemented,coding);
                            }
                        }
                    }
                }
                break;
                
                case 0:
                {
                    // if (can have content and no content length)
                    _response.removeField(HttpFields.__TransferEncoding);
                    if (_keepAlive)
                    {
                        if (status!=HttpResponse.__304_Not_Modified &&
                            status!=HttpResponse.__204_No_Content &&
                            _response.getField(HttpFields.__ContentLength)==null)
                        {
                            if (_completing)
                            {
                                length=_outputStream.getBytesWritten();
                                _response.setContentLength(length);
                                _response.setField(HttpFields.__Connection,HttpFields.__KeepAlive);
                            }
                            else
                            {
                                _response.setField(HttpFields.__Connection,HttpFields.__Close);
                                has_close=_close=true;
                                _persistent=false;
                            }
                        }
                        else
                            _response.setField(HttpFields.__Connection,HttpFields.__KeepAlive);
                    }
                    else if (!has_close)
                        _response.setField(HttpFields.__Connection,HttpFields.__Close);
                        
                        
                    break;
                }
                default:
                {
                    _close=true;
                    _persistent=false;
                    _keepAlive=false;
                }
            }
        }
        
        
        // Mark request as handled.
        _request.setHandled(true);
        
        _outputStream.writeHeader(_response);
        _outputStream.flush();
        
    }

    
    /* ------------------------------------------------------------ */
    /* Exception reporting policy method.
     * @param e the Throwable to report.
     */
    private void exception(Throwable e)
    {
        try
        {
            _persistent=false;
            int error_code=HttpResponse.__500_Internal_Server_Error;
            
            if (e instanceof HttpException)
            {
                error_code=((HttpException)e).getCode();
                
                if (_request==null)
                    log.warn(e.toString());
                else
                    log.warn(_request.getRequestLine()+" "+e.toString());
                log.debug(LogSupport.EXCEPTION,e);
            }
            else if (e instanceof EOFException)
            {
                LogSupport.ignore(log,e);
                return;
            }
            else
            {
                _request.setAttribute("javax.servlet.error.exception_type",e.getClass());
                _request.setAttribute("javax.servlet.error.exception",e);
                
                if (_request==null)
                    log.warn(LogSupport.EXCEPTION,e);
                else
                    log.warn(_request.getRequestLine(),e);
            }
            
            if (_response != null && !_response.isCommitted())
            {
                _response.reset();
                _response.removeField(HttpFields.__TransferEncoding);
                _response.setField(HttpFields.__Connection,HttpFields.__Close);
                _response.sendError(error_code);
            }
        }
        catch(Exception ex)
        {
            LogSupport.ignore(log,ex);
        }
    }

    
    /* ------------------------------------------------------------ */
    /** Service a Request.
     * This implementation passes the request and response to the
     * service method of the HttpServer for this connections listener.
     * If no HttpServer has been associated, the 503 is returned.
     * This method may be specialized to implement other ways of
     * servicing a request.
     * @param request The request
     * @param response The response
     * @return The HttpContext that completed handling of the request or null.
     * @exception HttpException 
     * @exception IOException 
     */
    protected HttpContext service(HttpRequest request, HttpResponse response)
        throws HttpException, IOException
    {
        if (_httpServer==null)
                throw new HttpException(HttpResponse.__503_Service_Unavailable);
        return _httpServer.service(request,response);
    }
    
    /* ------------------------------------------------------------ */
    /** Handle the connection.
     * Once the connection has been created, this method is called
     * to handle one or more requests that may be received on the
     * connection.  The method only returns once all requests have been
     * handled, an error has been returned to the requestor or the
     * connection has been closed.
     * The handleNext() is called in a loop until it returns false.
     */
    public final void handle()
    {
        try
        {
            associateThread();
            while(_listener.isStarted() && handleNext())
                recycle();
        }
        finally
        {
            disassociateThread();
            destroy();
        }
    }
    
    /* ------------------------------------------------------------ */
    protected void associateThread()
    {
        __threadConnection.set(this);
        _handlingThread=Thread.currentThread();
    }
    
    /* ------------------------------------------------------------ */
    protected void disassociateThread()
    {
        _handlingThread=null;
        __threadConnection.set(null);
    }

    
    /* ------------------------------------------------------------ */
    protected void readRequest()
        throws IOException
    {
        _request.readHeader((LineInput)(_inputStream)
                            .getInputStream());
    }
    
    /* ------------------------------------------------------------ */
    /** Handle next request off the connection.
     * The service(request,response) method is called by handle to
     * service each request received on the connection.
     * If the thread is a PoolThread, the thread is set as inactive
     * when waiting for a request. 
     * <P>
     * If a HttpTunnel has been set on this connection, it's handle method is
     * called and when that completes, false is return from this method.
     * <P>
     * The Connection is set as a ThreadLocal of the calling thread and is
     * available via the getHttpConnection() method.
     * @return true if the connection is still open and may provide
     * more requests.
     */
    public boolean handleNext()
    {
        // Handle a HTTP tunnel
        if (_tunnel!=null)
        {
            if(log.isDebugEnabled())log.debug("Tunnel: "+_tunnel);
            _outputStream.resetObservers();
            _tunnel.handle(_inputStream.getInputStream(),
                           _outputStream.getOutputStream());
            return false;
        }

        // Normal handling.
        HttpContext context=null;
        boolean stats=false;
        try
        {   
            // Assume the connection is not persistent,
            // unless told otherwise.
            _persistent=false;
            _close=false;
            _keepAlive=false;
            _firstWrite=false;
            _completing=false;
            _dotVersion=0;

            // Read requests
            readRequest();
            if (_listener==null || !_listener.isStarted())
            {
                // dead connection
                _response.destroy();
                _response=null;
                _persistent=false;
                return false;
            }
            
            _listener.customizeRequest(this,_request);
            if (_request.getState()!=HttpMessage.__MSG_RECEIVED)
                throw new HttpException(HttpResponse.__400_Bad_Request);
            
            // We have a valid request!
            statsRequestStart();
            stats=true;
            
            // Pick response version, we assume that _request.getVersion() == 1
            _dotVersion=_request.getDotVersion();
            
            if (_dotVersion>1)
            {
                _dotVersion=1;
            }
            
            // Common fields on the response
            _response.setVersion(HttpMessage.__HTTP_1_1);
            _response.setField(HttpFields.__Date,_request.getTimeStampStr());
            if (!Version.isParanoid())
                _response.setField(HttpFields.__Server,Version.getDetail());
            
            // Handle Connection header field
            Enumeration connectionValues =
                _request.getFieldValues(HttpFields.__Connection,
                                        HttpFields.__separators);
            if (connectionValues!=null)
            {
                while (connectionValues.hasMoreElements())
                {
                    String token=connectionValues.nextElement().toString();
                    // handle close token
                    if (token.equalsIgnoreCase(HttpFields.__Close))
                    {
                        _close=true;
                        _response.setField(HttpFields.__Connection,
                                           HttpFields.__Close);
                    }
                    else if (token.equalsIgnoreCase(HttpFields.__KeepAlive) &&
                             _dotVersion==0)
                        _keepAlive=true;
                    
                    // Remove headers for HTTP/1.0 requests
                    if (_dotVersion==0)
                        _request.forceRemoveField(token);
                }
            }
            
            // Handle version specifics
            if (_dotVersion==1)
                verifyHTTP_1_1();
            else if (_dotVersion==0)
                verifyHTTP_1_0();
            else if (_dotVersion!=-1)
                throw new HttpException(HttpResponse.__505_HTTP_Version_Not_Supported);

            if(log.isDebugEnabled())log.debug("REQUEST from "+_listener+":\n"+_request);

            // handle HttpListener handlers
            if (!_request.isHandled() && _listener.getHttpHandler()!=null)
                _listener.getHttpHandler().handle("",null, _request, _response);
            
            // service the request
            if (!_request.isHandled())
                context=service(_request,_response);
        }
        catch(HttpException e) {exception(e);}
        catch (IOException e)
        {
            if (_request.getState()!=HttpMessage.__MSG_RECEIVED)
            {
                if (log.isDebugEnabled())
                {
                    if (log.isTraceEnabled()) log.trace(LogSupport.EXCEPTION,e);
                    else if(log.isDebugEnabled())log.debug(e.toString());
                }
                _response.destroy();
                _response=null;
            }
            else
                exception(e);
        }
        catch (Exception e)     {exception(e);}
        catch (Error e)         {exception(e);}
        finally
        {
            int bytes_written=0;
            int content_length = _response==null
                ?-1:_response.getIntField(HttpFields.__ContentLength);
                
            // Complete the request
            if (_persistent)
            {         
                boolean no_continue_sent=false;
                try{
                    if (_inputStream.getExpectContinues()!=null)
                    {
                        _inputStream.setExpectContinues(null);
                        no_continue_sent=true;
                    }
                    else 
                    {
                        int remaining = _inputStream.getContentLength();
                        if (remaining!=0)
                            // Read remaining input
                            while(_inputStream.skip(4096)>0 || _inputStream.read()>=0);
                    }
                }
                catch(IOException e)
                {
                    if (_inputStream.getContentLength()>0)
                        _inputStream.setContentLength(0);
                    _persistent=false;
                    LogSupport.ignore(log,e);
                    exception(new HttpException(HttpResponse.__400_Bad_Request,
                                                "Missing Content"));
                }
                    
                // Check for no more content
                if (!no_continue_sent && _inputStream.getContentLength()>0)
                {
                    _inputStream.setContentLength(0);
                    _persistent=false;
                    exception (new HttpException(HttpResponse.__400_Bad_Request,"Missing Content"));
                }
                
                // Commit the response
                try{
                    _outputStream.close();
                    bytes_written=_outputStream.getBytesWritten();
                    _outputStream.resetStream();
                    _outputStream.addObserver(this);
                    _inputStream.resetStream();
                }
                catch(IOException e) {exception(e);}
            }
            else if (_response!=null) // There was a request
            {
                // half hearted attempt to eat any remaining input
                try{
                    if (_inputStream.getContentLength()>0)
                        while(_inputStream.skip(4096)>0 || _inputStream.read()>=0);
                    _inputStream.resetStream();
                }
                catch(IOException e){LogSupport.ignore(log,e);}
                
                // commit non persistent
                try{
                    _outputStream.flush();
                    _response.commit();
                    bytes_written=_outputStream.getBytesWritten();
                    _outputStream.close();
                    _outputStream.resetStream();
                }
                catch(IOException e) {exception(e);}
            }
            
            // Check response length
            if (_response!=null)
            {
                if(log.isDebugEnabled())log.debug("RESPONSE:\n"+_response);
                if (_persistent && content_length>=0 && bytes_written>0 && content_length!=bytes_written)
                {
                    log.warn("Invalid length: Content-Length="+content_length+
                             " written="+bytes_written+
                             " for "+_request.getRequestURL());
                    _persistent=false;
                    try{_outputStream.close();}
                    catch(IOException e) {log.warn(LogSupport.EXCEPTION,e);}
                }    
            }
            
            // stats & logging
            if (stats)
                statsRequestEnd();       
            if (context!=null)
                context.log(_request,_response,bytes_written);
        }
        
        return (_tunnel!=null) || _persistent;
    }

    /* ------------------------------------------------------------ */
    protected void statsRequestStart()
    {
        if (_statsOn)
        {
            if (_reqTime>0)
                statsRequestEnd();
            _requests++;
            _tmpTime=_request.getTimeStamp();
            _reqTime=_tmpTime;
            _httpServer.statsGotRequest();
        }
    }

    /* ------------------------------------------------------------ */
    protected void statsRequestEnd()
    {
        if (_statsOn && _reqTime>0)
        {
            _httpServer.statsEndRequest(System.currentTimeMillis()-_reqTime,
                                        (_response!=null));
            _reqTime=0;
        }
    }
    
    /* ------------------------------------------------------------ */
    /** Recycle the connection.
     * called by handle when handleNext returns true.
     */
    protected void recycle()
    {
        _listener.persistConnection(this);
        if (_request!=null)
            _request.recycle(this);
        if (_response!=null)
            _response.recycle(this);
    }
    
    /* ------------------------------------------------------------ */
    /** Destroy the connection.
     * called by handle when handleNext returns false.
     */
    protected void destroy()
    {
        try{close();}
        catch (IOException e){LogSupport.ignore(log,e);}
        catch (Exception e){log.warn(LogSupport.EXCEPTION,e);}
        
        // Destroy request and response
        if (_request!=null)
            _request.destroy();
        if (_response!=null)
            _response.destroy();
        if (_inputStream!=null)
            _inputStream.destroy();
        if (_outputStream!=null)
            _outputStream.destroy();
        _inputStream=null;
        _outputStream=null;
        _request=null;
        _response=null;
        _handlingThread=null;
        
        if (_statsOn)
        {
            _tmpTime=System.currentTimeMillis();
            if (_reqTime>0)
                _httpServer.statsEndRequest(_tmpTime-_reqTime,false);
            _httpServer.statsCloseConnection(_tmpTime-_openTime,_requests);
        }
    }

}
