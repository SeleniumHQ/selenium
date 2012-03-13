// ========================================================================
// $Id: SetResponseHeadersHandler.java,v 1.6 2005/08/13 00:01:26 gregwilkins Exp $
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

package org.openqa.jetty.http.handler;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;

/* ------------------------------------------------------------ */
/**
 * RestishHandler that allows arbitrary HTTP Header values to be set in the response.
 *
 * @version $Id: SetResponseHeadersHandler.java,v 1.6 2005/08/13 00:01:26 gregwilkins Exp $
 * @author Brett Sealey
 */
public class SetResponseHeadersHandler extends AbstractHttpHandler
{
    private static Log log = LogFactory.getLog(SetResponseHeadersHandler.class);

    /* ------------------------------------------------------------ */
    /**
     * The Map of _fields that will be asserted on outgoing responses.
     * Key is the header name. Value is a List containing its values.
     */
    private Map _fields=new HashMap();

    /* ------------------------------------------------------------ */
    /** Set a header override, every response handled will have this header set.
     * @param name The String name of the header.
     * @param value The String value of the header.
     */
    public void setHeaderValue(String name,String value)
    {
        _fields.put(name,Collections.singletonList(value));
    }

    /* ------------------------------------------------------------ */
    /** Set a multivalued header, every response handled will have
     * this header set with the provided values.
     *
     * @param name The String name of the header.
     * @param values An Array of String values to use as the values for a Header.
     */
    public void setHeaderValues(String name,String[] values)
    {
        _fields.put(name,Arrays.asList(values));
    }

    /* ------------------------------------------------------------ */
    /** Handle a request by pre-populating the headers from the configured
     * set of _fields.
     *
     * Settings made here can be overridden by subsequent handling of the
     * request.
     *
     * @param pathInContext The context path. Ignored.
     * @param pathParams Path parameters such as encoded Session ID. Ignored.
     * @param request The HttpRequest request. Ignored.
     * @param response The HttpResponse response. Updated with new Headers.
     */
    public void handle(String pathInContext,
                       String pathParams,
                       HttpRequest request,
                       HttpResponse response)
            throws HttpException,IOException
    {
        log.debug("SetResponseHeadersHandler.handle()");

        for (Iterator iterator=_fields.entrySet().iterator();iterator.hasNext();)
        {
            Map.Entry entry=(Map.Entry)iterator.next();
            String name=(String)entry.getKey();
            List values=(List)entry.getValue();
            response.setField(name,values);
        }
    }
}
