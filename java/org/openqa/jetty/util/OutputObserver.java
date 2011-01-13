// ========================================================================
// $Id: OutputObserver.java,v 1.3 2004/05/09 20:32:49 gregwilkins Exp $
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

package org.openqa.jetty.util;

import java.io.IOException;
import java.io.OutputStream;

/* ------------------------------------------------------------ */
/** Observer output events.
 *
 * @see org.openqa.jetty.http.HttpOutputStream
 * @version $Id: OutputObserver.java,v 1.3 2004/05/09 20:32:49 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public interface OutputObserver
{
    public final static int
        __FIRST_WRITE=0,
        __RESET_BUFFER=1,
        __COMMITING=2,
        __CLOSING=4,
        __CLOSED=5;
    
    /* ------------------------------------------------------------ */
    /** Notify an output action.
     * @param out The OutputStream that caused the event
     * @param action The action taken
     * @param data Data associated with the event.
     */
    void outputNotify(OutputStream out, int action, Object data)
        throws IOException;
}
