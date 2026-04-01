// <copyright file="SetFilesTests.cs" company="Selenium Committers">
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

using System.IO;
using OpenQA.Selenium.BiDi.BrowsingContext;

namespace OpenQA.Selenium.Tests.BiDi.Input;

internal class SetFilesTests : BiDiTestFixture
{
    private string _tempFile;

    [SetUp]
    public void SetUp()
    {
        _tempFile = Path.GetTempFileName();
    }

    [TearDown]
    public void TearDown()
    {
        File.Delete(_tempFile);
    }

    [Test]
    public async Task CanSetFiles()
    {
        driver.Url = UrlBuilder.WhereIs("formPage.html");

        var nodesResult = await context.LocateNodesAsync(new CssLocator("[id='upload']"));

        await context.Input.SetFilesAsync(nodesResult.Nodes[0], [_tempFile]);

        Assert.That(driver.FindElement(By.Id("upload")).GetAttribute("value"), Does.EndWith(Path.GetFileName(_tempFile)));
    }
}
