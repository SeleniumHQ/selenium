package com.thoughtworks.jsrmi;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
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
