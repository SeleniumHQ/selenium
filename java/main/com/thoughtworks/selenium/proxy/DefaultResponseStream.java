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

import com.thoughtworks.selenium.utils.Assert;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.io.OutputStream;

/**
 * @version $Id: DefaultResponseStream.java,v 1.2 2004/11/12 07:49:50 mikemelia Exp $
 */
public class DefaultResponseStream implements ResponseStream {
    private static final Log LOG = LogFactory.getLog(DefaultResponseStream.class);
    private final OutputStream outputStream;

    public DefaultResponseStream(OutputStream outputStream) {
        Assert.assertIsTrue(outputStream != null, "outputStream can't be null");
        this.outputStream = outputStream;
    }

    public void write(byte[] buffer, int numBytes) {
        try {
            outputStream.write(buffer, 0, numBytes);
        } catch (IOException e) {
            LOG.error("Problem writing to outputStream", e);
        }
    }

    public void flush() {
        try {
            outputStream.flush();
        } catch (IOException e) {
            LOG.error("Problem writing to outputStream", e);
        }
    }
}
