package com.thoughtworks.selenium

/**
 * The Groovy equivalent of SeleneseTestCase, as a GroovyTestCase.
 */
class GroovySeleneseTestCase extends GroovyTestCase {
    def base
    def baseMethods
    int defaultTimeout
    
    protected selenium
    
    GroovySeleneseTestCase() {
        super()
        
        base = new SeleneseTestBase()
        baseMethods = SeleneseTestBase.class.methods
        defaultTimeout = 60000
        
        instrumentSeleniumWithAndWait()
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
     * Adds "*AndWait" methods to the DefaultSelenium metaclass. New methods
     * are added for any API methods that do not begin with "is", "get", or
     * "waitFor".
     */
    private void instrumentSeleniumWithAndWait() {
        DefaultSelenium.class.methods.each { method ->
            def name = method.getName()
            if (name =~ /^(is|get|waitFor)/) {
                return
            }
            
            def newName = "${name}AndWait"
            if (DefaultSelenium.metaClass."${newName}" instanceof Closure) {
                return
            }
            
            switch (method.getParameterTypes().length) {
                case 0:
                    DefaultSelenium.metaClass."${newName}" = {
                        delegate."${name}"()
                        delegate.waitForPageToLoad("${defaultTimeout}")
                    }
                    break
                case 1:
                    DefaultSelenium.metaClass."${newName}" = { a ->
                        delegate."${name}"(a)
                        delegate.waitForPageToLoad("${defaultTimeout}")
                    }
                    break
                case 2:
                    DefaultSelenium.metaClass."${newName}" = { a, b ->
                        delegate."${name}"(a, b)
                        delegate.waitForPageToLoad("${defaultTimeout}")
                    }
                    break
            }
        }
    }
    
    /**
     * Convenience method for conditional waiting. Returns when the condition
     * is satisfied, or fails the test if the timeout is reached.
     *
     * @param timeout    maximum time to wait for condition to be satisfied, in
     *                   milliseconds. If unspecified, the default timeout is
     *                   used; the default value can be set with
     *                   setDefaultTimeout().
     * @param condition  the condition to wait for. The Closure should return
     *                   true when the condition is satisfied.
     */
    void waitFor(int timeout = defaultTimeout, Closure condition) {
        assert timeout > 0
        
        def timeoutTime = System.currentTimeMillis() + timeout
        while (System.currentTimeMillis() < timeoutTime) {
            try {
                if (condition.call()) {
                    return
                }
            }
            catch (e) {}
            sleep(1000)
        }
        
        fail('timeout')
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
