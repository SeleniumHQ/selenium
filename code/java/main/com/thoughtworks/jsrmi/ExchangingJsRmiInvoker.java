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
import edu.emory.mathcs.util.concurrent.TimeUnit;
import edu.emory.mathcs.util.concurrent.TimeoutException;

/**
 * Invoker that takes and gets from a queue. The same queues will be used by the HTTP server
 * on GET and POST.
 *
 * see http://altair.cs.oswego.edu/pipermail/concurrency-interest/2004-September/001035.html
 * @author Aslak Helles&oslash;y
 * @version $Revision$
 */
public class ExchangingJsRmiInvoker implements JsRmiInvoker {
    private final Exchanger exchanger;
    private final long timeout;

    public ExchangingJsRmiInvoker(Exchanger exchanger, long timeout) {
        this.exchanger = exchanger;
        this.timeout = timeout;
    }

    public ExchangingJsRmiInvoker(Exchanger exchanger) {
        this(exchanger, -1L);
    }

    public Object invoke(final String jsRmiInvocation) throws TimeoutException {
        try {
            if (timeout < 0) {
                return exchanger.exchange(jsRmiInvocation);
            } else {
                return exchanger.exchange(jsRmiInvocation, timeout, TimeUnit.MILLISECONDS);
            }
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
