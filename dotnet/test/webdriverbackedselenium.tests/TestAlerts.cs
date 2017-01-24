using System;
using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestAlerts : SeleniumTestCaseBase
    {
        [Test]
        public void testAlerts()
        {
            selenium.Open("../tests/html/test_verify_alert.html");
            Assert.IsFalse(selenium.IsAlertPresent());
            selenium.Click("oneAlert");
            Assert.IsTrue(selenium.IsAlertPresent());
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try { if (selenium.IsAlertPresent()) break; }
                catch (Exception) { }
                System.Threading.Thread.Sleep(1000);
            }

            Assert.IsTrue(selenium.IsAlertPresent());
            Assert.AreEqual(selenium.GetAlert(), "Store Below 494 degrees K!");
            selenium.Click("multipleLineAlert");
            Assert.AreEqual(selenium.GetAlert(), "This alert spans multiple lines");
            selenium.Click("oneAlert");
            string myVar = selenium.GetAlert();
            Assert.AreEqual(myVar, "Store Below 494 degrees K!");
            selenium.Click("twoAlerts");
            Assert.IsTrue(Regex.IsMatch(selenium.GetAlert(), "^[\\s\\S]* 220 degrees C!$"));
            Assert.IsTrue(Regex.IsMatch(selenium.GetAlert(), "^Store Below 429 degrees F!"));
            selenium.Click("alertAndLeave");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual(selenium.GetAlert(), "I'm Melting! I'm Melting!");
            string alertText = string.Empty;
            selenium.Open("../tests/html/test_verify_alert.html");
            try 
            {
                alertText = selenium.GetAlert();
                Assert.AreEqual(alertText, "noAlert");
                Assert.Fail("expected failure"); 
            }
            catch (Exception) 
            {
            }

            selenium.Click("oneAlert");
            try 
            { 
                alertText = selenium.GetAlert();
                Assert.AreEqual(alertText, "wrongAlert"); 
                Assert.Fail("expected failure");
            }
            catch (Exception) 
            { 
            }

            selenium.Click("twoAlerts");
            try 
            { 
                alertText = selenium.GetAlert();
                Assert.AreEqual(alertText, "Store Below 429 degrees F!"); 
                Assert.Fail("expected failure"); 
            }
            catch (Exception)
            { 
            }
            
            try 
            { 
                alertText = selenium.GetAlert();
                Assert.AreEqual(alertText, "Store Below 220 degrees C!");
                Assert.Fail("expected failure"); 
            }
            catch (Exception) 
            {
            }
            
            selenium.Click("oneAlert");
            try
            {
                selenium.Open("../tests/html/test_verify_alert.html"); 
                Assert.Fail("expected failure"); 
            }
            catch (Exception)
            {
            }
        }
    }
}
