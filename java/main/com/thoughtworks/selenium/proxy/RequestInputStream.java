package com.thoughtworks.selenium.proxy;

/*
  Copyright 2004 ThoughtWorks, Inc. 
  
  Licensed under the Apache License, Version 2.0 (the "License"); 
  you may not use this file except in compliance with the License. 
  You may obtain a copy of the License at 
  
      http://www.apache.org/licenses/LICENSE-2.0 
  
  Unless required by applicable law or agreed to in writing, software 
  distributed under the License is distributed on an "AS IS" BASIS, 
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and 
  limitations under the License. 
*/

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * @version $Id: RequestInputStream.java,v 1.2 2004/11/13 05:43:00 ahelleso Exp $
 */
public class RequestInputStream extends BufferedReader implements RequestInput {
    public RequestInputStream(InputStream inputStream) {
        super(new InputStreamReader(inputStream));
    }

    public SeleniumHTTPRequest readRequest() throws IOException {
        StringBuffer content = new StringBuffer();
        String line = null;
        while ((line = readLine()) != null && line.length() > 0) {
            content.append(line + HTTPRequest.CRLF);
        }
        return new SeleniumHTTPRequest(content.toString());
    }
}
