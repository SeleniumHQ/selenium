package com.thoughtworks.selenium.proxy;

import junit.framework.TestCase;

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

/**
 * @version $Id: RemoveLocalhostServerNameCommandTest.java,v 1.1 2004/11/11 12:19:49 mikemelia Exp $
 */
public class RemoveLocalhostServerNameCommandTest extends TestCase {
    
    public void testIsARequestModificationCommand() {
        assertTrue(RequestModificationCommand.class.isAssignableFrom(RemoveLocalhostServerNameCommand.class));
    }
    
    public void testServerNameAndProtocolRemovedFromUrlIfLocalHost() {
        String dir = "/site/";
        String host = "localhost:8000";
        String uri = host + dir;
        HTTPRequest httpRequest = new HTTPRequest("GET: http://" + uri + HTTPRequest.CRLF);
        RemoveLocalhostServerNameCommand command = new RemoveLocalhostServerNameCommand();
        command.execute(httpRequest);
        assertEquals(dir, httpRequest.getUri());
        
    }
}
