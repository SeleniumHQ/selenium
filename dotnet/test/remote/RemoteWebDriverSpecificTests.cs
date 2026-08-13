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

using System;
using NUnit.Framework;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;
using OpenQA.Selenium.Tests;
using OpenQA.Selenium.Tests.Infrastructure;
using OpenQA.Selenium.Tests.Infrastructure.Environment;

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
        EnvironmentManager.Instance.CloseCurrentDriver();
        DriverOptions options = OperatingSystem.IsWindows() ? new EdgeOptions() : new ChromeOptions();
        RemoteWebDriver noSlashDriver = new RemoteWebDriver(RemoteSeleniumServer.ServerUri, options);
        noSlashDriver.Url = Urls.JavascriptPage;
        noSlashDriver.Quit();
    }

    [Test]
    public void ShouldBeAbleToSendFileToRemoteServer()
    {
        IAllowsFileDetection fileDetectionDriver = Driver as IAllowsFileDetection;
        if (fileDetectionDriver == null)
        {
            Assert.That(Driver, Is.InstanceOf<IAllowsFileDetection>(), "driver does not support file detection. This should not be");
        }

        fileDetectionDriver.FileDetector = new LocalFileDetector();

        Driver.Url = Urls.UploadPage;
        IWebElement uploadElement = Driver.FindElement(By.Id("upload"));
        uploadElement.SendKeys(testFile.FullName);
        Driver.FindElement(By.Id("go")).Submit();

        Driver.SwitchTo().Frame("upload_target");

        IWebElement body = Driver.FindElement(By.XPath("//body"));
        Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + Driver.PageSource);
        Driver.SwitchTo().DefaultContent();
        uploadElement = Driver.FindElement(By.Id("upload"));
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
