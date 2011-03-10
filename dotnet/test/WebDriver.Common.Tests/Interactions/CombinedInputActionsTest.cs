using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class CombinedInputActionsTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.IE, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Firefox, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Chrome, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Remote, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.IPhone, "Shift-click implementation not complete")]
        [IgnoreBrowser(Browser.Android, "Shift-click implementation not complete")]
        public void ShouldAllowClickingOnFormElements()
        {
            driver.Url = formSelectionPage;

            ReadOnlyCollection<IWebElement> options = driver.FindElements(By.TagName("option"));

            IAction selectThreeOptions = GetBuilder().Click(options[1])
                .KeyDown(Keys.Shift)
                .Click(options[2])
                .Click(options[3])
                .KeyUp(Keys.Shift).Build();

            selectThreeOptions.Perform();

            IWebElement showButton = driver.FindElement(By.Name("showselected"));
            showButton.Click();

            IWebElement resultElement = driver.FindElement(By.Id("result"));
            Assert.AreEqual("roquefort parmigiano cheddar", resultElement.Text, "Should have picked the last three options.");
        }

        [Test]
        [IgnoreBrowser(Browser.IE, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Firefox, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Chrome, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Remote, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.IPhone, "Control-click implementation not complete")]
        [IgnoreBrowser(Browser.Android, "Control-click implementation not complete")]
        public void ShouldAllowSelectingMultipleItems()
        {
            driver.Url = selectableItemsPage;

            IWebElement reportingElement = driver.FindElement(By.Id("infodiv"));

            Assert.AreEqual("no info", reportingElement.Text);

            ReadOnlyCollection<IWebElement> listItems = driver.FindElements(By.TagName("li"));

            IAction selectThreeItems = GetBuilder().KeyDown(Keys.Control)
                .Click(listItems[1])
                .Click(listItems[3])
                .Click(listItems[5])
                .KeyUp(Keys.Control).Build();

            selectThreeItems.Perform();

            Assert.AreEqual("#item2 #item4 #item6", reportingElement.Text);

            // Now click on another element, make sure that's the only one selected.
            GetBuilder().Click(listItems[6]).Build().Perform();
            Assert.AreEqual("#item7", reportingElement.Text);
        }

        private IActionSequenceBuilder GetBuilder()
        {
            IHasInputDevices inputDevicesDriver = driver as IHasInputDevices;
            return inputDevicesDriver.ActionBuilder;
        }
    }
}
