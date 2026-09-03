// <copyright file="DefaultMouseTests.cs" company="Selenium Committers">
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

//class DefaultMouseTests : BiDiTestFixture
//{
//    [Test]
//    public async Task PerformDragAndDropWithMouse()
//    {
//        driver.Url = Urls.DraggableLists;

//        await context.Input.PerformActionsAsync([
//            new KeyActions
//            {
//                Actions =
//                {
//                    new Key.Down('A'),
//                    new Key.Up('B')
//                }
//            }
//            ]);

//        await context.Input.PerformActionsAsync([new KeyActions
//        {
//            new Key.Down('A'),
//            new Key.Down('B'),
//            new Pause()
//        }]);

//        await context.Input.PerformActionsAsync([new PointerActions
//        {
//            new Pointer.Down(0),
//            new Pointer.Up(0),
//        }]);
//    }

//    //[Test]
//    public async Task PerformCombined()
//    {
//        await context.NavigateAsync("https://nuget.org", new() { Wait = ReadinessState.Complete });

//        await context.Input.PerformActionsAsync(new SequentialSourceActions().Type("Hello").Pause(2000).KeyDown(Key.Shift).Type("World"));

//        await Task.Delay(3000);
//    }
//}
