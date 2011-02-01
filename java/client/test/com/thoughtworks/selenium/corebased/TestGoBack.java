package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestGoBack extends InternalSelenseTestNgBase {
	@Test public void testGoBack() throws Exception {
		selenium.open("../tests/html/test_click_page1.html");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		//  Click a regular link 
		selenium.click("link");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.goBack();
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		//  history.forward() generates 'Permission Denied' in IE 
		//     <tr>
		//       <td>goForward</td>
		//       <td>&nbsp;</td>
		//       <td>&nbsp;</td>
		//     </tr>
		//     <tr>
		//       <td>verifyTitle</td>
		//       <td>Click Page Target</td>
		//       <td>&nbsp;</td>
		//     </tr>
		//     
	}
}
