// <copyright file="RemoteWebDriverSpecificTests.cs" company="Selenium Committers">
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
using OpenQA.Selenium.IE;
using System;

namespace OpenQA.Selenium.Remote;

[TestFixture]
public class RemoteWebDriverSpecificTests : DriverTestFixture
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
    [NeedsFreshDriver(IsCreatedAfterTest = true)]
    public void ShouldBeAbleToCreateRemoteWebDriverWithNoSlashAtEndOfUri()
    {
        Environment.EnvironmentManager.Instance.CloseCurrentDriver();
        RemoteWebDriver noSlashDriver = new RemoteWebDriver(new Uri("http://127.0.0.1:6000/wd/hub"), new InternetExplorerOptions());
        noSlashDriver.Url = javascriptPage;
        noSlashDriver.Quit();
    }

    [Test]
    public void ShouldBeAbleToSendFileToRemoteServer()
    {
        IAllowsFileDetection fileDetectionDriver = driver as IAllowsFileDetection;
        if (fileDetectionDriver == null)
        {
            Assert.That(driver, Is.InstanceOf<IAllowsFileDetection>(), "driver does not support file detection. This should not be");
        }

        fileDetectionDriver.FileDetector = new LocalFileDetector();

        driver.Url = uploadPage;
        IWebElement uploadElement = driver.FindElement(By.Id("upload"));
        uploadElement.SendKeys(testFile.FullName);
        driver.FindElement(By.Id("go")).Submit();

        driver.SwitchTo().Frame("upload_target");

        IWebElement body = driver.FindElement(By.XPath("//body"));
        Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + driver.PageSource);
        driver.SwitchTo().DefaultContent();
        uploadElement = driver.FindElement(By.Id("upload"));
        Console.WriteLine(uploadElement.Text);
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
