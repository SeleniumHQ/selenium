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

package com.thoughtworks.selenium.servlet;

import com.thoughtworks.selenium.SeleneseHandler;
import com.thoughtworks.selenium.SeleneseCommand;

import java.net.URL;
import java.net.URLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

/**
 * @author Paul Hammant
 * @version $Revision: 1.2 $
 */
public class SeleneseProxy implements SeleneseHandler {

    String host;
    int port;

    public SeleneseProxy(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public SeleneseCommand handleCommandResult(String commandResult) {
        String spec = "http://" + host + ":" + port + "/selenium-driver/driver?";

        if (commandResult != null) {
            spec += "commandResult=" + commandResult;
        } else {
            spec += "seleniumStart=true";
        }

        try {
            URL url = new URL(spec);
            URLConnection conn = url.openConnection();
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine = in.readLine();
            in.close();
            return SeleneseCommand.parse(inputLine);
        } catch (IOException e) {
            //TODO
        }

        return null;
    }
}
