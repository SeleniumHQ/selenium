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

import edu.emory.mathcs.util.concurrent.TimeoutException;

/**
 * Represents a remote Javascript object
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
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
