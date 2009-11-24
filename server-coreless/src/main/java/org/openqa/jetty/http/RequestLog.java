// ========================================================================
// $Id: RequestLog.java,v 1.5 2004/05/09 20:31:40 gregwilkins Exp $
// Copyright 2000-2004 Mort Bay Consulting Pty. Ltd.
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

import org.openqa.jetty.util.LifeCycle;

/* ------------------------------------------------------------ */
/** Abstract HTTP Request Log format
 * @version $Id: RequestLog.java,v 1.5 2004/05/09 20:31:40 gregwilkins Exp $
 * @author Tony Thompson
 * @author Greg Wilkins
 */
public interface RequestLog
    extends LifeCycle,
            Serializable
{
    public void log(HttpRequest request,
                    HttpResponse response,
                    int responseLength);
}

