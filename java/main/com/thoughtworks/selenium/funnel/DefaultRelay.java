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
package com.thoughtworks.selenium.funnel;

import java.io.OutputStream;
import java.io.InputStream;
import java.io.IOException;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class DefaultRelay implements Relay {
    private final InputStream clientRequest;
    private final OutputStream clientResponse;
    private final InputStream serverResponse;
    private final OutputStream serverRequest;

    public DefaultRelay(InputStream clientRequest, OutputStream clientOut, InputStream serverResponse, OutputStream serverRequest) {
        this.clientRequest = clientRequest;
        this.clientResponse = clientOut;
        this.serverResponse = serverResponse;
        this.serverRequest = serverRequest;
    }

    public void close() throws IOException {
        clientRequest.close();
        clientResponse.close();
        serverResponse.close();
        serverRequest.close();
    }
}
