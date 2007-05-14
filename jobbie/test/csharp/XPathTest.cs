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

using System;
using System.IO;
using System.Text;
using System.Xml;
using System.Xml.XPath;
using System.Xml.Xsl;
using NUnit.Framework;

namespace WebDriver
{
    [TestFixture]
    public class XPathTest
    {
        private InternetExplorerDriver driver;
        private string resultPage = Path.GetFullPath(@"..\..\common\src\web\resultPage.html");

        [TestFixtureSetUp]
        public void TestFixtureSetup()
        {
            driver = new InternetExplorerDriver();
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

        [Test]
        [Ignore("SimonStewart: 2007-02-24: Finishing the refactoring of the NavigableDocument first")]
        public void ShouldAllowAnXsltToBeRunSuccessfully()
        {
            string xhtmlPage = "http://localhost/webdriver/xhtmlTest.html";
            driver.Get(xhtmlPage);

            XPathNavigator navigator = driver.CreateNavigator();
            XmlDocument xslDoc = new XmlDocument();
            xslDoc.LoadXml(
              @"<?xml version=""1.0""?>
                <xsl:stylesheet version=""1.0"" xmlns:xsl=""http://www.w3.org/1999/XSL/Transform"">
                    <xsl:template match=""/"">
                        <xsl:copy-of select="".""/>
                    </xsl:template>     
                </xsl:stylesheet>");

            XslCompiledTransform xsl = new XslCompiledTransform();
            xsl.Load(xslDoc);

            StringBuilder output = new StringBuilder();
            xsl.Transform(navigator, new XsltArgumentList(), new StringWriter(output));

            String result = output.ToString();

            // Do we get text in the body of the transformed document?
            Assert.IsTrue(result.Contains("XHTML Might Be The Future"), "No text from the body of the page");

            // Do we get tag's?
            Assert.IsTrue(result.Contains("<"), "No tags appear to have been opened");
            Assert.IsTrue(result.Contains("</body"), "The body tag has not been closed. Check that tags are being output");

            // Do we get the page's title?
            Assert.IsTrue(result.Contains("XHTML Test Page"), "No title seen");
        }

        [Test]
        [Ignore("SimonStewart: 2007-02-24: Finishing the refactoring of the NavigableDocument first")]
        public void ShouldReturnTheInnerXmlOfTheNavigableDocument()
        {
            string xhtmlPage = "http://localhost/webdriver/xhtmlTest.html";
            driver.Get(xhtmlPage);

            XPathNavigator navigator = driver.CreateNavigator();
            string result = navigator.InnerXml;

            Console.WriteLine(result);

            // Do we get text in the body of the transformed document?
            Assert.IsTrue(result.Contains("XHTML Might Be The Future"), "No text from the body of the page");

            // Do we get tag's?
            Assert.IsTrue(result.Contains("<"), "No tags appear to have been opened");
            Assert.IsTrue(result.Contains("</body"), "The body tag has not been closed. Check that tags are being output");

            // Do we get the page's title?
            Assert.IsTrue(result.Contains("XHTML Test Page"), "No title seen");
        }
    }
}