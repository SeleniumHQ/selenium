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

import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.Executors;
import edu.emory.mathcs.util.concurrent.TimeoutException;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
 */
public class ExchangingJsRmiInvokerTest extends MockObjectTestCase {

    public void testShouldReturnObjectFromExchanger() throws TimeoutException {
        final Throwable[] exception = new Throwable[1];
        final Exchanger exchanger = new Exchanger();
        JsRmiInvoker jsRmiInvoker = new ExchangingJsRmiInvoker(exchanger);
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    assertEquals("some invocation", exchanger.exchange("some result"));
                } catch (Throwable e) {
                    exception[0] = e;
                }
            }
        });
        assertEquals("some result", jsRmiInvoker.invoke("some invocation"));
        assertNull(exception[0]);
    }

    public void testShouldWaitUntilObjectAvailableInTheFuture() {
        JsRmiInvoker jsRmiInvoker = new ExchangingJsRmiInvoker(new Exchanger(), 10);
        try {
            jsRmiInvoker.invoke(null);
            fail();
        } catch (TimeoutException expected) {
        }
    }
}
