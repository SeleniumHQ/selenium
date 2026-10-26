// <copyright file="WebDriverConnectionTests.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Tests.BiDi;

/// <summary>
/// A session started with a WebSocket URL connects to it as the driver is constructed, and the
/// constructor fails when it cannot.
/// </summary>
public class WebDriverConnectionTests
{
    [Test]
    public void Constructor_UnreachableWebSocketUrl_Throws()
    {
        // Nothing listens on the discard port, so the connection the constructor opens is refused.
        var capabilities = new Dictionary<string, object>
        {
            ["browserName"] = "chrome",
            ["webSocketUrl"] = "ws://127.0.0.1:9/session/session-1",
        };

        var executor = new Mock<ICommandExecutor>();
        executor.Setup(e => e.ExecuteAsync(It.IsAny<Command>()))
            .Returns((Command command) => Task.FromResult(new Response("session-1", command.Name == DriverCommand.NewSession ? capabilities : null, WebDriverResult.Success)));

        Assert.That(() => new Mock<WebDriver>(executor.Object, new RemoteSessionSettings()) { CallBase = true }.Object, Throws.Exception);
    }
}
