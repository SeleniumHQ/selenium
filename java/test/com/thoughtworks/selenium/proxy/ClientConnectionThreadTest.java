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

import org.jmock.MockObjectTestCase;

/**
 * @version $Id: ClientConnectionThreadTest.java,v 1.3 2004/11/13 05:45:01 ahelleso Exp $
 */
public class ClientConnectionThreadTest extends MockObjectTestCase {
    
    public void testRequestIsReadAndPassedToTheRelayAndTheResponseIsWrittenAndTheStreamsAreClosed() {
//        Mock mock = mock(RequestResponseRelay.class);
//        RequestInput requestStream = (RequestInput) mock.proxy();
//        ResponseStream responseStream = (ResponseStream) mock.proxy();
//        Relay relay = (Relay) mock.proxy();
//
//        HTTPRequest request = new HTTPRequest("this is a request");
//        mock.expects(once()).method("read").withNoArguments().will(returnValue(request));
//        String expectedResponse = "this is the response";
//        mock.expects(once()).method("relayMessage").with(same(request)).will(returnValue(expectedResponse));
//        mock.expects(once()).method("write").with(same(expectedResponse));
//        
//        ClientConnectionThread thread = new ClientConnectionThread(requestStream, responseStream);
//        thread.run();
    }
}
