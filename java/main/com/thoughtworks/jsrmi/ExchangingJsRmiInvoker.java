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
 * @version $Revision: 1.1 $
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
            if(timeout < 0) {
                return exchanger.exchange(jsRmiInvocation);
            } else {
                return exchanger.exchange(jsRmiInvocation, timeout, TimeUnit.MILLISECONDS);
            }
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
