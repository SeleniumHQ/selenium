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

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

/**
 * $Id: CompositeCommandTest.java,v 1.6 2004/11/15 18:35:02 ahelleso Exp $
 */
public class CompositeCommandTest extends MockObjectTestCase {

    public void testComponentsAreCalledOnceEachInOrder() throws Exception {
        Mock mock = mock(HTTPRequest.class);
        HTTPRequest httpRequest = (HTTPRequest) mock.proxy();

        CompositeCommand command = new CompositeCommand();
        Mock command1 = mock(RequestModificationCommand.class);
        Mock command2 = mock(RequestModificationCommand.class);
        command.addCommand((RequestModificationCommand) command1.proxy());
        command.addCommand((RequestModificationCommand) command2.proxy());

        command1.expects(once()).method("execute").with(same(httpRequest));
        command2.expects(once()).method("execute").with(same(httpRequest));

        command.execute(httpRequest);
    }
}
