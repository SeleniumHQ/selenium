/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

using NUnit.Framework;
using WebDriver;

namespace Test
{
    [TestFixture]
    public class IeWrapperJavascriptTest
    {
        private WebDriver.WebDriver driver;

        [TestFixtureSetUp]
        public void TestFixtureSetup()
        {
            driver = new IeWrapper();
            driver.Visible = true;
        }

        [TestFixtureTearDown]
        public void TestFixtureTearDown()
        {
            driver.Close();
        }
        
        [SetUp]
        public void SetUp()
        {
            driver.Get("http://localhost/webdriver/javascriptPage.html");
        }
        
        [Test]
        public void WillSimulateAKeyUpWhenEnteringTextIntoInputElements()
        {
            WebElement element = driver.SelectElement("//input[@id='keyUp']");
            element.Value = "I like cheese";

            WebElement result = driver.SelectElement("//div[@id='result']");
            Assert.AreEqual("I like cheese", result.Text);
        }
        
        [Test]
        public void WillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
            WebElement element = driver.SelectElement("//input[@id='keyDown']");
            element.Value = "I like cheese";

            WebElement result = driver.SelectElement("//div[@id='result']");
            // Because the key down gets the result before the input element is filled, we're a letter short here
            Assert.AreEqual("I like chees", result.Text);
        }

        [Test]
        public void WillSimulateAKeyPressWhenEnteringTextIntoInputElements()
        {
            WebElement element = driver.SelectElement("//input[@id='keyPress']");
            element.Value = "I like cheese";

            WebElement result = driver.SelectElement("//div[@id='result']");
            // Because the key down gets the result before the input element is filled, we're a letter short here
            Assert.AreEqual("I like chees", result.Text);
        }

        [Test]
        public void WillSimulateAKeyUpWhenEnteringTextIntoTextAreas()
        {
            WebElement element = driver.SelectElement("//textarea[@id='keyUpArea']");
            element.Value = "I like cheese";

            WebElement result = driver.SelectElement("//div[@id='result']");
            Assert.AreEqual("I like cheese", result.Text);
        }

        [Test]
        public void WillSimulateAKeyDownWhenEnteringTextIntoTextAreas()
        {
            WebElement element = driver.SelectElement("//textarea[@id='keyDownArea']");
            element.Value = "I like cheese";

            WebElement result = driver.SelectElement("//div[@id='result']");
            // Because the key down gets the result before the input element is filled, we're a letter short here
            Assert.AreEqual("I like chees", result.Text);
        }

        [Test]
        public void WillSimulateAKeyPressWhenEnteringTextIntoTextAreas()
        {
            WebElement element = driver.SelectElement("//textarea[@id='keyPressArea']");
            element.Value = "I like cheese";

            WebElement result = driver.SelectElement("//div[@id='result']");
            // Because the key down gets the result before the input element is filled, we're a letter short here
            Assert.AreEqual("I like chees", result.Text);
        }

        [Test]
        public void ShouldIssueMouseDownEvents()
        {
            driver.SelectElement("//div[@id='mousedown']").Click();

            string result = driver.SelectElement("//div[@id='result']").Text;
            Assert.AreEqual("mouse down", result);
        }

        [Test]
        public void ShouldIssueClickEvents()
        {
            driver.SelectElement("//div[@id='mouseclick']").Click();

            string result = driver.SelectElement("//div[@id='result']").Text;
            Assert.AreEqual("mouse click", result);
        }

        [Test]
        public void ShouldIssueMouseUpEvents()
        {
            driver.SelectElement("//div[@id='mouseup']").Click();

            string result = driver.SelectElement("//div[@id='result']").Text;
            Assert.AreEqual("mouse up", result);
        }

        [Test]
        public void MouseEventsShouldBubbleUpToContainingElements()
        {
            driver.SelectElement("//p[@id='child']").Click();

            string result = driver.SelectElement("//div[@id='result']").Text;
            Assert.AreEqual("mouse down", result);
        }
    }
}
