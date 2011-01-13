/*
 * ====================================================================
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * ====================================================================
 *
 * This software consists of voluntary contributions made by many
 * individuals on behalf of the Apache Software Foundation.  For more
 * information on the Apache Software Foundation, please see
 * <http://www.apache.org/>.
 *
 */


/*
* Slightly modified org.apache.http.conn.scheme.PlainSocketFactor
* by Kristian Rosenvold based on httpclient 4.x source.
* While we wait for support for SO_REUSEADDR, which seems to be arriving in
* httpcomopnents 4.1
*/

package org.openqa.selenium.remote;

import org.apache.http.conn.ConnectTimeoutException;
import org.apache.http.conn.scheme.HostNameResolver;
import org.apache.http.conn.scheme.SocketFactory;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;

import java.io.IOException;
import java.net.*;

public class ReusingSocketSocketFactory implements SocketFactory {
  /**
   * The default factory.
   */
  private static final
  ReusingSocketSocketFactory DEFAULT_FACTORY = new ReusingSocketSocketFactory();

  private final HostNameResolver nameResolver;

  /**
   * Gets the default factory. Usually there should be no reason for creating
   * multiple instances of this class.
   *
   * @return the default factory
   */
  public static ReusingSocketSocketFactory getSocketFactory() {
      return DEFAULT_FACTORY;
  }

  public ReusingSocketSocketFactory(final HostNameResolver nameResolver) {
      this.nameResolver = nameResolver;
  }


  public ReusingSocketSocketFactory() {
      this(null);
  }

  public Socket createSocket() {
    final Socket socket = new Socket();
      try {
          socket.setReuseAddress(true);  // This is added by kristian
      } catch (SocketException e) {
          throw new RuntimeException(e);
      }
      return socket;

  }

  public Socket connectSocket(Socket sock, String host, int port,
                              InetAddress localAddress, int localPort,
                              HttpParams params)
      throws IOException {

      if (host == null) {
          throw new IllegalArgumentException("Target host may not be null.");
      }
      if (params == null) {
          throw new IllegalArgumentException("Parameters may not be null.");
      }

      if (sock == null)
          sock = createSocket();

      sock.setReuseAddress(true);  // This is the 1 line added by kristian
      if ((localAddress != null) || (localPort > 0)) {

          // we need to bind explicitly
          if (localPort < 0)
              localPort = 0; // indicates "any"

          InetSocketAddress isa =
              new InetSocketAddress(localAddress, localPort);
          sock.bind(isa);
      }

      int timeout = HttpConnectionParams.getConnectionTimeout(params);

      InetSocketAddress remoteAddress;
      if (this.nameResolver != null) {
          remoteAddress = new InetSocketAddress(this.nameResolver.resolve(host), port);
      } else {
          remoteAddress = new InetSocketAddress(host, port);
      }
      try {
          sock.connect(remoteAddress, timeout);
      } catch (SocketTimeoutException ex) {
          throw new ConnectTimeoutException("Connect to " + remoteAddress + " timed out");
      }
      return sock;
  }

  /**
   * Checks whether a socket connection is secure.
   * This factory creates plain socket connections
   * which are not considered secure.
   *
   * @param sock      the connected socket
   *
   * @return  <code>false</code>
   *
   * @throws IllegalArgumentException if the argument is invalid
   */
  public final boolean isSecure(Socket sock)
      throws IllegalArgumentException {

      if (sock == null) {
          throw new IllegalArgumentException("Socket may not be null.");
      }
      // This check is performed last since it calls a method implemented
      // by the argument object. getClass() is final in java.lang.Object.
      if (sock.isClosed()) {
          throw new IllegalArgumentException("Socket is closed.");
      }
      return false;
  }


}
