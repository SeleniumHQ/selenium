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

package com.thoughtworks.selenium.b;

/**
 * @author Paul Hammant
 * @version $Revision: 1.1 $
 */
public class SeleneseCommand {

    public static final String seleneseIntro = "Selenese: ";

    public SeleneseCommand(String command, String field, String value) {
        this.command = command;
        this.field = field;
        this.value = value;
    }

    public final String command;
    public final String field;
    public final String value;

    public String toString() {
        return seleneseIntro + command + " | " + field + " | " + value;
    }

    public static SeleneseCommand parse(String inputLine) {
        int ix = inputLine.indexOf('|');
        int ix2 = inputLine.indexOf('|',ix+1);
        String command = inputLine.substring(seleneseIntro.length(),ix-1);
        String field = inputLine.substring(ix + 2 ,ix2-1);
        String value = inputLine.substring(ix2 + 2, inputLine.length());
        return new SeleneseCommand(command, field, value);
    }
}
