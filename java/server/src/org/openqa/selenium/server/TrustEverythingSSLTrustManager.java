/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server;

import java.security.GeneralSecurityException;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

/**
 * Provides a mechanism to trust all SSL certificates
 */
public class TrustEverythingSSLTrustManager implements X509TrustManager {


  public java.security.cert.X509Certificate[] getAcceptedIssuers() {
    return null;
  }

  public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {
    // No need to implement.
  }

  public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {
    // No need to implement.
  }

  private static SSLSocketFactory socketFactory = null;

  /**
   * Returns an SSLSocketFactory that will trust all SSL certificates; this is suitable for passing
   * to HttpsURLConnection, either to its instance method setSSLSocketFactory, or to its static
   * method setDefaultSSLSocketFactory.
   * 
   * @return SSLSocketFactory suitable for passing to HttpsUrlConnection
   * @see HttpsURLConnection#setSSLSocketFactory(SSLSocketFactory)
   * @see HttpsURLConnection#setDefaultSSLSocketFactory(SSLSocketFactory)
   */
  public synchronized static SSLSocketFactory getTrustingSSLSocketFactory() {
    if (socketFactory != null) return socketFactory;
    TrustManager[] trustManagers = new TrustManager[] {new TrustEverythingSSLTrustManager()};
    SSLContext sc;
    try {
      sc = SSLContext.getInstance("SSL");
      sc.init(null, trustManagers, null);
    } catch (GeneralSecurityException e) {
      throw new RuntimeException("This is a BUG in Selenium; please report it", e);
    }
    socketFactory = sc.getSocketFactory();
    return socketFactory;
  }

  /**
   * Automatically trusts all SSL certificates in the current process; this is dangerous. You should
   * probably prefer to configure individual HttpsURLConnections with trustAllSSLCertificates
   * 
   * @see #trustAllSSLCertificates(HttpsURLConnection)
   */
  public static void trustAllSSLCertificatesUniversally() {
    getTrustingSSLSocketFactory();
    HttpsURLConnection.setDefaultSSLSocketFactory(socketFactory);
  }

  /**
   * Configures a single HttpsURLConnection to trust all SSL certificates.
   * 
   * @param connection an HttpsURLConnection which will be configured to trust all certs
   */
  public static void trustAllSSLCertificates(HttpsURLConnection connection) {
    getTrustingSSLSocketFactory();
    connection.setSSLSocketFactory(socketFactory);
    connection.setHostnameVerifier(new HostnameVerifier() {
      public boolean verify(String s, SSLSession sslSession) {
        return true;
      }
    });
  }
}
