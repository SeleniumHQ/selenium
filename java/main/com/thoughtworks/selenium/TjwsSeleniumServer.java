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
 * @version $Revision: 1.1 $
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
