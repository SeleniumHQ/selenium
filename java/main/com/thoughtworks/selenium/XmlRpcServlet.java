package com.thoughtworks.selenium;

import marquee.xmlrpc.XmlRpcParser;
import marquee.xmlrpc.XmlRpcServer;
import marquee.xmlrpc.util.ServerInputStream;
import org.apache.crimson.parser.XMLReaderImpl;
import org.xml.sax.helpers.XMLReaderAdapter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.2 $
 */
public class XmlRpcServlet extends HttpServlet {
    private final XmlRpcServer server;

    public XmlRpcServlet(XmlRpcServer server) {
        this.server = server;
        XmlRpcParser.setDriver(XMLReaderAdapter.class.getName());
        System.setProperty("org.xml.sax.driver", XMLReaderImpl.class.getName());
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        try {
            // Note. Wrapping the stream in a ServerInputStream is perhaps the responsibility
            // of the server? For now, some implementations must do like below to prevent
            // the server from freezing as a result of not recognizing the EOF.

            byte[] result = server.execute(new ServerInputStream(req.getInputStream(),
                    req.getContentLength()));
            res.setContentType("text/xml");
            res.setContentLength(result.length);

            OutputStream output = res.getOutputStream();
            output.write(result);
            output.flush();
        } catch (java.lang.Throwable e) {
            e.printStackTrace();
        }

    }
}
