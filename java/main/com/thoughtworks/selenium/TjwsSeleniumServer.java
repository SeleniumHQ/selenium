/*
Copyright (c) 2003 ThoughtWorks, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

   3. The end-user documentation included with the redistribution, if any, must
      include the following acknowledgment:

          This product includes software developed by ThoughtWorks, Inc.
          (http://www.thoughtworks.com/).

      Alternately, this acknowledgment may appear in the software itself, if and
      wherever such third-party acknowledgments normally appear.

   4. The names "CruiseControl", "CruiseControl.NET", "CCNET", and
      "ThoughtWorks, Inc." must not be used to endorse or promote products derived
      from this software without prior written permission. For written permission,
      please contact opensource@thoughtworks.com.

   5. Products derived from this software may not be called "Selenium" or
      "ThoughtWorks", nor may "Selenium" or "ThoughtWorks" appear in their name,
      without prior written permission of ThoughtWorks, Inc.


THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THOUGHTWORKS
INC OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/
package com.thoughtworks.selenium;

import Acme.Serve.Serve;
import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.Executors;
import marquee.xmlrpc.XmlRpcServer;
import marquee.xmlrpc.handlers.ReflectiveInvocationHandler;

import java.io.IOException;

/**
 * This is the local web server for Selenium. It serves the following content:
 * <ul>
 * <li>/ - the selenium html and js files
 * </li>
 * <li>/xmlrpc - test scripts
 * </li>
 * <li>/site - the site to be tested (via an internal tunnel) TODO
 * </li>
 * </ul>
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.2 $
 */
public class TjwsSeleniumServer implements SeleniumServer {
    private class StoppableServe extends Serve {
        public void notifyStop() throws IOException {
            super.notifyStop();
        }
    }

    private final Exchanger wikiRowExchanger;
    private final Exchanger resultExchanger;
    private StoppableServe webserver;

    public TjwsSeleniumServer(Exchanger commandExchanger, Exchanger resultExchanger) {
        this.wikiRowExchanger = commandExchanger;
        this.resultExchanger = resultExchanger;
    }

    public void start() {
        webserver = new StoppableServe();
        // This makes it possible to serve files from the file system
        webserver.addDefaultServlets(null);

        XmlRpcServer xmlRpcServer = mountXmlRpcServlet(webserver);
        registerWikiTableRows(xmlRpcServer);

        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                webserver.serve();                
            }
        });
    }

    public void shutdown() {
        try {
            webserver.notifyStop();
        } catch (IOException e) {
            throw new SeleniumException(e);
        }
    }

    private void registerWikiTableRows(XmlRpcServer xmlRpcServer) {
        WikiTableRows wikiTableRows = new WikiTableRows(wikiRowExchanger, resultExchanger);
        ReflectiveInvocationHandler wikiRowTableRowsHandler = new ReflectiveInvocationHandler(wikiTableRows);
        xmlRpcServer.registerInvocationHandler("wikiTableRows", wikiRowTableRowsHandler);
    }

    private XmlRpcServer mountXmlRpcServlet(Serve serve) {
        XmlRpcServer xmlRpcServer = new XmlRpcServer();
        serve.addServlet("/xmlrpc", new XmlRpcServlet(xmlRpcServer));
        return xmlRpcServer;
    }
}
