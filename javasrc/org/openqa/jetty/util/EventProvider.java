//========================================================================
//$Id: EventProvider.java,v 1.1 2004/10/02 08:34:20 gregwilkins Exp $
//Copyright 2004 Mort Bay Consulting Pty. Ltd.
//------------------------------------------------------------------------
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at 
//http://www.apache.org/licenses/LICENSE-2.0
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.
//========================================================================

package org.openqa.jetty.util;

import java.util.EventListener;

/** Source of EventObjects for registered EventListeners.
 * the actual implementation of EventProvider must define what types of
 * EventListeners can be registered.
 * @author gregw
 *
 */
public interface EventProvider
{	
    /** Register an EventListener
     * @param listener
     * @throws IllegalArgumentException If the EventListener type is not supported.
     */
    public void addEventListener(EventListener listener)
    	throws IllegalArgumentException;
    
    public void removeEventListener(EventListener listener);

}
