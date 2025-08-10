// <copyright file="UploadTest.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium;

[TestFixture]
public class UploadTest : DriverTestFixture
{
    private const string LoremIpsumText = "lorem ipsum dolor sit amet";
    private const string FileHtml = "<div>" + LoremIpsumText + "</div>";
    private System.IO.FileInfo testFile;

    [OneTimeSetUp]
    public void Setup()
    {
        CreateTempFile(FileHtml);
    }

    [OneTimeTearDown]
    public void Teardown()
    {
        if (testFile != null && testFile.Exists)
        {
            testFile.Delete();
        }
    }

    [Test]
    public void ShouldAllowFileUploading()
    {
        driver.Url = uploadPage;
        driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
        driver.FindElement(By.Id("go")).Submit();

        driver.SwitchTo().Frame("upload_target");

        IWebElement body = null;
        WaitFor(() =>
        {
            body = driver.FindElement(By.CssSelector("body"));
            return body.Text.Contains(LoremIpsumText);
        }, "Page source is: " + driver.PageSource);
        Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + driver.PageSource);
    }

    [Test]
    public void CleanFileInput()
    {
        driver.Url = uploadPage;
        IWebElement element = driver.FindElement(By.Id("upload"));
        element.SendKeys(testFile.FullName);
        element.Clear();
        Assert.That(element.GetAttribute("value"), Is.Empty);
    }

    [Test]
    public void ClickFileInput()
    {
        driver.Url = uploadPage;
        IWebElement element = driver.FindElement(By.Id("upload"));
        Assert.That(() => element.Click(), Throws.InstanceOf<WebDriverException>());
    }

    [Test]
    public void UploadingWithHiddenFileInput()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("upload_invisible.html");
        driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
        driver.FindElement(By.Id("go")).Click();

        // Uploading files across a network may take a while, even if they're really small
        IWebElement label = driver.FindElement(By.Id("upload_label"));
        driver.SwitchTo().Frame("upload_target");

        IWebElement body = null;
        WaitFor(() =>
        {
            body = driver.FindElement(By.XPath("//body"));
            return body.Text.Contains(LoremIpsumText);
        }, "Page source is: " + driver.PageSource);
        Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + driver.PageSource);

    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void ShouldAllowFileUploadingUsingTransparentUploadElement()
    {
        driver.Url = transparentUploadPage;
        driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
        driver.FindElement(By.Id("go")).Submit();

        driver.SwitchTo().Frame("upload_target");

        IWebElement body = null;
        WaitFor(() =>
        {
            body = driver.FindElement(By.XPath("//body"));
            return body.Text.Contains(LoremIpsumText);
        }, "Page source is: " + driver.PageSource);
        Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + driver.PageSource);
        driver.Url = "about:blank";
    }

    private void CreateTempFile(string content)
    {
        string testFileName = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, "webdriver.tmp");
        testFile = new System.IO.FileInfo(testFileName);
        if (testFile.Exists)
        {
            testFile.Delete();
        }
        System.IO.StreamWriter testFileWriter = testFile.CreateText();
        testFileWriter.WriteLine(content);
        testFileWriter.Close();
    }
}
