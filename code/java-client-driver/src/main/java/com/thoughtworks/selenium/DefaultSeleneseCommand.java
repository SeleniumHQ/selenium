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
 * The default implementation of the SeleneseCommand interface
 * 
 * @see com.thoughtworks.selenium.SeleneseCommand
 * @author Paul Hammant
 * @version $Revision$
 */
public class DefaultSeleneseCommand implements SeleneseCommand {
    // as we have beginning and ending pipes, we will have 1 more entry than we need
    private static final int NUMARGSINCLUDINGBOUNDARIES = 4;
    private static final int FIRSTINDEX = 1;
    private static final int SECONDINDEX = 2;
    private static final int THIRDINDEX = 3;
    private final String command;
    private final String field;
    private final String value;


    public DefaultSeleneseCommand(String command, String field, String value) {
        this.command = command;
        this.field = field;
        this.value = value;
    }

    public String getCommandString() {
        return "|" + command + "|" + field + "|" + value + "|";
    }
    
    public String toString() {
        return getCommandString();
    }

    /** Factory method to create a SeleneseCommand from a wiki-style input string */
    public static SeleneseCommand parse(String inputLine) {
        if (null == inputLine) throw new NullPointerException("inputLine can't be null");
        String[] values = inputLine.split("\\|");
        if (values.length != NUMARGSINCLUDINGBOUNDARIES) {
            throw new IllegalStateException("Cannot parse invalid line: " + inputLine + values.length);
        }
        return new DefaultSeleneseCommand(values[FIRSTINDEX], values[SECONDINDEX], values[THIRDINDEX]);
    }
}
