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

using System.IO;
using NUnit.Framework;

namespace WebDriver
{
    [TestFixture]
    public class XPathTest
    {
        private IeWrapper driver;
        private string resultPage = Path.GetFullPath(@"..\..\common\src\web\resultPage.html");

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
            resultPage = Path.GetFullPath(@"..\..\common\src\web\resultPage.html");
            driver.Get(resultPage);
        }

        [Test]
        public void WillReturnTitleOfDocument()
        {
            string text = driver.SelectTextWithXPath("/html/head/title");
            Assert.AreEqual("We Arrive Here", text);
        }

        [Test]
        public void WillReturnFirstResultForMatch()
        {
            string text = driver.SelectTextWithXPath("//li");
            Assert.AreEqual("Item 1", text);
        }

        [Test]
        public void WillReturnValueOfAttributesWhenAskedForText()
        {
            string text = driver.SelectTextWithXPath("//@class");
            Assert.AreEqual("items", text);
        }

        [Test]
        public void WillReturnNullIfThereAreNoMatches()
        {
            string text = driver.SelectTextWithXPath("//uglyFoo");
            Assert.IsNull(text);
        }

        [Test]
        public void WillHandleBeingAskedIfTwoNavigableDocumentsAreInTheSamePlace()
        {
            string text = driver.SelectTextWithXPath("//div/h1");
            Assert.AreEqual("List of stuff", text);
        }
    }
}