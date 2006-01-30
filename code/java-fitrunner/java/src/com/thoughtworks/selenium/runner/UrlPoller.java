/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium.runner;

import java.io.IOException;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.mortbay.http.HttpException;

/**
 * @author Darren Cotterill
 * @author Ajit George
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