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

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import com.thoughtworks.selenium.utils.Assert;

/**
 * $Id: CompositeCommand.java,v 1.1 2004/11/11 12:19:47 mikemelia Exp $
 */
public class CompositeCommand implements RequestModificationCommand {
    private final List components = new LinkedList();

    public void execute(HTTPRequest request) {
        Assert.assertIsTrue(request != null, "request can't be null");

        for (Iterator i = components.iterator(); i.hasNext();) {
            ((RequestModificationCommand) i.next()).execute(request);
        }
    }

    public void addCommand(RequestModificationCommand command) {
        Assert.assertIsTrue(command != null, "command can't be null");
        components.add(command);
    }
}
