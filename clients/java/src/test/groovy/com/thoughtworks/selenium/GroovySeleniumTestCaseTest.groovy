import com.thoughtworks.selenium.GroovySeleniumTestCase

class GroovySeleniumTestCaseTest extends GroovyTestCase {
    def testcase
    
    @Override
    void setUp() {
        super.setUp()
        testcase = new GroovySeleniumTestCase()
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
