package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestGoBack extends SeleneseTestNgHelper {
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
