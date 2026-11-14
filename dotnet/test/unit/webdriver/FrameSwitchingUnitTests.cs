// <copyright file="FrameSwitchingUnitTests.cs" company="Selenium Committers">
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

[TestFixture]
public class FrameSwitchingUnitTests
{
    [Test]
    public void EscapesALeadingDigitInAFrameId()
    {
        AssertFrameLookups("1", "frame[name='\\31 '],iframe[name='\\31 ']", "frame#\\31 ,iframe#\\31 ");
    }

    [Test]
    public void EscapesASpaceInAFrameId()
    {
        AssertFrameLookups("frame 1", "frame[name='frame\\ 1'],iframe[name='frame\\ 1']", "frame#frame\\ 1,iframe#frame\\ 1");
    }

    [Test]
    public void EscapesALeadingHyphenInAFrameId()
    {
        AssertFrameLookups("-1", "frame[name='\\-1'],iframe[name='\\-1']", "frame#\\-1,iframe#\\-1");
    }

    [Test]
    public void EscapesAnApostropheInAFrameNameAndId()
    {
        AssertFrameLookups("O'Brien", "frame[name='O\\'Brien'],iframe[name='O\\'Brien']", "frame#O\\'Brien,iframe#O\\'Brien");
    }

    [Test]
    public void HexEscapesANewlineInAFrameNameAndId()
    {
        AssertFrameLookups("a\nb", "frame[name='a\\a b'],iframe[name='a\\a b']", "frame#a\\a b,iframe#a\\a b");
    }

    private static void AssertFrameLookups(string frameName, string byName, string byId)
    {
        var selectors = new List<string>();
        var capabilities = new Dictionary<string, object> { ["browserName"] = "chrome" };
        var executor = new Mock<ICommandExecutor>();
        executor.Setup(e => e.ExecuteAsync(It.IsAny<Command>()))
            .Returns((Command command) =>
            {
                if (command.Name == DriverCommand.FindElements
                    && command.Parameters.TryGetValue("value", out object value)
                    && value is string selector)
                {
                    selectors.Add(selector);
                }

                object responseValue = command.Name == DriverCommand.NewSession ? capabilities : null;
                return Task.FromResult(new Response("session-1", responseValue, WebDriverResult.Success));
            });

        using WebDriver driver = new Mock<WebDriver>(executor.Object, new RemoteSessionSettings()) { CallBase = true }.Object;

        Assert.That(() => driver.SwitchTo().Frame(frameName), Throws.InstanceOf<NoSuchFrameException>());
        Assert.That(selectors, Is.EqualTo(new[] { byName, byId }));
    }
}
