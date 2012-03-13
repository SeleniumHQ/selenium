// ========================================================================
// $Id: AJP13Connection.java,v 1.38 2006/11/22 20:21:30 gregwilkins Exp $
// Copyright 200-2004 Mort Bay Consulting Pty. Ltd.
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

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.Socket;
import java.net.SocketException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpConnection;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpMessage;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.Version;
import org.openqa.jetty.util.LineInput;
import org.openqa.jetty.util.LogSupport;
import org.openqa.jetty.util.URI;

/* ------------------------------------------------------------ */
/**
 * @version $Id: AJP13Connection.java,v 1.38 2006/11/22 20:21:30 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class AJP13Connection extends HttpConnection
{
    private static Log log=LogFactory.getLog(AJP13Connection.class);

    private AJP13Listener _listener;
    private AJP13InputStream _ajpIn;
    private AJP13OutputStream _ajpOut;
    private String _remoteHost;
    private String _remoteAddr;
    private String _serverName;
    private int _serverPort;
    private boolean _isSSL;

    /* ------------------------------------------------------------ */
    public AJP13Connection(AJP13Listener listener, InputStream in, OutputStream out, Socket socket, int bufferSize) throws IOException
    {
        super(listener,null,new AJP13InputStream(in,out,bufferSize),out,socket);

        LineInput lin=(LineInput)getInputStream().getInputStream();
        _ajpIn=(AJP13InputStream)lin.getInputStream();
        _ajpOut=new AJP13OutputStream(getOutputStream().getOutputStream(),bufferSize);
        _ajpOut.setCommitObserver(this);
        getOutputStream().setBufferedOutputStream(_ajpOut);
        _listener=listener;
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the Remote address.
     * 
     * @return the remote address
     */
    public InetAddress getRemoteInetAddress()
    {
        return null;
    }

    /* ------------------------------------------------------------ */
    public void destroy()
    {
        if (_ajpIn!=null)
            _ajpIn.destroy();
        _ajpIn=null;
        if (_ajpOut!=null)
            _ajpOut.destroy();
        _ajpOut=null;
        _remoteHost=null;
        _remoteAddr=null;
        _serverName=null;
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the Remote address.
     * 
     * @return the remote host name
     */
    public String getRemoteAddr()
    {
        return _remoteAddr;
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the Remote address.
     * 
     * @return the remote host name
     */
    public String getRemoteHost()
    {
        return _remoteHost;
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the listeners HttpServer . Conveniance method equivalent to
     * getListener().getHost().
     * 
     * @return HttpServer.
     */
    public String getServerName()
    {
        return _serverName;
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the listeners Port . Conveniance method equivalent to
     * getListener().getPort().
     * 
     * @return HttpServer.
     */
    public int getServerPort()
    {
        return _serverPort;
    }

    /* ------------------------------------------------------------ */
    /**
     * Get the listeners Default scheme. Conveniance method equivalent to
     * getListener().getDefaultProtocol().
     * 
     * @return HttpServer.
     */
    public String getDefaultScheme()
    {
        return _isSSL?HttpMessage.__SSL_SCHEME:super.getDefaultScheme();
    }

    /* ------------------------------------------------------------ */
    public boolean isSSL()
    {
        return _isSSL;
    }

    /* ------------------------------------------------------------ */
    public boolean handleNext()
    {
        AJP13RequestPacket packet=null;
        HttpRequest request=getRequest();
        HttpResponse response=getResponse();
        HttpContext context=null;
        boolean gotRequest=false;
        _persistent=true;
        _keepAlive=true;

        try
        {
            try
            {
                packet=null;
                packet=_ajpIn.nextPacket();
                if (packet==null)
                    return false;
                if (packet.getDataSize()==0)
                    return true;
            }
            catch (IOException e)
            {
                LogSupport.ignore(log,e);
                return false;
            }

            int type=packet.getByte();
            if (log.isDebugEnabled())
                log.debug("AJP13 type="+type+" size="+packet.unconsumedData());

            switch (type)
            {
                case AJP13Packet.__FORWARD_REQUEST:
                    request.setTimeStamp(System.currentTimeMillis());

                    request.setState(HttpMessage.__MSG_EDITABLE);
                    request.setMethod(packet.getMethod());
                    request.setVersion(packet.getString());
		    String version=packet.getString();
		    try
		    {
			request.setVersion(version);
		    }
		    catch(Exception e)
		    {
			log.warn("Bad version"+version,e);
			log.warn(packet.toString());
		    }

                    String path=packet.getString();
                    int sc=path.lastIndexOf(";");
                    if (sc<0)
                        request.setPath(URI.encodePath(path));
                    else
                        request.setPath(URI.encodePath(path.substring(0,sc))+path.substring(sc));

                    _remoteAddr=packet.getString();
                    _remoteHost=packet.getString();
                    _serverName=packet.getString();
                    _serverPort=packet.getInt();
                    _isSSL=packet.getBoolean();

                    // Check keep alive
                    _keepAlive=request.getDotVersion()>=1;

                    // Headers
                    int h=packet.getInt();
                    for (int i=0; i<h; i++)
                    {
                        String hdr=packet.getHeader();
                        String val=packet.getString();
                        request.addField(hdr,val);
                        if (!_keepAlive&&hdr.equalsIgnoreCase(HttpFields.__Connection)&&val.equalsIgnoreCase(HttpFields.__KeepAlive))
                            _keepAlive=true;
                    }

                    // RestishHandler other attributes
                    byte attr=packet.getByte();
                    while ((0xFF&attr)!=0xFF)
                    {
                        String value=(attr==11)?null:packet.getString();
                        switch (attr)
                        {
                            case 11: // key size
                                request.setAttribute("javax.servlet.request.key_size",new Integer(packet.getInt()));
                                break;
                            case 10: // request attribute
                                request.setAttribute(value,packet.getString());
                                break;
                            case 9: // SSL session
                                request.setAttribute("javax.servlet.request.ssl_session",value);
                                break;
                            case 8: // SSL cipher
                                request.setAttribute("javax.servlet.request.cipher_suite",value);
                                break;
                            case 7: // SSL cert
                                // request.setAttribute("javax.servlet.request.X509Certificate",value);
                                CertificateFactory cf=CertificateFactory.getInstance("X.509");
                                InputStream certstream=new ByteArrayInputStream(value.getBytes());
                                X509Certificate cert=(X509Certificate)cf.generateCertificate(certstream);
                                X509Certificate certs[]=
                                { cert };
                                request.setAttribute("javax.servlet.request.X509Certificate",certs);
                                break;
                            case 6: // JVM Route
                                request.setAttribute("org.openqa.jetty.http.ajp.JVMRoute",value);
                                break;
                            case 5: // Query String
                                request.setQuery(value);
                                break;
                            case 4: // AuthType
                                request.setAuthType(value);
                                break;
                            case 3: // Remote User
                                request.setAuthUser(value);
                                break;

                            case 2: // servlet path not implemented
                            case 1: // _context not implemented
                            default:
                                log.warn("Unknown attr: "+attr+"="+value);
                        }

                        attr=packet.getByte();
                    }

                    _listener.customizeRequest(this,request);

                    gotRequest=true;
                    statsRequestStart();
                    request.setState(HttpMessage.__MSG_RECEIVED);

                    // Complete response
                    if (request.getContentLength()==0&&request.getField(HttpFields.__TransferEncoding)==null)
                        _ajpIn.close();

                    // Prepare response
                    response.setState(HttpMessage.__MSG_EDITABLE);
                    response.setVersion(HttpMessage.__HTTP_1_1);
                    response.setDateField(HttpFields.__Date,_request.getTimeStamp());
                    if (!Version.isParanoid())
                        response.setField(HttpFields.__Server,Version.getDetail());

                    // Service request
                    if (log.isDebugEnabled())
                        log.debug("REQUEST:\n"+request);
                    context=service(request,response);
                    if (log.isDebugEnabled())
                        log.debug("RESPONSE:\n"+response);

                    break;

                default:
                    if (log.isDebugEnabled())
                        log.debug("Ignored: "+packet);
                    _persistent=false;
            }

        }
        catch (SocketException e)
        {
            LogSupport.ignore(log,e);
            _persistent=false;
        }
        catch (Exception e)
        {
            log.warn(LogSupport.EXCEPTION,e);
            _persistent=false;
            try
            {
                if (gotRequest)
                    _ajpOut.close();
            }
            catch (IOException e2)
            {
                LogSupport.ignore(log,e2);
            }
        }
        finally
        {
            // abort if nothing received.
            if (packet==null||!gotRequest)
                return false;

            // flush and end the output
            try
            {
                // Consume unread input.
                // while(_ajpIn.skip(4096)>0 || _ajpIn.read()>=0);

                // end response
                getOutputStream().close();
                if (!_persistent)
                    _ajpOut.end();

                // Close the outout
                _ajpOut.close();

                // reset streams
                getOutputStream().resetStream();
                getOutputStream().addObserver(this);
                getInputStream().resetStream();
                _ajpIn.resetStream();
                _ajpOut.resetStream();
            }
            catch (Exception e)
            {
                log.debug(LogSupport.EXCEPTION,e);
                _persistent=false;
            }
            finally
            {
                statsRequestEnd();
                if (context!=null)
                    context.log(request,response,-1);
            }
        }
        return _persistent;
    }

    /* ------------------------------------------------------------ */
    protected void firstWrite() throws IOException
    {
        log.debug("ajp13 firstWrite()");
    }

    /* ------------------------------------------------------------ */
    protected void commit() throws IOException
    {
        log.debug("ajp13 commit()");
        if (_response.isCommitted())
            return;
        _request.setHandled(true);
        getOutputStream().writeHeader(_response);
    }

    /* ------------------------------------------------------------ */
    protected void setupOutputStream() throws IOException
    {
        // Nobble the OutputStream for HEAD requests
        if (HttpRequest.__HEAD.equals(getRequest().getMethod()))
            getOutputStream().nullOutput();
    }
}
