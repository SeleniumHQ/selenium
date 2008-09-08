package com.thoughtworks.selenium

import junit.framework.AssertionFailedError

class GroovySeleneseTestCaseTest extends GroovyTestCase {
    def testcase
    
    @Override
    void setUp() {
        super.setUp()
        testcase = new GroovySeleneseTestCase()
    }
    
    void testWaitForSucceeds() {
        def then = System.currentTimeMillis()
        testcase.waitFor(2000, { System.currentTimeMillis() >= then + 100 })
    }
    
    void testWaitForTimesOut() {
        try {
            testcase.waitFor(1000, { false })
            fail('Expected AssertionFailedError, but none thrown')
        }
        catch (AssertionFailedError afe) {
            assertEquals('timeout', afe.getMessage())
        }
    }
    
    void testMethodMissingIsResolvable() {
        assertNotNull(testcase.getBase().class.methods.find {
            it.getName() == 'getText'
        })
        shouldFailWithCause(NullPointerException.class, {
            testcase.getText()
        })
    }
    
    void testMethodMissingIsNotResolvable() {
        shouldFail(MissingMethodException.class, {
            testcase.unresolvableMethod()
        })
    }
}
