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
 * <p>Provides a <code>doCommand</code> method, which sends the command to the browser
 * to be performed, normally by implementing some kind of server.</p>
 *  
 * <p>If you implement this class, you are strongly encouraged to use the standard
 * <code>SeleneseQueue</code> object to manage your command queue.</p>
 *
 * @see com.thoughtworks.selenium.SeleneseQueue
 *  
 * @author Paul Hammant
 * @version $Revision$
 */
public interface CommandProcessor extends Startable {

    /** Send the specified Selenese command to the browser to be performed
     * 
     * @param command - the Selenese command verb
     * @param field - the first Selenese argument (meaning depends on the verb)
     * @param value - the second Selenese argument
     * @return - the command result, defined by the Selenese JavaScript.  "getX" style
     * commands may return data from the browser; other "doX" style commands may just
     * return "OK" or an error message.
     */
    String doCommand(String command, String field, String value);

    /** Starts the server */
    void start();

    /** Stops the server */
    void stop();
}
