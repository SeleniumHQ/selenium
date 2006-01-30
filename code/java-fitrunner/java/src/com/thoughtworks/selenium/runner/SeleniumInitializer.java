package com.thoughtworks.selenium.runner;

import java.io.IOException;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;

/**
 * @author Darren Cotterill
 * @author Ajit George
 * @version $Revision: $
 */
public class SeleniumInitializer {

    private final String applicationURL;

    public SeleniumInitializer(String applicationURL) {
        this.applicationURL = applicationURL;
    }

    public void initialize() throws HttpException, IOException {
        resetResultsServlet();
    }
    
    private void resetResultsServlet() throws HttpException, IOException {
        HttpClient client = new HttpClient();
        System.out.println("Clearing:" + applicationURL);
        GetMethod get = new GetMethod(applicationURL + "?clear");
        client.executeMethod(get);
        if (get.getStatusCode() != HttpStatus.SC_OK || !isSeleniumResultsCleared(get)) {
            throw new RuntimeException("failed to reset postServlet");
        }
        System.out.println("selenium results cleared");
    }

    private static boolean isSeleniumResultsCleared(GetMethod get) throws IOException {
        return get.getResponseBodyAsString().indexOf("selenium results cleared") != -1;
    }
}
