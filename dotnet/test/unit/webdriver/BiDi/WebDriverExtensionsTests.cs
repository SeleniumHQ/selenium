// <copyright file="WebDriverExtensionsTests.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi;

namespace OpenQA.Selenium.Tests.BiDi;

[TestFixture]
public class WebDriverExtensionsTests
{
    [Test]
    public void AsBiDiAsync_NullDriver_ThrowsArgumentNullException()
    {
        IWebDriver driver = null!;

        Assert.That(() => driver.AsBiDiAsync(), Throws.ArgumentNullException);
    }

    [Test]
    public void AsBiDiAsync_DriverWithoutCapabilities_ThrowsBiDiException()
    {
        var mockDriver = new Mock<IWebDriver>();

        Assert.That(
            () => mockDriver.Object.AsBiDiAsync(),
            Throws.TypeOf<BiDiException>().With.Message.Contain("webSocketUrl"));
    }

    [Test]
    public void AsBiDiAsync_NullWebSocketUrl_ThrowsBiDiException()
    {
        var mockDriver = new Mock<IWebDriver>();
        var mockCapabilities = new Mock<ICapabilities>();
        mockCapabilities.Setup(c => c.GetCapability("webSocketUrl")).Returns(null!);
        mockDriver.As<IHasCapabilities>().Setup(d => d.Capabilities).Returns(mockCapabilities.Object);

        Assert.That(
            () => mockDriver.Object.AsBiDiAsync(),
            Throws.TypeOf<BiDiException>().With.Message.Contain("webSocketUrl"));
    }

    [Test]
    [TestCase("true")]
    [TestCase("false")]
    [TestCase("not-a-url")]
    [TestCase("")]
    [TestCase("http://localhost:1234")]
    [TestCase("https://localhost:1234")]
    public void AsBiDiAsync_InvalidWebSocketUrl_ThrowsBiDiException(string invalidUrl)
    {
        var mockDriver = new Mock<IWebDriver>();
        var mockCapabilities = new Mock<ICapabilities>();
        mockCapabilities.Setup(c => c.GetCapability("webSocketUrl")).Returns(invalidUrl);
        mockDriver.As<IHasCapabilities>().Setup(d => d.Capabilities).Returns(mockCapabilities.Object);

        Assert.That(
            () => mockDriver.Object.AsBiDiAsync(),
            Throws.TypeOf<BiDiException>().With.Message.Contain("invalid WebSocket URL").And.Message.Contain(invalidUrl));
    }
}
