package com.thoughtworks.selenium

/**
 * The Groovy equivalent of SeleneseTestCase, as a GroovyTestCase.
 */
class GroovySeleneseTestCase extends GroovyTestCase {
    def base
    def baseMethods
    
    protected selenium
    
    GroovySeleneseTestCase() {
        super()
        base = new SeleneseTestBase()
        baseMethods = SeleneseTestBase.class.methods
    }
    
    @Override
    void setUp(String url = null, browserString = base.runtimeBrowserString()) {
        super.setUp()
        base.setUp(url, browserString)
        
        selenium = base.selenium
    }
    
    @Override
    void tearDown() {
        super.tearDown()
        base.tearDown()
    }
    
    void setTestContext() {
        selenium.setContext("${getClass().getSimpleName()}.${getName()}")
    }
    
    /**
     * Delegates missing method calls to the SeleneseTestBase object where
     * possible.
     *
     * @param name
     * @param args
     */
    def methodMissing(String name, args) {
        def method = baseMethods.find { it.getName() == name }
        if (method) {
            return method.invoke(base, args)
        }
        
        throw new MissingMethodException(name, getClass(), args)
    }
}
