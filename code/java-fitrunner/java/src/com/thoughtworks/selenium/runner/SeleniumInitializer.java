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
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;

/**
 * @author Darren Cotterill
 * @author Ajit George
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
