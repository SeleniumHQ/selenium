// <copyright file="DefaultKeyboardTests.cs" company="Selenium Committers">
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

//namespace OpenQA.Selenium.BiDi.Input;

//class DefaultKeyboardTests : BiDiTestFixture
//{
//    [Test]
//    public async Task TestBasicKeyboardInput()
//    {
//        driver.Url = UrlBuilder.WhereIs("single_text_input.html");

//        var input = (await context.LocateNodesAsync(new Locator.Css("#textInput")))[0];

//        await context.Input.PerformActionsAsync(new SequentialSourceActions()
//            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
//            .PointerDown(0)
//            .PointerUp(0)
//            .Type("abc def"));

//        Assert.That(driver.FindElement(By.Id("textInput")).GetAttribute("value"), Is.EqualTo("abc def"));
//    }

//    [Test]
//    public async Task TestSendingKeyDownOnly()
//    {
//        driver.Url = UrlBuilder.WhereIs("key_logger.html");

//        var input = (await context.LocateNodesAsync(new Locator.Css("#theworks")))[0];

//        await context.Input.PerformActionsAsync(new SequentialSourceActions()
//            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
//            .PointerDown(0)
//            .PointerUp(0)
//            .KeyDown(Key.Shift));

//        Assert.That(driver.FindElement(By.Id("result")).Text, Does.EndWith("keydown"));
//    }

//    [Test]
//    public async Task TestSendingKeyUp()
//    {
//        driver.Url = UrlBuilder.WhereIs("key_logger.html");

//        var input = (await context.LocateNodesAsync(new Locator.Css("#theworks")))[0];

//        await context.Input.PerformActionsAsync(new SequentialSourceActions()
//            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
//            .PointerDown(0)
//            .PointerUp(0)
//            .KeyDown(Key.Shift)
//            .KeyUp(Key.Shift));

//        Assert.That(driver.FindElement(By.Id("result")).Text, Does.EndWith("keyup"));
//    }

//    [Test]
//    public async Task TestSendingKeysWithShiftPressed()
//    {
//        driver.Url = UrlBuilder.WhereIs("key_logger.html");

//        var input = (await context.LocateNodesAsync(new Locator.Css("#theworks")))[0];

//        await context.Input.PerformActionsAsync(new SequentialSourceActions()
//            .PointerMove(0, 0, new() { Origin = new Modules.Input.Origin.Element(new Modules.Script.SharedReference(input.SharedId)) })
//            .PointerDown(0)
//            .PointerUp(0)
//            .KeyDown(Key.Shift)
//            .Type("ab")
//            .KeyUp(Key.Shift));

//        Assert.That(driver.FindElement(By.Id("result")).Text, Does.EndWith("keydown keydown keypress keyup keydown keypress keyup keyup"));
//        Assert.That(driver.FindElement(By.Id("theworks")).GetAttribute("value"), Is.EqualTo("AB"));
//    }

//    [Test]
//    public async Task TestSendingKeysToActiveElement()
//    {
//        driver.Url = UrlBuilder.WhereIs("bodyTypingTest.html");

//        await context.Input.PerformActionsAsync(new SequentialSourceActions().Type("ab"));

//        Assert.That(driver.FindElement(By.Id("body_result")).Text, Does.EndWith("keypress keypress"));
//        Assert.That(driver.FindElement(By.Id("result")).Text, Is.EqualTo(" "));
//    }
//}
