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
package com.thoughtworks.selenium.proxy;

import com.thoughtworks.selenium.utils.Assert;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * @version $Id: SeleniumPump.java,v 1.2 2004/11/15 18:35:01 ahelleso Exp $
 */
public class SeleniumPump implements Pump {
    public static final int BLOCK_SIZE = 2048;
    private static final Log LOG = LogFactory.getLog(SeleniumPump.class);
    private InputStream in;
    private OutputStream out;

    public SeleniumPump(InputStream in, OutputStream out) {
        Assert.assertIsTrue(in != null, "in can't be null");
        Assert.assertIsTrue(out != null, "out can't be null");
        this.in = in;
        this.out = out;
    }

    public void pump() throws IOException {
        int bytesRead = 0;
        byte[] response = new byte[BLOCK_SIZE];
        while (bytesRead > -1) {
            bytesRead = in.read(response);

            if (bytesRead > -1) {
                LOG.debug("Waiting");
                out.write(response, 0, bytesRead);
                LOG.debug("Number of bytes returned = " + bytesRead);
                LOG.debug("RESPONSE\n" + new String(response, 0, bytesRead));
            }
        }
        out.flush();
    }
}
