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

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

/**
 * This class is a composite holding RequestModificationCommands.
 * Any commands added to the composite will be executed in order.
 * All registered commands will be able to modify the same request.
 * CAUTION - order of execution may be important.
 * $Id: CompositeCommand.java,v 1.5 2004/11/15 18:35:00 ahelleso Exp $
 */
public class CompositeCommand implements RequestModificationCommand {
    private final List components = new LinkedList();

    /**
     * @see RequestModificationCommand#execute
     */
    public void execute(HTTPRequest request) {
        Assert.assertIsTrue(request != null, "request can't be null");

        for (Iterator i = components.iterator(); i.hasNext();) {
            ((RequestModificationCommand) i.next()).execute(request);
        }
    }

    /**
     * Adds a command to the list of commands to be executed.
     * @param command the new command.
     */
    public void addCommand(RequestModificationCommand command) {
        Assert.assertIsTrue(command != null, "command can't be null");
        components.add(command);
    }
}
