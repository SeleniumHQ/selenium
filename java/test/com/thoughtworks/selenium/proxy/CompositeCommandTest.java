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
import junit.framework.TestCase;

/**
 * $Id: CompositeCommandTest.java,v 1.1 2004/11/11 12:19:48 mikemelia Exp $
 */
public class CompositeCommandTest extends TestCase {
    public void testIsARequestModificationCommand() {
        assertTrue(RequestModificationCommand.class.isAssignableFrom(CompositeCommand.class));
    }

    public void testComponentsAreCalledOnceEach() throws Exception {
        DummyCommand dummy1 = new DummyCommand();
        DummyCommand dummy2 = new DummyCommand();

        CompositeCommand command = new CompositeCommand();

        command.addCommand(dummy1);
        command.addCommand(dummy2);

        command.execute(null);

        assertEquals(1, dummy1.getCallCount());
        assertEquals(1, dummy2.getCallCount());
    }


    private class DummyCommand implements RequestModificationCommand {
        private int callCount;

        public DummyCommand() {
        }

        public void execute(HTTPRequest request) {
            ++callCount;
        }

        public int getCallCount() {
            return callCount;
        }
    }
}
