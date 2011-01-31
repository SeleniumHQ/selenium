package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestQuickOpen extends InternalSelenseTestNgBase {
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
