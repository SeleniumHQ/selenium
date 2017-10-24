using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestErrorChecking : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldAllowErrorChecking()
        {
		selenium.Open("../tests/html/test_click_page1.html");
		//  These tests should all fail, as they are checking the error checking commands. 
		try { Assert.AreEqual(selenium.GetText("link"), "Click here for next page"); Assert.Fail("expected failure"); } catch (Exception) {}
		try { Console.WriteLine("foo"); Assert.Fail("expected failure"); } catch (Exception) {}
		try { Assert.AreEqual(selenium.GetText("link"), "foo"); Assert.Fail("expected failure"); } catch (Exception) {}
		try { Assert.AreEqual(selenium.GetText("link"), "Click here for next page"); Assert.Fail("expected failure"); } catch (Exception) {}
		try { Assert.AreEqual(selenium.GetText("link"), "foo"); Assert.Fail("expected failure"); } catch (Exception) {}
		try { Assert.AreEqual(selenium.GetText("notAlink"), "foo"); Assert.Fail("expected failure"); } catch (Exception) {}
        }
    }
}
