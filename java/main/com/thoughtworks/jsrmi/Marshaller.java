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
 * @version $Revision: 1.1 $
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
