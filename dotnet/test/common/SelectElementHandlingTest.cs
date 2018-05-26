using System.Collections.Generic;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class SelectElementHandlingTest : DriverTestFixture
    {
        [Test]
        public void ShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoices()
        {
            driver.Url = formsPage;

            IWebElement multiSelect = driver.FindElement(By.Id("multi"));
            ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));

            IWebElement option = options[0];
            Assert.IsTrue(option.Selected);
            option.Click();
            Assert.IsFalse(option.Selected);
            option.Click();
            Assert.IsTrue(option.Selected);

            option = options[2];
            Assert.IsTrue(option.Selected);
        }

        [Test]
        public void ShouldBeAbleToChangeTheSelectedOptionInASelect()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.XPath("//select[@name='selectomatic']"));
            ReadOnlyCollection<IWebElement> options = selectBox.FindElements(By.TagName("option"));
            IWebElement one = options[0];
            IWebElement two = options[1];
            Assert.IsTrue(one.Selected);
            Assert.IsFalse(two.Selected);

            two.Click();
            Assert.IsFalse(one.Selected);
            Assert.IsTrue(two.Selected);
        }

        [Test]
        public void ShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoices()
        {
            driver.Url = formsPage;

            IWebElement multiSelect = driver.FindElement(By.Id("multi"));
            ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));
            foreach (IWebElement option in options)
            {
                if (!option.Selected)
                {
                    option.Click();
                }
            }

            for (int i = 0; i < options.Count; i++)
            {
                IWebElement option = options[i];
                Assert.IsTrue(option.Selected, "Option at index is not selected but should be: " + i.ToString());
            }
        }

        [Test]
        public void ShouldSelectFirstOptionByDefaultIfNoneIsSelected()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.XPath("//select[@name='select-default']"));
            IList<IWebElement> options = selectBox.FindElements(By.TagName("option"));
            IWebElement one = options[0];
            IWebElement two = options[1];
            Assert.IsTrue(one.Selected);
            Assert.IsFalse(two.Selected);

            two.Click();
            Assert.IsFalse(one.Selected);
            Assert.IsTrue(two.Selected);
        }

        [Test]
        public void CanSelectElementsInOptGroups()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("two-in-group"));
            element.Click();
            Assert.IsTrue(element.Selected, "Expected to be selected");
        }

        [Test]
        public void CanGetValueFromOptionViaAttributeWhenAttributeDoesntExist()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.CssSelector("select[name='select-default'] option"));
            Assert.That(element.GetAttribute("value"), Is.EqualTo("One"));
            element = driver.FindElement(By.Id("blankOption"));
            Assert.That(element.GetAttribute("value"), Is.EqualTo(""));
        }

        [Test]
        public void CanGetValueFromOptionViaAttributeWhenAttributeIsEmptyString()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("optionEmptyValueSet"));
            Assert.That(element.GetAttribute("value"), Is.EqualTo(""));
        }

        [Test]
        public void CanSelectFromMultipleSelectWhereValueIsBelowVisibleRange()
        {
            driver.Url = selectPage;
            IWebElement option = driver.FindElements(By.CssSelector("#selectWithMultipleLongList option"))[4];
            option.Click();
            Assert.That(option.Selected, Is.EqualTo(true));
        }

        [Test]
        public void CannotSetDisabledOption()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#visibility .disabled"));
            element.Click();
            Assert.IsTrue(!element.Selected, "Expected to not be selected");
        }

        [Test]
        public void CanSetHiddenOption()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#visibility .hidden"));
            element.Click();
            Assert.IsTrue(element.Selected, "Expected to be selected");
        }

        [Test]
        public void CanSetInvisibleOption()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#visibility .invisible"));
            element.Click();
            Assert.IsTrue(element.Selected, "Expected to be selected");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Not yet implemented")]
        public void CanHandleTransparentSelect()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#transparent option"));
            element.Click();
            Assert.IsTrue(element.Selected, "Expected to be selected");
        }
    }
}
