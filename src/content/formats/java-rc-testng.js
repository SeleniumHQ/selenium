/*
 * Format for Selenium Remote Control Java client (TestNG)
 */

load('java-rc.js');

this.name = "java-rc-testng";

// TestNG reverses the order of assert functions
Equals.prototype.assert = function() {
	return "assertEquals(" + this.e2.toString() + ", " + this.e1.toString() + ");";
}

Equals.prototype.verify = function() {
	return "verifyEquals(" + this.e2.toString() + ", " + this.e1.toString() + ");";
}

options.superClass = "SeleneseTestNgHelper";

options.header =
	"package ${packageName};\n" +
	"\n" +
	"import com.thoughtworks.selenium.*;\n" +
	"import org.testng.annotations.*;\n" +
	"import static org.testng.Assert.*;\n" +
	"import java.util.regex.Pattern;\n" +
	"\n" +
    "public class ${className} extends ${superClass} {\n" + 
    "\t@Test public void ${methodName}() throws Exception {\n";

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />' +
	'<description>Package</description>' +
	'<textbox id="options_packageName" />' +
	'<description>Superclass</description>' +
	'<textbox id="options_superClass" />';