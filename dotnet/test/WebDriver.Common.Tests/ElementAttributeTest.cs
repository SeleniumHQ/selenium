using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementAttributeTest : DriverTestFixture
    {
        [Test]
        public void ShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed()
        {
            driver.Url = simpleTestPage;
            IWebElement head = driver.FindElement(By.XPath("/html"));
            string attribute = head.GetAttribute("cheese");
            Assert.IsNull(attribute);
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Issue 758")]
        [IgnoreBrowser(Browser.IE, "Issue 758")]
        public void ShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag() 
        {
            driver.Url = simpleTestPage;
            IWebElement img = driver.FindElement(By.Id("invalidImgTag"));
            string attribute = img.GetAttribute("src");
            Assert.IsNull(attribute);
        }

        [Test]
        public void ShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty()
        {
            driver.Url = simpleTestPage;
            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.AreEqual(string.Empty, body.GetAttribute("style"));
        }

        [Test]
        public void ShouldReturnTheValueOfTheDisabledAttributeAsFalseIfNotSet()
        {
            driver.Url = formsPage;
            IWebElement inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
            Assert.AreEqual("false", inputElement.GetAttribute("disabled"));
            Assert.IsTrue(inputElement.Enabled);

            IWebElement pElement = driver.FindElement(By.Id("peas"));
            Assert.AreEqual("false", inputElement.GetAttribute("disabled"));
            Assert.IsTrue(inputElement.Enabled);
        }

        [Test]
        public void ShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing()
        {
            driver.Url = formsPage;

            IWebElement multiSelect = driver.FindElement(By.Id("multi"));
            ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));
            Assert.AreEqual("1", options[1].GetAttribute("index"));
        }


        [Test]
        public void ShouldIndicateTheElementsThatAreDisabledAreNotEnabled()
        {
            driver.Url = formsPage;
            IWebElement inputElement = driver.FindElement(By.XPath("//input[@id='notWorking']"));
            Assert.IsFalse(inputElement.Enabled);

            inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
            Assert.IsTrue(inputElement.Enabled);
        }

        [Test]
        public void ElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings()
        {
            driver.Url = formsPage;
            IWebElement disabledTextElement1 = driver.FindElement(By.Id("disabledTextElement1"));
            Assert.IsFalse(disabledTextElement1.Enabled);

            IWebElement disabledTextElement2 = driver.FindElement(By.Id("disabledTextElement2"));
            Assert.IsFalse(disabledTextElement2.Enabled);

            IWebElement disabledSubmitElement = driver.FindElement(By.Id("disabledSubmitElement"));
            Assert.IsFalse(disabledSubmitElement.Enabled);
        }

        [Test]
        public void ShouldIndicateWhenATextAreaIsDisabled()
        {
            driver.Url = formsPage;
            IWebElement textArea = driver.FindElement(By.XPath("//textarea[@id='notWorkingArea']"));
            Assert.IsFalse(textArea.Enabled);
        }

        [Test]
        public void ShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings()
        {
            driver.Url = formsPage;
            IWebElement disabledTextElement1 = driver.FindElement(By.Id("disabledTextElement1"));
            try
            {
                disabledTextElement1.SendKeys("foo");
                Assert.Fail("Should have thrown exception");
            }
            catch (NotSupportedException)
            {
                //Expected
            }

            Assert.AreEqual(string.Empty, disabledTextElement1.Text);

            IWebElement disabledTextElement2 = driver.FindElement(By.Id("disabledTextElement2"));
            try
            {
                disabledTextElement2.SendKeys("bar");
                Assert.Fail("Should have thrown exception");
            }
            catch (NotSupportedException)
            {
                //Expected
            }

            Assert.AreEqual(string.Empty, disabledTextElement2.Text);
        }

        [Test]
        public void ShouldIndicateWhenASelectIsDisabled()
        {
            driver.Url = formsPage;

            IWebElement enabled = driver.FindElement(By.Name("selectomatic"));
            IWebElement disabled = driver.FindElement(By.Name("no-select"));

            Assert.IsTrue(enabled.Enabled);
            Assert.IsFalse(disabled.Enabled);
        }

        [Test]
        public void ShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement checkbox = driver.FindElement(By.XPath("//input[@id='checky']"));
            Assert.AreEqual(null, checkbox.GetAttribute("checked"));
            checkbox.Select();
            Assert.AreEqual("true", checkbox.GetAttribute("checked"));
        }

        [Test]
        public void ShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement neverSelected = driver.FindElement(By.Id("cheese"));
            IWebElement initiallyNotSelected = driver.FindElement(By.Id("peas"));
            IWebElement initiallySelected = driver.FindElement(By.Id("cheese_and_peas"));

            Assert.AreEqual(null, neverSelected.GetAttribute("selected"), "false");
            Assert.AreEqual(null, initiallyNotSelected.GetAttribute("selected"), "false");
            Assert.AreEqual("true", initiallySelected.GetAttribute("selected"), "true");

            initiallyNotSelected.Select();
            Assert.AreEqual(null, neverSelected.GetAttribute("selected"));
            Assert.AreEqual("true", initiallyNotSelected.GetAttribute("selected"));
            Assert.AreEqual(null, initiallySelected.GetAttribute("selected"));
        }

        [Test]
        public void ShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.XPath("//select[@name='selectomatic']"));
            ReadOnlyCollection<IWebElement> options = selectBox.FindElements(By.TagName("option"));
            IWebElement one = options[0];
            IWebElement two = options[1];
            Assert.IsTrue(one.Selected);
            Assert.IsFalse(two.Selected);
            Assert.AreEqual("true", one.GetAttribute("selected"));
            Assert.AreEqual(null, two.GetAttribute("selected"));
        }

        [Test]
        public void ShouldReturnValueOfClassAttributeOfAnElement()
        {
            driver.Url = xhtmlTestPage;

            IWebElement heading = driver.FindElement(By.XPath("//h1"));
            String className = heading.GetAttribute("class");

            Assert.AreEqual("header", className);
        }

        [Test]
        public void ShouldReturnValueOfClassAttributeOfAnElementAfterSwitchingIFrame()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame("iframe1");

            IWebElement wallace = driver.FindElement(By.XPath("//div[@id='wallace']"));
            String className = wallace.GetAttribute("class");
            Assert.AreEqual("gromit", className);
        }

        [Test]
        public void ShouldReturnTheContentsOfATextAreaAsItsValue()
        {
            driver.Url = formsPage;

            String value = driver.FindElement(By.Id("withText")).Value;

            Assert.AreEqual("Example text", value);
        }

        [Test]
        public void ShouldTreatReadonlyAsAValue()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Name("readonly"));
            string readOnlyAttribute = element.GetAttribute("readonly");

            IWebElement textInput = driver.FindElement(By.Name("x"));
            string notReadOnly = textInput.GetAttribute("readonly");

            Assert.AreNotEqual(readOnlyAttribute, notReadOnly);
        }

        [Test]
        public void ShouldGetNumericAtribute()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("withText"));
            Assert.AreEqual("5", element.GetAttribute("rows"));
        }

        [Test]
        public void CanReturnATextApproximationOfTheStyleAttribute()
        {
            driver.Url = javascriptPage;
            string style = driver.FindElement(By.Id("red-item")).GetAttribute("style");

            Assert.IsTrue(style.ToLower().Contains("background-color"));
        }

        public void ShouldCorrectlyReportValueOfColspan()
        {
            driver.Url = tables;
            System.Threading.Thread.Sleep(1000);

            IWebElement th1 = driver.FindElement(By.Id("th1"));
            IWebElement td2 = driver.FindElement(By.Id("td2"));

            Assert.AreEqual("th1", th1.GetAttribute("id"), "th1 id");
            Assert.AreEqual("3", th1.GetAttribute("colspan"), "th1 colspan should be 3");

            Assert.AreEqual("td2", td2.GetAttribute("id"), "td2 id");
            Assert.AreEqual("2", td2.GetAttribute("colspan"), "td2 colspan should be 2");
        }

    }
}
