//========================================================================
//$Id: ComponentEvent.java,v 1.1 2004/10/01 14:28:30 gregwilkins Exp $
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

import java.util.EventObject;


public class ComponentEvent extends EventObject
{
    private Object component;
    
    public ComponentEvent(Object container, Object component)
    {
        super(container);
        this.component=component;
    }
    public Object getComponent()
    {
        return component;
    }
}
