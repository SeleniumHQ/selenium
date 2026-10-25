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

namespace OpenQA.Selenium.Tests;

/// <summary>
/// A session without BiDi cannot take an accessibility snapshot, and says so before any command; a
/// session with a WebSocket URL connects to it as it starts, and fails fast when it cannot.
/// </summary>
[Parallelizable(ParallelScope.All)]
public class AccessibilitySnapshotUnitTests
{
    [Test]
    public void ASessionWithoutBiDiRaisesForTheWholePage()
    {
        var executor = new RecordingExecutor();
        using var driver = new ClassicDriver(executor);

        Assert.That(async () => await driver.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<UnsupportedOperationException>().With.Message.Contains("BiDi"));
        Assert.That(executor.Commands, Is.Empty);
    }

    [Test]
    public void ASessionWithoutBiDiRaisesForAnElement()
    {
        var executor = new RecordingExecutor();
        using var driver = new ClassicDriver(executor);
        var element = new WebElement(driver, "element-1");

        Assert.That(async () => await element.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<UnsupportedOperationException>().With.Message.Contains("BiDi"));
        Assert.That(executor.Commands, Is.Empty);
    }

    [Test]
    public void ASessionWhoseWebSocketUrlCannotBeReachedFailsFastAndQuits()
    {
        // Nothing listens on the discard port, so the connection the constructor opens is refused.
        var executor = new RecordingExecutor("ws://127.0.0.1:9/session/session-1");

        Assert.That(() => new ClassicDriver(executor), Throws.Exception);
        Assert.That(executor.Commands, Is.EqualTo(new[] { DriverCommand.Quit }));
    }

    /// <summary>A driver over whatever session the executor answers with.</summary>
    private sealed class ClassicDriver : WebDriver
    {
        public ClassicDriver(ICommandExecutor executor)
            : base(executor, new RemoteSessionSettings())
        {
        }
    }

    /// <summary>Answers the new session command with the given capabilities and records every other command sent while the driver lives.</summary>
    private sealed class RecordingExecutor : ICommandExecutor
    {
        private readonly string? webSocketUrl;

        public RecordingExecutor(string? webSocketUrl = null)
        {
            this.webSocketUrl = webSocketUrl;
        }

        public List<string> Commands { get; } = [];

        public bool TryAddCommand(string commandName, CommandInfo? info) => false;

        public Response Execute(Command commandToExecute)
        {
            if (commandToExecute.Name == DriverCommand.NewSession)
            {
                var capabilities = new Dictionary<string, object> { ["browserName"] = "chrome" };
                if (this.webSocketUrl is not null)
                {
                    capabilities["webSocketUrl"] = this.webSocketUrl;
                }

                return new Response("session-1", capabilities, WebDriverResult.Success);
            }

            if (commandToExecute.Name != DriverCommand.Quit || this.webSocketUrl is not null)
            {
                this.Commands.Add(commandToExecute.Name);
            }

            return new Response("session-1", null, WebDriverResult.Success);
        }

        public Task<Response> ExecuteAsync(Command commandToExecute) => Task.FromResult(this.Execute(commandToExecute));

        public void Dispose()
        {
        }
    }
}
