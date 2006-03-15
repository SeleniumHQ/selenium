/*
 * Created on Feb 25, 2006
 *
 */
package org.openqa.selenium.server.htmlrunner;

import java.io.*;
import java.util.*;

import javax.servlet.*;
import javax.servlet.http.*;

import org.mortbay.http.*;
import org.mortbay.util.*;

/**
 * Handles results of HTMLRunner (aka TestRunner, FITRunner) in automatic mode.
 *  
 * @author Dan Fabulich
 * @author Darren Cotterill
 * @author Ajit George
 *
 */
public class SeleniumHTMLRunnerResultsHandler implements HttpHandler {

    HttpContext context;
    List listeners;
    boolean started = false;
    
    public SeleniumHTMLRunnerResultsHandler() {
        listeners = new Vector();
    }
    
    public void addListener(HTMLResultsListener listener) {
        listeners.add(listener);
    }
    
    public void handle(String pathInContext, String pathParams, HttpRequest request, HttpResponse res) throws HttpException, IOException {
        if (!"/postResults".equals(pathInContext)) return;
        request.setHandled(true);
        String result = request.getParameter("result");
        if (result == null) {
            res.getOutputStream().write("No result was specified!".getBytes());
        }
        String totalTime = request.getParameter("totalTime");
        String numTestPasses = request.getParameter("numTestPasses");
        String numTestFailures = request.getParameter("numTestFailures");
        String numCommandPasses = request.getParameter("numCommandPasses");
        String numCommandFailures = request.getParameter("numCommandFailures");
        String numCommandErrors = request.getParameter("numCommandErrors");
        String suite = request.getParameter("suite");
        
        int numTotalTests = Integer.parseInt(numTestPasses) + Integer.parseInt(numTestFailures);
        
        List testTables = createTestTables(request, numTotalTests);

        
        HTMLTestResults results = new HTMLTestResults(result, totalTime,
                numTestPasses, numTestFailures, numCommandPasses,
                numCommandFailures, numCommandErrors, suite, testTables);
        
        for (Iterator i = listeners.iterator(); i.hasNext();) {
            HTMLResultsListener listener = (HTMLResultsListener) i.next();
            listener.processResults(results);
            i.remove();
        }
        processResults(results, res);
    }
    
    /** Print the test results out to the HTML response */
    private void processResults(HTMLTestResults results, HttpResponse res) throws IOException {
        res.setContentType("text/html");
        OutputStream out = res.getOutputStream();
        Writer writer = new OutputStreamWriter(out, StringUtil.__ISO_8859_1);
        results.write(writer);
        writer.flush();
    }
    
    private List createTestTables(HttpRequest request, int numTotalTests) {
        List testTables = new LinkedList();
        for (int i = 1; i <= numTotalTests; i++) {
            String testTable = request.getParameter("testTable." + i);
            //System.out.println("table " + i);
            //System.out.println(testTable);
            testTables.add(testTable);
        }
        return testTables;
    }

    public String getName() {
        return SeleniumHTMLRunnerResultsHandler.class.getName();
    }

    public HttpContext getHttpContext() {
        return context;
    }

    public void initialize(HttpContext context) {
        this.context = context;
        
    }

    public void start() throws Exception {
        started = true;
    }

    public void stop() throws InterruptedException {
        started = false;
    }

    public boolean isStarted() {
        return started;
    }
}
