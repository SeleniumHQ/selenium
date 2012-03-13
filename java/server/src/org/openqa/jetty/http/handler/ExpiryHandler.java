// ========================================================================
// $Id: ExpiryHandler.java,v 1.11 2005/08/13 00:01:26 gregwilkins Exp $
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

package org.openqa.jetty.http.handler;

import java.io.IOException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;

/* ------------------------------------------------------------ */
/**
 * RestishHandler that allows the default Expiry of all content to be set.
 *
 * @version $Id: ExpiryHandler.java,v 1.11 2005/08/13 00:01:26 gregwilkins Exp $
 * @author Brett Sealey
 */
public class ExpiryHandler extends AbstractHttpHandler
{
    private static Log log = LogFactory.getLog(ExpiryHandler.class);

    /**
     * The default expiry time in seconds
     */
    private long _ttl=-1;

    /* ------------------------------------------------------------ */
    /**
     * Set the default expiry time in seconds.
     *
     * @param ttl The default time to live in seconds. If negative (the
     * default) then all content will be set to expire 01Jan1970 by default.
     */
    public void setTimeToLive(long ttl)
    {
        _ttl=ttl;
    }

    /* ------------------------------------------------------------ */
    /** Handle a request by pre-populating the Expires header with a a value
     * that corresponds to now + ttl. If ttl -s negative then
     * HttpFields.__01Jan1970 is used.
     *
     * Settings made here can be overridden by subsequent handling of the
     * request.
     *
     * @param pathInContext The context path
     * @param pathParams Path parameters such as encoded Session ID
     * @param request The HttpRequest request
     * @param response The HttpResponse response
     */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
            throws HttpException,IOException
    {
        log.debug("ExpiryHandler.handle()");
        String expires;
        if (_ttl<0)
            expires=HttpFields.__01Jan1970;
        else
            expires=HttpFields.formatDate
              (System.currentTimeMillis()+1000L*_ttl,false);
        response.setField(HttpFields.__Expires,expires);
    }
}
