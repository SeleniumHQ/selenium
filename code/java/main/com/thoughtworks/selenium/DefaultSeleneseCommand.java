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

package com.thoughtworks.selenium;

/**
 * @author Paul Hammant
 * @version $Revision$
 */
public class DefaultSeleneseCommand implements SeleneseCommand {

    public DefaultSeleneseCommand(String command, String field, String value) {
        this.command = command;
        this.field = field;
        this.value = value;
    }

    public final String command;
    public final String field;
    public final String value;

    public String getCommandString() {
        return "|" + command + "|" + field + "|" + value +"|";
    }

    public static SeleneseCommand parse(String inputLine) {
        int ix = inputLine.indexOf('|');
        int ix2 = inputLine.indexOf('|',ix+1);
        int ix3 = inputLine.indexOf('|',ix2+1);
        String command = inputLine.substring(1,ix);
        String field = inputLine.substring(ix + 1 ,ix2);
        String value = inputLine.substring(ix2 + 1, ix3);
        return new DefaultSeleneseCommand(command, field, value);
    }
}
