// ========================================================================
// $Id: LogSupport.java,v 1.7 2004/08/08 06:37:00 gregwilkins Exp $
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

package org.openqa.jetty.util;

import org.apache.commons.logging.Log;

/*-----------------------------------------------------------------------*/
/** Log Support class.
 */
public class LogSupport 
{    
    public final static String IGNORED= "IGNORED ";
    public final static String EXCEPTION= "EXCEPTION ";
    public final static String NOT_IMPLEMENTED= "NOT IMPLEMENTED ";

    /* ------------------------------------------------------------ */
    /**
     * Ignore an exception unless trace is enabled.
     * This works around the problem that log4j does not support the trace level.
     */
    public static void ignore(Log log,Throwable th)
    {
        if (log.isTraceEnabled()) log.trace(IGNORED,th);
    }


}

