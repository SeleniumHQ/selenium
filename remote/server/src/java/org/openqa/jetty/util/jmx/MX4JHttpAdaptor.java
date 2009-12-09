// ========================================================================
// $Id: MX4JHttpAdaptor.java,v 1.5 2005/08/13 00:01:28 gregwilkins Exp $
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

package org.openqa.jetty.util.jmx;

import javax.management.MBeanServer;
import javax.management.ObjectName;

import mx4j.tools.adaptor.http.HttpAdaptor;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

public class MX4JHttpAdaptor extends HttpAdaptor
{
    private static Log log = LogFactory.getLog(MX4JHttpAdaptor.class);

    public MX4JHttpAdaptor()
    {
        super();
    }
    
    public MX4JHttpAdaptor(int port)
    {
        super(port);
    }
    
    public MX4JHttpAdaptor(int port, String host)
    {
        super(port,host);
    }
    
    public ObjectName preRegister(MBeanServer server,
                                  ObjectName name)
        throws Exception
    {
        name=super.preRegister(server,name);
        ObjectName processorName = new ObjectName(name+",processor=XSLT");
        server.createMBean("mx4j.tools.adaptor.http.XSLTProcessor", processorName, null);
        setProcessorName(processorName);
        return name;
    }

    public void postRegister(Boolean done)
    {
        super.postRegister(done);
        if (done.booleanValue())
        {
            try{start();} catch(Exception e){e.printStackTrace();}
            log.info("Started MX4J HTTP Adaptor on : "+this.getPort());
        }
    }
}


