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
 * @version $Id: SeleniumProxyTest.java,v 1.1 2004/11/11 12:19:49 mikemelia Exp $
 */
public class SeleniumProxyTest extends MockObjectTestCase {
    
    public void testInvokesAcceptMethodOnSocketStartsConnectionThreadAndFinishesIfExceptionThrown() {
//        // create a mock on both the SocketWrapper and ConnectionThread.
//        Mock mock = mock(ConnectionThreadSocketWrapper.class);
//        SocketWrapper socketWrapper = (SocketWrapper) mock.proxy();
//        ConnectionThread connectionThread = (ConnectionThread) mock.proxy();
//
//        // set the expectations.
//        mock.expects(atLeastOnce()).method("accept").withNoArguments().will(onConsecutiveCalls(
//                returnValue(connectionThread), throwException(new IOException("stop now"))));
//        mock.expects(once()).method("start").withNoArguments();
//        
//        // do the work.
//        SeleniumProxy proxy = new SeleniumProxy(socketWrapper);
//        try {
//            proxy.listenAndDispatch();
//            fail("IOException should have been thrown.");
//        } catch (IOException e) {
//            // expected this to happen.
//        }
    }
    
    private interface ConnectionThreadSocketWrapper extends ConnectionThread, SocketWrapper {
    }

}
