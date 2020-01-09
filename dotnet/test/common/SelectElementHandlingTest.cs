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
            Assert.That(option.Selected, Is.True);
            option.Click();
            Assert.That(option.Selected, Is.False);
            option.Click();
            Assert.That(option.Selected, Is.True);

            option = options[2];
            Assert.That(option.Selected, Is.True);
        }

        [Test]
        public void ShouldBeAbleToChangeTheSelectedOptionInASelect()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.XPath("//select[@name='selectomatic']"));
            ReadOnlyCollection<IWebElement> options = selectBox.FindElements(By.TagName("option"));
            IWebElement one = options[0];
            IWebElement two = options[1];
            Assert.That(one.Selected, Is.True);
            Assert.That(two.Selected, Is.False);

            two.Click();
            Assert.That(one.Selected, Is.False);
            Assert.That(two.Selected, Is.True);
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
                Assert.That(option.Selected, Is.True, "Option at index is not selected but should be: " + i.ToString());
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
            Assert.That(one.Selected, Is.True);
            Assert.That(two.Selected, Is.False);

            two.Click();
            Assert.That(one.Selected, Is.False);
            Assert.That(two.Selected, Is.True);
        }

        [Test]
        public void CanSelectElementsInOptGroups()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("two-in-group"));
            element.Click();
            Assert.That(element.Selected, Is.True, "Expected to be selected");
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
            Assert.That(option.Selected, Is.True);
        }

        [Test]
        public void CannotSetDisabledOption()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#visibility .disabled"));
            element.Click();
            Assert.That(element.Selected, Is.False, "Expected to not be selected");
        }

        [Test]
        public void CanSetHiddenOption()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#visibility .hidden"));
            element.Click();
            Assert.That(element.Selected, Is.True, "Expected to be selected");
        }

        [Test]
        public void CanSetInvisibleOption()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#visibility .invisible"));
            element.Click();
            Assert.That(element.Selected, Is.True, "Expected to be selected");
        }

        [Test]
        public void CanHandleTransparentSelect()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.CssSelector("#transparent option"));
            element.Click();
            Assert.That(element.Selected, Is.True, "Expected to be selected");
        }
    }
}
