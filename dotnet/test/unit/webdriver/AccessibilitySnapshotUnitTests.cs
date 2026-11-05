// <copyright file="AccessibilitySnapshotUnitTests.cs" company="Selenium Committers">
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

using Moq;

namespace OpenQA.Selenium.Tests;

/// <summary>
/// A session without BiDi cannot take an accessibility snapshot, and says so.
/// </summary>
public class AccessibilitySnapshotUnitTests
{
    [Test]
    public void GetAccessibilitySnapshotAsync_DriverWithoutBiDi_ThrowsUnsupportedOperationException()
    {
        using WebDriver driver = StartDriverWithoutBiDi();

        Assert.That(async () => await driver.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<UnsupportedOperationException>().With.Message.Contains("BiDi"));
    }

    [Test]
    public void GetAccessibilitySnapshotAsync_ElementWithoutBiDi_ThrowsUnsupportedOperationException()
    {
        using WebDriver driver = StartDriverWithoutBiDi();
        var element = new WebElement(driver, "element-1");

        Assert.That(async () => await element.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<UnsupportedOperationException>().With.Message.Contains("BiDi"));
    }

    /// <summary>Starts a driver over an executor that answers the new session without a WebSocket URL and every other command with success.</summary>
    private static WebDriver StartDriverWithoutBiDi()
    {
        var capabilities = new Dictionary<string, object> { ["browserName"] = "chrome" };

        var executor = new Mock<ICommandExecutor>();
        executor.Setup(e => e.ExecuteAsync(It.IsAny<Command>()))
            .Returns((Command command) => Task.FromResult(new Response("session-1", command.Name == DriverCommand.NewSession ? capabilities : null, WebDriverResult.Success)));

        return new Mock<WebDriver>(executor.Object, new RemoteSessionSettings()) { CallBase = true }.Object;
    }
}
