package com.thoughtworks.jsrmi;

import edu.emory.mathcs.util.concurrent.TimeoutException;

/**
 * Represents a remote Javascript object
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class JsObject {
    private final JsRmiInvoker jsRmiInvoker;
    private final String jsRmiReference;

    public JsObject(String jsRmiReference, JsRmiInvoker jsRmiInvoker) {
        this.jsRmiReference = jsRmiReference;
        this.jsRmiInvoker = jsRmiInvoker;
    }

    public Object invoke(String function, Object[] arguments) {
        String jsRmiInvocation = jsRmiReference + "." + function + toArgumentString(arguments);
        try {
            return jsRmiInvoker.invoke(jsRmiInvocation);
        } catch (TimeoutException e) {
            throw new RuntimeException(e);
        }
    }

    private String toArgumentString(Object[] arguments) {
        String argumentString = "";
        for (int i = 0; i < arguments.length; i++) {
            if (i == 0) {
                argumentString += "(";
            } else {
                argumentString += ",";
            }
            Object argument = arguments[i];
            String jsArgument = toJsObject(argument);
            argumentString += jsArgument;
        }
        if (arguments.length > 0) {
            argumentString += ")";
        }
        return argumentString;
    }

    public String toString() {
        return jsRmiReference;
    }

    private String toJsObject(Object argument) {
        if (argument instanceof String) {
            return "\"" + argument + "\"";
        } else if (argument instanceof Number) {
            return argument.toString();
        } else if (argument instanceof JsObject) {
            return argument.toString();
        } else {
            throw new RuntimeException("Unsupported type:" + argument.getClass());
        }
    }
}
