/*
 * Format for Selenium Remote Control Java client (TestNG)
 */

load('java-rc.js');

this.name = "java-rc-testng";

options.superClass = "SeleneseTestNgHelper";

options.header =
	"package ${packageName};\n" +
	"\n" +
	"import com.thoughtworks.selenium.*;\n" +
	"import org.testng.*;\n" +
	"import static org.testng.Assert.*;\n" +
	"import java.util.regex.Pattern;\n" +
	"\n" +
    "public class ${className} extends ${superClass} {\n" + 
    "\t@Test public void ${methodName}() throws Exception {\n";
