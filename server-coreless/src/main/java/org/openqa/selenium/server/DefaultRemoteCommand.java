/*
 * Copyright 2006 ThoughtWorks, Inc.
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

package org.openqa.selenium.server;

import java.io.*;
import java.net.*;
import java.util.*;

import org.openqa.selenium.server.browserlaunchers.*;

/**
 * The default implementation of the RemoteCommand interface
 * @author Paul Hammant
 * @version $Revision: 184 $
 */
public class DefaultRemoteCommand implements RemoteCommand {
    private final String command;
    private final String field;
    private final String value;
    private final String piggybackedJavaScript;

    public DefaultRemoteCommand(String command, String field, String value) {
        this.command = command;
        this.field = field;
        this.value = value;
        this.piggybackedJavaScript = null;
    }

    public DefaultRemoteCommand(String command, String field, String value, String piggybackedJavaScript) {
        this.command = command;
        this.field = field;
        this.value = value;
        if (piggybackedJavaScript!=null && !"".equals(piggybackedJavaScript)) {
            this.piggybackedJavaScript = piggybackedJavaScript;
        }
        else {
            this.piggybackedJavaScript = null;
        }
    }

    public String getCommandURLString() {
        return "cmd=" + LauncherUtils.urlEncode(command) + "&1=" + LauncherUtils.urlEncode(field) + "&2=" + LauncherUtils.urlEncode(value);
    }

    public String getCommand() {
        return command;
    }

    public String getField() {
        return field;
    }

    public String getValue() {
        return value;
    }

    public String toString() {
        if (piggybackedJavaScript==null) {
            return getCommandURLString();
        }
        return getCommandURLString() + "\n" + getPiggybackedJavaScript();
    }
    
    @Override public boolean equals(Object obj) {
        if (!(obj instanceof RemoteCommand)) return false;
        if (obj == null) return false;
        return this.toString().equals(obj.toString());
    };

    /** Factory method to create a RemoteCommand from a wiki-style input string */
    public static RemoteCommand parse(String inputLine) {
        if (inputLine == null) throw new NullPointerException("inputLine must not be null");
        if (!inputLine.startsWith("cmd=")) throw new IllegalArgumentException("invalid command string, missing 'cmd='=" + inputLine);
        

        String[] parts = inputLine.split("\\&");
        HashMap<String,String> args = new HashMap<String,String>();
        for (String part : parts) {
            String[] pair = part.split("\\=");
            if (pair.length < 2) {
                args.put(pair[0], "");
            } else {
                try {
                    args.put(pair[0], URLDecoder.decode(pair[1], "utf-8").trim());
                } catch (UnsupportedEncodingException e) {
                    throw new RuntimeException("Bug! utf-8 isn't supported???");
                }
            }
            
        }
        
        String command = args.get("cmd");
        String arg1 = args.get("1");
        String arg2 = args.get("2");
        return new DefaultRemoteCommand(command, arg1, arg2);
    }

    public String getPiggybackedJavaScript() {
        return piggybackedJavaScript;
    }
}
