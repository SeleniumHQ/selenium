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

using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.BiDi.BrowsingContext;

namespace OpenQA.Selenium.BiDi.Input;

internal class CombinedInputActionsTests : BiDiTestFixture
{
    //[Test]
    public async Task Paint()
    {
        driver.Url = "https://kleki.com/";

        await Task.Delay(3000);

        await context.Input.PerformActionsAsync([new PointerActions("id0") {
            new PointerMoveAction(300, 300),
            new PointerDownAction(0),
            new PointerMoveAction(400, 400) { Duration = 2000, Width = 1, Twist = 1 },
            new PointerUpAction(0),
        }]);

        await context.Input.PerformActionsAsync([new KeyActions("id1") {
            new KeyDownAction('U'),
            new KeyUpAction('U'),
            new PauseAction { Duration = 3000 }
        }]);

        await context.Input.PerformActionsAsync([new PointerActions("id2") {
            new PointerMoveAction(300, 300),
            new PointerDownAction(0),
            new PointerMoveAction(400, 400) { Duration = 2000 },
            new PointerUpAction(0),
        }]);

        await Task.Delay(3000);
    }

    [Test]
    public async Task TestShiftClickingOnMultiSelectionList()
    {
        driver.Url = UrlBuilder.WhereIs("formSelectionPage.html");

        var options = await context.LocateNodesAsync(new CssLocator("option"));

        await context.Input.PerformActionsAsync([
            new PointerActions("id0")
            {
                new PointerDownAction(1),
                new PointerUpAction(1),
            }
            ]);
    }
}
