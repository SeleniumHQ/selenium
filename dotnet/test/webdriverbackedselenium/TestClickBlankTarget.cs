using System;
using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestClickBlankTarget : SeleniumTestCaseBase
    {
        [Ignore("Incorrect test")]
        public void ClickBlankTarget()
        {
            selenium.Open("../tests/html/Frames.html");
            selenium.SelectFrame("bottomFrame");
            selenium.Click("changeBlank");
            selenium.WaitForPopUp("_blank", "10000");
            selenium.SelectWindow("_blank");
            selenium.Click("changeSpan");
            selenium.Close();
            selenium.SelectWindow("null");
            selenium.Click("changeBlank");
            selenium.WaitForPopUp("_blank", "10000");
            selenium.SelectWindow("_blank");
            selenium.Click("changeSpan");
            selenium.Close();
            selenium.SelectWindow("null");
            selenium.Submit("formBlank");
            selenium.WaitForPopUp("_blank", "10000");
            selenium.SelectWindow("_blank");
            selenium.Click("changeSpan");
            selenium.Close();
            selenium.SelectWindow("null");
            selenium.Open("../tests/html/test_select_window.html");
            selenium.Click("popupBlank");
            selenium.WaitForPopUp("_blank", "10000");
            selenium.SelectWindow("_blank");
            Console.WriteLine("At the end");
            Assert.AreEqual("Select Window Popup", selenium.GetTitle());
            selenium.Close();
            selenium.SelectWindow("null");
        }
    }
}
