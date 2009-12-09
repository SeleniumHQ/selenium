// ========================================================================
// $Id: HttpListener.java,v 1.17 2005/03/15 10:03:40 gregwilkins Exp $
// Copyright 1999-2004 Mort Bay Consulting Pty. Ltd.
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
import java.io.Serializable;
import java.net.UnknownHostException;

import org.openqa.jetty.util.LifeCycle;


/* ------------------------------------------------------------ */
/** HTTP Listener.
 * This interface describes the methods of a generic request listener for the HttpServer.
 * 
 * This class should probably be called HttpConnector, but it's name predates the 
 * EventListener API in java.
 *
 * Once a HttpListener is started, it is responsible for listening for new
 * connections. Once a new connection is accepted it should be handled by
 * creating a HttpConnection instance and calling either the HttpConnection.handle()
 * or HttpConnection.handleNext() methods from a Thread allocated to that
 * connection.
 *
 * @see HttpConnection
 * @see HttpServer
 * @version $Id: HttpListener.java,v 1.17 2005/03/15 10:03:40 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public interface HttpListener extends LifeCycle, Serializable
{
    public static final String ATTRIBUTE="org.openqa.jetty.http.HttpListener";
        
    /* ------------------------------------------------------------ */
    /** Set the HttpServer instance for this HttpListener.
     * This method is called by the HttpServer.addListener method.
     * It should not be called directly.
     * @param server The HttpServer instance this HttpListener has been added to.
     */
    public void setHttpServer(HttpServer server);

    /* ------------------------------------------------------------ */
    /** Get the HttpServer instance for this HttpListener.
     * @return The HttpServer instance this HttpListener has been added to,
     * or null if the listener is not added to any HttpServer.
     */
    public HttpServer getHttpServer();
    
    /* ------------------------------------------------------------ */
    /** Set the host or IP of the interface used by this listener. 
     * @param host The hostname or IP address of the interface used by this
     * listeners. If null or "0.0.0.0" then all available interfaces are used
     * by this listener.
     */
    public void setHost(String host)
        throws UnknownHostException;

    /* ------------------------------------------------------------ */
    /** Get the host or IP of the interface used by this listener. 
     * @return The hostname or IP address of the interface used by this
     * listeners. If null or "0.0.0.0" then all available interfaces are used
     * by this listener.
     */
    public String getHost();
    
    /* ------------------------------------------------------------ */
    /** Set the port number of the listener. 
     * @param port The TCP/IP port number to be used by this listener.
     */
    public void setPort(int port);

    /* ------------------------------------------------------------ */
    /** Get the port number of the listener.
     * @return The TCP/IP port number used by this listener.
     */
    public int getPort();

    /* ------------------------------------------------------------ */
    /** Get the size of the buffers used by connections from this listener. 
     * @return The default buffer size in bytes.
     */
    public int getBufferSize();
    
    /* ------------------------------------------------------------ */
    /** Get the size of the header reserve area.
     * Get the size of the header reserve area within the buffers used
     * by connections from this listener.  The header reserve is space
     * reserved in the first buffer of a response to allow a HTTP header to
     * be written in the same packet.  The reserve should be large enough to
     * avoid moving data to fit the header, but not too large as to waste memory.
     * @return The default buffer reserve size in bytes.
     */
    public int getBufferReserve();
    
    /* ------------------------------------------------------------ */
    /** Get the default scheme for requests.
     * If a request is received from a HttpConnection created by this
     * listener, that does not include a scheme in it's request URL, then
     * this method is used to determine the protocol scheme most likely used
     * to connect to this listener.
     * @return The protocol scheme name (eg "http" or "https").
     */
    public String getDefaultScheme();
    
    /* ------------------------------------------------------------ */
    /** Customize a request for a listener/connection combination.
     * This method is called by HttpConnection after a request has been read
     * from that connection and before processing that request.
     * Implementations may use this callback to add additional listener
     * and/or connection specific attributes to the request (eg SSL attributes).
     * @param connection The connection the request was received on, which must
     * be a HttpConnection created by this listener.
     * @param request The request to customize.
     */
    public void customizeRequest(HttpConnection connection,
                                 HttpRequest request);
    
    /* ------------------------------------------------------------ */
    /** Prepare a connection for persistance.
     * This method is called by the HttpConnection on a persistent connection
     * after each request has been handled and before starting to read for
     * the next connection.  Implementations may use this callback to change
     * the parameters or scheduling of the connection.
     * @param connection The perstent connection, which must be a
     * HttpConnection created by this listener.
     */
    public void persistConnection(HttpConnection connection);
    
    /* ------------------------------------------------------------ */
    /** Get the low on resources state of the listener.
     * For most implementations, Threads are the resource 
     * reported on by this method.
     * @return True if the listener is out of resources.
     */
    public boolean isLowOnResources();
    
    /* ------------------------------------------------------------ */
    /** Get the out of resources state of the listener.
     * For most implementations, Threads are the resource 
     * reported on by this method.
     * @return True if the listener is out of resources.
     */
    public boolean isOutOfResources();

    /* ------------------------------------------------------------ */
    /** Get the integral status of a connection.
     * @param connection The connection to test.
     * @return True of the connection checks the integrity of the data. For
     * most implementations this is true for https connections.
     */
    public boolean isIntegral(HttpConnection connection);
    
    /* ------------------------------------------------------------ */
    /** Get the protocol scheme to use for integral redirections.
     * If an INTEGRAL security constraint is not met for a request, the
     * request is redirected to an integral port. This scheme return by this
     * method is used for that redirection.
     * @return The integral scheme. For most implementations this is "https"
     */
    public String getIntegralScheme();
    
    /* ------------------------------------------------------------ */
    /** Get the protocol port to use for integral redirections.
     * If an INTEGRAL security constraint is not met for a request, the
     * request is redirected to an integral port. This port return by this
     * method is used for that redirection.
     * @return The integral port. For most implementations this is 443 for https
     */
    public int    getIntegralPort();
    
    /* ------------------------------------------------------------ */
    /** Get the confidential status of a connection.
     * @param connection The connection to test.
     * @return True of the connection checks the integrity of the data. For
     * most implementations this is true for https connections.
     */
    public boolean isConfidential(HttpConnection connection);
    
    /* ------------------------------------------------------------ */
    /** Get the protocol scheme to use for confidential redirections.
     * If an CONFIDENTIAL security constraint is not met for a request, the
     * request is redirected to an confidential port. This scheme return by this
     * method is used for that redirection.
     * @return The confidential scheme. For most implementations this is "https"
     */
    public String getConfidentialScheme();
    
    /* ------------------------------------------------------------ */
    /** Get the protocol port to use for confidential redirections.
     * If an CONFIDENTIAL security constraint is not met for a request, the
     * request is redirected to an confidential port. This port return by this
     * method is used for that redirection.
     * @return The confidential port. For most implementations this is 443 for https
     */
    public int    getConfidentialPort();
    
    /* ------------------------------------------------------------ */
    /** Get an optional HttpHandler for the listener.
     * If Set, then HttpConnection will pass requests from this listener
     * to this handler with an empty context path, before passing the
     * request to the HttpServer.  This allows listener specific handling
     * to be added or even a HttpContext (which is a HttpHandler) to be
     * bound directly to HttpListener. 
     */
    public HttpHandler getHttpHandler();
    
    
}











