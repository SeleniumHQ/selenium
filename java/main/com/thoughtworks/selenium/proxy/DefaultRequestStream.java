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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.thoughtworks.selenium.utils.Assert;

/**
 * @version $Id: DefaultRequestStream.java,v 1.1 2004/11/11 12:19:47 mikemelia Exp $
 */
public class DefaultRequestStream implements RequestStream {
    private static final Log LOG = LogFactory.getLog(DefaultRequestStream.class);
    private final InputStream inputStream;
    private final static int EOF = -1;
    private final int BUFF_SIZE = 8192;

    public DefaultRequestStream(InputStream inputStream) {
        Assert.assertIsTrue(inputStream != null, "inputStream can't be null");
        this.inputStream = inputStream;
    }

    public HTTPRequest read() {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuffer outBuff = new StringBuffer();
        String readLine = "d";
        try {
            while ((readLine = reader.readLine()) != null && readLine.length() > 0) {
                outBuff.append(readLine + "\r\n");
            }
        } catch (IOException e) {
            LOG.error("IOException reading from inputStream", e);
        }
        return new HTTPRequest(outBuff.toString());
    }
}
