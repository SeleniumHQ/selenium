/*
 * Created on Feb 26, 2006
 *
 */
package org.openqa.selenium.server.htmlrunner;

import java.io.*;
import java.text.*;

import org.openqa.jetty.http.*;
import org.openqa.jetty.http.handler.*;
import org.openqa.jetty.util.*;

/** Generates a test suite table designed to run a single Selenium test; to use it, point TestRunner.html to /singleTest/http://my.com/single/test.html
 * 
 *  @author dfabulich
 *
 */
public class SingleTestSuiteResourceHandler extends ResourceHandler {

    private static final String HTML = "<html>\n<head>\n<title>{0} Suite</title>\n</head>\n<body>\n<table cellpadding=\"1\" cellspacing=\"1\" border=\"1\">\n<tbody>\n<tr><td><b>{0} Suite</b></td></tr>\n<tr><td><a href=\"{1}\">{0}</a></td></tr>\n</tbody>\n</table>\n</body>\n</html>";
    
    /** Handles the HTTP request and generates the suite table */
    public void handle(String pathInContext, String pathParams,
            HttpRequest request, HttpResponse response) throws HttpException,
            IOException {
        if (!pathInContext.startsWith("/singleTest/")) return;
        request.setHandled(true);
        String url = pathInContext.substring("/singleTest/".length());
        OutputStream outStream = response.getOutputStream();
        if (url == null) {
            outStream.write("No singleTest was specified!".getBytes());
            outStream.flush();
            return;
        }
        response.setContentType("text/html");
        String suiteName = getSuiteName(url);
        Writer writer = new OutputStreamWriter(response.getOutputStream(), StringUtil.__ISO_8859_1);
        writer.write(MessageFormat.format(HTML, new Object[]{suiteName, url}));
        writer.flush();
    }
    
    private String getSuiteName(String path) {
        int lastSlash = path.lastIndexOf('/');
        String fileName = path.substring(lastSlash+1);
        return fileName;
    }
}
