package com.thoughtworks.jsrmi;

import edu.emory.mathcs.util.concurrent.TimeoutException;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public interface JsRmiInvoker {
    Object invoke(String jsRmiInvocation) throws TimeoutException;
}
