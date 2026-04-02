// <copyright file="CombinedInputActionsTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.BrowsingContext;

using OpenQA.Selenium.BiDi.Input;

namespace OpenQA.Selenium.Tests.BiDi.Input;

internal class CombinedInputActionsTests : BiDiTestFixture
{
    //[Test]
    public async Task Paint()
    {
        driver.Url = "https://kleki.com/";

        await Task.Delay(3000);

        await context.Input.PerformActionsAsync([new PointerSourceActions("id0", [
            new PointerMoveAction(300, 300),
            new PointerDownAction(0),
            new PointerMoveAction(400, 400) { Duration = 2000, Width = 1, Twist = 1 },
            new PointerUpAction(0),
        ])]);

        await context.Input.PerformActionsAsync([new KeySourceActions("id1", [
            new KeyDownAction('U'),
            new KeyUpAction('U'),
            new PauseAction { Duration = 3000 }
        ])]);

        await context.Input.PerformActionsAsync([new PointerSourceActions("id2", [
            new PointerMoveAction(300, 300),
            new PointerDownAction(0),
            new PointerMoveAction(400, 400) { Duration = 2000 },
            new PointerUpAction(0),
        ])]);

        await Task.Delay(3000);
    }

    [Test]
    public async Task TestShiftClickingOnMultiSelectionList()
    {
        driver.Url = UrlBuilder.WhereIs("formSelectionPage.html");

        var options = (await context.LocateNodesAsync(new CssLocator("option"))).Nodes;

        await context.Input.PerformActionsAsync([
            new PointerSourceActions("pointer", [
                new PointerMoveAction(0, 0) { Origin = new ElementOrigin(options[1]) },
                new PointerDownAction(0),
                new PointerUpAction(0),
                new PauseAction(),  // align with shift key down
                new PointerMoveAction(0, 0) { Origin = new ElementOrigin(options[3]) },
                new PointerDownAction(0),
                new PointerUpAction(0),
            ]),
            new KeySourceActions("key", [
                new PauseAction(),  // align with first click (no modifier)
                new PauseAction(),
                new PauseAction(),
                new KeyDownAction('\uE008'),  // Shift down
                new PauseAction(),
                new PauseAction(),
                new KeyUpAction('\uE008'),  // Shift up
            ]),
        ]);

        var showButton = (await context.LocateNodesAsync(new CssLocator("[name='showselected']"))).Nodes[0];
        await context.Input.PerformActionsAsync([
            new PointerSourceActions("pointer", [
                new PointerMoveAction(0, 0) { Origin = new ElementOrigin(showButton) },
                new PointerDownAction(0),
                new PointerUpAction(0),
            ]),
        ]);

        var resultText = driver.FindElement(By.Id("result")).Text;

        Assert.That(resultText, Is.EqualTo("roquefort parmigiano cheddar"));
    }
}
