package com.thoughtworks.jsrmi;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.2 $
 */
public class JsObjectTest extends MockObjectTestCase {

    public void testShouldTranslateInvokeToJsRmiInvocation() {
        Mock jsRmiInvoker = mock(JsRmiInvoker.class);
        jsRmiInvoker.expects(once()).method("invoke").with(eq("__JsObject__TopLevel__0.whatever(2,\"Hello\",__JsObject__TopLevel__0)"));

        JsObject jsObject = new JsObject("__JsObject__TopLevel__0", (JsRmiInvoker) jsRmiInvoker.proxy());
        jsObject.invoke("whatever", new Object[]{
            new Integer(2),
            "Hello",
            jsObject
        });
    }
}
