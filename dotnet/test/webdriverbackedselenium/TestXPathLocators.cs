using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TesXPathLocators : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToUseXPathLocators()
        {
            selenium.Open("../tests/html/test_locators.html");
            Assert.AreEqual(selenium.GetText("xpath=//a"), "this is the first element");
            Assert.AreEqual(selenium.GetText("xpath=//a[@class='a2']"), "this is the second element");
            Assert.AreEqual(selenium.GetText("xpath=//*[@class='a2']"), "this is the second element");
            Assert.AreEqual(selenium.GetText("xpath=//a[2]"), "this is the second element");
            Assert.AreEqual(selenium.GetText("xpath=//a[position()=2]"), "this is the second element");
            Assert.IsFalse(selenium.IsElementPresent("xpath=//a[@href='foo']"));
            Assert.AreEqual(selenium.GetAttribute("xpath=//a[contains(@href,'#id1')]/@class"), "a1");
            Assert.IsTrue(selenium.IsElementPresent("xpath=//a[text()=\"this is the" + "\u00a0" + "third element\"]"));
            Assert.AreEqual(selenium.GetText("//a"), "this is the first element");
            Assert.AreEqual(selenium.GetAttribute("//a[contains(@href,'#id1')]/@class"), "a1");
            Assert.AreEqual(selenium.GetText("xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td"), "theCellText");
            selenium.Click("//input[@name='name2' and @value='yes']");
            Assert.IsTrue(selenium.IsElementPresent("xpath=//*[text()=\"right\"]"));
            Assert.AreEqual(selenium.GetValue("xpath=//div[@id='nested1']/div[1]//input[2]"), "nested3b");
            Assert.AreEqual(selenium.GetValue("xpath=id('nested1')/div[1]//input[2]"), "nested3b");
            Assert.AreEqual(selenium.GetValue("xpath=id('anotherNested')//div[contains(@id, 'useful')]//input"), "winner");
            selenium.AssignId("xpath=//*[text()=\"right\"]", "rightButton");
            Assert.IsTrue(selenium.IsElementPresent("rightButton"));
            Assert.AreEqual(selenium.GetXpathCount("id('nested1')/div[1]//input"), 2);
            Assert.AreEqual(selenium.GetXpathCount("//div[@id='nonexistent']"), 0);
            Assert.IsTrue(selenium.IsElementPresent("xpath=//a[@href=\"javascript:doFoo('a', 'b')\"]"));
            Assert.IsFalse(selenium.IsElementPresent("xpath=id('foo')//applet"));
            try
            {
                Assert.IsTrue(selenium.IsElementPresent("xpath=id('foo')//applet2"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }
            try
            {
                Assert.IsTrue(selenium.IsElementPresent("xpath=//a[0}"));
                Assert.Fail("expected Assert.Failure");
            }
            catch (Exception)
            {
            }

            // These cases are now covered by the "in play attributes" optimization.

            // <p>Test toggling of ignoreAttributesWithoutValue. The test must be performed using the
            // non-native ajaxslt engine. After the test, native xpaths are re-enabled.</p>
            // <table cellpadding="1" cellspacing="1" border="1">
            // <tbody>

            // <tr>
            // <td>allowNativeXpath</td>
            // <td>false</td>
            // <td>&nbsp;</td>
            // </tr>
            // <tr>
            // <td>ignoreAttributesWithoutValue</td>
            // <td>false</td>
            // <td>&nbsp;</td>
            // </tr>
            // <tr>
            // <td>verifyXpathCount</td>
            // <td>//div[@id='ignore']/a[@class]</td>
            // <td>2</td>
            // </tr>
            // <tr>
            // <td>verifyText</td>
            // <td>//div[@id='ignore']/a[@class][1]</td>
            // <td>over the rainbow</td>
            // </tr>
            // <tr>
            // <td>verifyText</td>
            // <td>//div[@id='ignore']/a[@class][2]</td>
            // <td>skies are blue</td>
            // </tr>
            // <tr>
            // <td>verifyXpathCount</td>
            // <td>//div[@id='ignore']/a[@class='']</td>
            // <td>1</td>
            // </tr>
            // <tr>
            // <td>verifyText</td>
            // <td>//div[@id='ignore']/a[@class='']</td>
            // <td>skies are blue</td>
            // </tr>
            // <tr>
            // <td>ignoreAttributesWithoutValue</td>
            // <td>true</td>
            // <td>&nbsp;</td>
            // </tr>
            // <tr>
            // <td>verifyXpathCount</td>
            // <td>//div[@id='ignore']/a[@class]</td>
            // <td>1</td>
            // </tr>
            // <tr>
            // <td>verifyText</td>
            // <td>//div[@id='ignore']/a[@class]</td>
            // <td>over the rainbow</td>
            // </tr>
            // <tr>
            // <td>verifyXpathCount</td>
            // <td>//div[@id='ignore']/a[@class='']</td>
            // <td>0</td>
            // </tr>
            // <tr>
            // <td>allowNativeXpath</td>
            // <td>true</td>
            // <td>&nbsp;</td>
            // </tr>
        }
    }
}
