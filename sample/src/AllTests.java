import junit.framework.Test;
import junit.framework.TestSuite;
import junit.textui.TestRunner;

public class AllTests extends TestSuite {
  
  public AllTests(String name) {
    super(name);
  }

  public static void main(String[] args) {
    TestRunner.run(suite());
  }

  public static Test suite() {
    TestSuite suite = new AllTests("Example Tests");
    suite.addTestSuite(ExampleSeleniumTest.class);
    return suite;
  }
  
}
