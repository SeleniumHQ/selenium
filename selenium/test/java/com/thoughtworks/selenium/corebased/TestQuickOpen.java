package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestQuickOpen extends SeleneseTestNgHelper {
	@Test public void testQuickOpen() throws Exception {
		// <tr>
		//       <td>setTimeout</td>
		//       <td>5000</td>
		//       <td>&nbsp;</td>
		//     </tr>
		selenium.open("../tests/html/test_open.html");
		selenium.open("../tests/html/test_page.slow.html");
		verifyTrue(selenium.isTextPresent("This is a slow-loading page"));
	}
}
