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

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * This class knows how to marshal and unmarshal JsRmi objects
 * back and forth to java objects.
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
 */
public class Marshaller {
    private final Map idsToObjects = new HashMap();
    private final JsRmiInvoker jsRmiInvoker;

    public Marshaller(JsRmiInvoker jsRmiInvoker) {
        this.jsRmiInvoker = jsRmiInvoker;
    }

    public Object unmarshal(String jsrmiObject) {
        Pattern jsrmiObjectPattern = Pattern.compile("__JsObject__.*__[0-9]*");
        Matcher matcher = jsrmiObjectPattern.matcher(jsrmiObject);
        if(matcher.matches()) {
            return lookup(jsrmiObject);
        } else {
            return jsrmiObject;
        }
    }

    private JsObject lookup(String jsRmiReference) {
        JsObject jsObject = (JsObject) idsToObjects.get(jsRmiReference);
        if(jsObject == null) {
            jsObject = new JsObject(jsRmiReference, jsRmiInvoker);
            idsToObjects.put(jsRmiReference, jsObject);
        }
        return jsObject;
    }
}
