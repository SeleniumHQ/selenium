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
package com.thoughtworks.jsrmi;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.4 $
 */
public class JsObjectTest extends MockObjectTestCase {

    public void testShouldTranslateInvokeToJsRmiInvocation() {
        Mock jsRmiInvoker = mock(JsRmiInvoker.class);
        jsRmiInvoker.expects(once()).method("invoke").with(eq("__JsObject__TopLevel__0.whatever(2,\"Hello\",__JsObject__TopLevel__0)"));

        JsObject jsObject = new JsObject("__JsObject__TopLevel__0", (JsRmiInvoker) jsRmiInvoker.proxy());
        jsObject.invoke("whatever", new Object[]{
            new Integer(2),
            "Hello",
            jsObject
        });
    }
}
