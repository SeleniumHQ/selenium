// ========================================================================
// $Id: Main.java,v 1.4 2004/05/09 20:32:48 gregwilkins Exp $
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

package org.openqa.jetty.stop;

import java.io.OutputStream;
import java.net.InetAddress;
import java.net.Socket;



/*-------------------------------------------*/
/** Main stop class.
 * This class is intended to be the main class listed in the MANIFEST.MF  of
 * the stop.jar archive. It allows an application started with the
 * command "java -jar start.jar" to be stopped.
 *
 * Programs started with start.jar may be stopped with the stop.jar, which connects
 * via a local port to stop the server. The default port can be set with the 
 * STOP.PORT system property (a port of < 0 disables the stop mechanism). If the STOP.KEY 
 * system property is set, then a random key is generated and written to stdout. This key 
 * must be passed to the stop.jar.
 *
 * @author Greg Wilkins
 * @version $Revision: 1.4 $
 */
 
public class Main
{
    private boolean _debug = System.getProperty("DEBUG",null)!=null;
    private String _config = System.getProperty("START","org/mortbay/start/start.config");
    private int _port = Integer.getInteger("STOP.PORT",8079).intValue();
    private String _key = System.getProperty("STOP.KEY","mortbay");
       
    public static void main(String[] args)
    {
        new Main().stop();
    }

    void stop()
    {
        try
        {
            if (_port<=0)
                System.err.println("START.PORT system property must be specified");
            if (_key==null)
            {
                _key="";
                System.err.println("Using empty key");
            }

            Socket s=new Socket(InetAddress.getByName("127.0.0.1"),_port);
            OutputStream out=s.getOutputStream();
            out.write((_key+"\r\nstop\r\n").getBytes());
            out.flush();
            s.shutdownOutput();
            s.close();
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
