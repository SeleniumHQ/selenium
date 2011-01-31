// ========================================================================
// $Id: ProxyHandler.java,v 1.34 2005/10/05 13:32:59 gregwilkins Exp $
// Copyright 1991-2005 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.http.handler;

import java.net.MalformedURLException;
import java.net.URL;
import org.openqa.jetty.util.URI;

/* ------------------------------------------------------------ */
public class CollettaProxyHandler extends ProxyHandler
{
    /* ------------------------------------------------------------ */
    /**
     * Is URL Proxied. Method to allow derived handlers to select which URIs are proxied and to
     * where.
     * 
     * @param uri The requested URI, which should include a scheme, host and port.
     * @return The URL to proxy to, or null if the passed URI should not be proxied. The default
     *         implementation returns the passed uri if isForbidden() returns true.
     */
    protected URL isProxied(URI uri) throws MalformedURLException
    {
        return new URL("http://209.235.197.108"+uri.toString());
    }

    /* ------------------------------------------------------------ */
    /**
     * Is URL Forbidden.
     * 
     * @return True if the URL is not forbidden. Calls isForbidden(scheme,host,port,true);
     */
    protected boolean isForbidden(URI uri)
    {
	return false;
    }

    /* ------------------------------------------------------------ */
    /**
     * Is scheme,host & port Forbidden.
     * 
     * @param scheme A scheme that mast be in the proxySchemes StringMap.
     * @param host A host that must pass the white and black lists
     * @param port A port that must in the allowedConnectPorts Set
     * @param openNonPrivPorts If true ports greater than 1024 are allowed.
     * @return True if the request to the scheme,host and port is not forbidden.
     */
    protected boolean isForbidden(String scheme, String host, int port, boolean openNonPrivPorts)
    {
	return false;
    }
}
