package com.thoughtworks.selenium.runner;

import java.io.IOException;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.mortbay.http.HttpException;

/**
 * @author Darren Cotterill
 * @author Ajit George
 * @version $Revision: $
 */
public class UrlPoller {
    private final String applicationURL;
    private int pollingLimit;

    public UrlPoller(String applicationURL, int pollingLimit) {
        this.applicationURL = applicationURL;
        this.pollingLimit = pollingLimit;
    }

    public boolean poll(ResponseEvaluator evaluator) {
        for (int count = 0; count < pollingLimit; count++) {
            System.out.println("Attempting to connect to " + applicationURL + ". Try " + count + " ...");
            
            boolean succeeded = evaluateConnectionAttempt(evaluator);
            
            if (succeeded) {
                return true;
            }
            sleepOneSecond();
        }
        return false;
    }

    private boolean evaluateConnectionAttempt(ResponseEvaluator evaluator) {
        try {
            GetMethod get = new GetMethod(applicationURL);
            new HttpClient().executeMethod(get);
            return evaluator.evaluate(get);

        } catch (HttpException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return false;
    }

    private void sleepOneSecond() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e1) {
            e1.printStackTrace();
        }
    }
}