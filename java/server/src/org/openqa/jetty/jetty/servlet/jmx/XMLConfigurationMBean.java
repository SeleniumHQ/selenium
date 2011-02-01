//========================================================================
//$Id: XMLConfigurationMBean.java,v 1.1 2004/09/27 14:33:59 janb Exp $
//Copyright 2000-2004 Mort Bay Consulting Pty. Ltd.
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

package org.openqa.jetty.jetty.servlet.jmx;

import javax.management.MBeanException;


/**
 * 
 * XMLConfigurationMBean
 *
 * @author janb
 * @version $Revision: 1.1 $ $Date: 2004/09/27 14:33:59 $
 *
 */
public class XMLConfigurationMBean extends org.openqa.jetty.jetty.servlet.jmx.ConfigurationMBean
{
    public XMLConfigurationMBean()
    throws MBeanException
    {}
    
    protected void defineManagedResource()
    {
        super.defineManagedResource();
    }
    
 
}
