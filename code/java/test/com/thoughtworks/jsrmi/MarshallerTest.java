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

import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.4 $
 */
public class MarshallerTest extends MockObjectTestCase {
    public void testShouldBeAbleToUnarshalTopLevelObjectToJavaObject() {
        String jsrmiObject = "__JsObject__TopLevel__0";
        Marshaller marshaller = new Marshaller(null);
        JsObject jsObject = (JsObject) marshaller.unmarshal(jsrmiObject);
        assertNotNull(jsObject);
    }

    public void testShouldReturnSameInstanceWhenUnmarshallingTwice() {
        String jsrmiObject = "__JsObject__TopLevel__0";
        Marshaller marshaller = new Marshaller(null);
        assertSame(marshaller.unmarshal(jsrmiObject), marshaller.unmarshal(jsrmiObject));
    }
}
