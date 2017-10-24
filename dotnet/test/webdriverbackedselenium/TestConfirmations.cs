using System;
using NUnit.Framework;
using System.Text.RegularExpressions;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestConfirmations : SeleniumTestCaseBase
    {
        [Test]
        public void Confirmations()
        {
            selenium.Open("../tests/html/test_confirm.html");
            selenium.ChooseCancelOnNextConfirmation();
            selenium.Click("confirmAndLeave");
            Assert.IsTrue(selenium.IsConfirmationPresent());
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (selenium.IsConfirmationPresent())
                    {
                        break;
                    }
                }
                catch (Exception) { }
                System.Threading.Thread.Sleep(1000);
            }

            Assert.IsTrue(selenium.IsConfirmationPresent());
            Assert.AreEqual(selenium.GetConfirmation(), "You are about to go to a dummy page.");
            Assert.AreEqual(selenium.GetTitle(), "Test Confirm");
            selenium.Click("confirmAndLeave");
            selenium.WaitForPageToLoad("30000");
            Assert.IsTrue(Regex.IsMatch(selenium.GetConfirmation(), "^[\\s\\S]*dummy page[\\s\\S]*$"));
            Assert.AreEqual(selenium.GetTitle(), "Dummy Page");
            selenium.Open("../tests/html/test_confirm.html");
            Assert.AreEqual(selenium.GetTitle(), "Test Confirm");
            selenium.ChooseCancelOnNextConfirmation();
            selenium.ChooseOkOnNextConfirmation();
            selenium.Click("confirmAndLeave");
            selenium.WaitForPageToLoad("30000");
            Assert.IsTrue(Regex.IsMatch(selenium.GetConfirmation(), "^[\\s\\S]*dummy page[\\s\\S]*$"));
            Assert.AreEqual(selenium.GetTitle(), "Dummy Page");
            selenium.Open("../tests/html/test_confirm.html");
            try
            {
                Assert.AreEqual(selenium.GetConfirmation(), "This should fail - there are no confirmations");
                Assert.Fail("expected failure");
            }
            catch (Exception) { }

            selenium.Click("confirmAndLeave");
            selenium.WaitForPageToLoad("30000");
            try
            {
                Assert.AreEqual(selenium.GetConfirmation(), "this should fail - wrong confirmation"); 
                Assert.Fail("expected failure");
            }
            catch (Exception) { }
            
            selenium.Open("../tests/html/test_confirm.html");
            selenium.Click("confirmAndLeave");
            selenium.WaitForPageToLoad("30000");
            try
            {
                selenium.Open("../tests/html/test_confirm.html");
                Assert.Fail("expected failure");
            }
            catch (Exception) { }
        }
    }
}
