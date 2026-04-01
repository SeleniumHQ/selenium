// <copyright file="WebExtensionTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.WebExtension;

namespace OpenQA.Selenium.Tests.BiDi.WebExtension;

[IgnoreBrowser(Infrastructure.Browser.Chrome, ChromiumIgnoreReason)]
[IgnoreBrowser(Infrastructure.Browser.Edge, ChromiumIgnoreReason)]
internal class WebExtensionTests : BiDiTestFixture
{
    private const string ChromiumIgnoreReason = """
        The following test suite wants to set driver arguments via Options, but it breaks CDP/DevTools tests.
        The desired arguments (for Chromium only?):
        --enable-unsafe-extension-debugging
        --remote-debugging-pipe
        Ignoring these tests for now. Hopefully https://github.com/SeleniumHQ/selenium/issues/15536 will be resolved soon.
        """;

    [Test]
    public async Task CanInstallPathWebExtension()
    {
        string path = Path.GetFullPath("common/extensions/webextensions-selenium-example");

        var result = await bidi.WebExtension.InstallAsync(new ExtensionPath(path));

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Extension, Is.Not.Null);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Archived and Base64 extensions are not supported?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Archived and Base64 extensions are not supported?")]
    public async Task CanInstallArchiveWebExtension()
    {
        string path = LocateRelativePath("common/extensions/webextensions-selenium-example.zip");

        var result = await bidi.WebExtension.InstallAsync(new ExtensionArchivePath(path));

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Extension, Is.Not.Null);
    }

    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Chrome, "Archived and Base64 extensions are not supported?")]
    [IgnoreBrowser(Infrastructure.Browser.Edge, "Archived and Base64 extensions are not supported?")]
    public async Task CanInstallBase64WebExtension()
    {
        var path = LocateRelativePath("common/extensions/webextensions-selenium-example.zip");

        var bytes = File.ReadAllBytes(path);

        var result = await bidi.WebExtension.InstallAsync(new ExtensionBase64Encoded(bytes));

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Extension, Is.Not.Null);
    }

    [Test]
    public async Task CanUninstallExtension()
    {
        string path = LocateRelativePath("common/extensions/webextensions-selenium-example");

        var result = await bidi.WebExtension.InstallAsync(new ExtensionPath(path));

        await bidi.WebExtension.UninstallAsync(result.Extension);
    }

    private static string LocateRelativePath(string path)
    {
        try
        {
            var runfiles = Bazel.Runfiles.Create();
            string resolved = runfiles.Rlocation($"_main/{path}");
            if (!string.IsNullOrEmpty(resolved))
            {
                return resolved;
            }

            // For directories, locate a file inside and get parent (runfiles manifest only lists files)
            string manifestPath = runfiles.Rlocation($"_main/{path}/manifest.json");
            return Path.GetDirectoryName(manifestPath) ?? Path.GetFullPath(path);
        }
        catch (FileNotFoundException)
        {
            return Path.GetFullPath(path);
        }
    }
}
