// <copyright file="PopupWindowFinderTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium.Tests;

namespace OpenQA.Selenium.Support.Tests.UI;

[TestFixture]
public class PopupWindowFinderTests : DriverTestFixture
{
    [Test]
    public void ShouldFindPopupWindowUsingAction()
    {
        Driver.Url = Urls.XhtmlTestPage;
        string current = Driver.CurrentWindowHandle;

        PopupWindowFinder finder = new PopupWindowFinder(Driver);
        string newHandle = finder.Invoke(() => { Driver.FindElement(By.LinkText("Open new window")).Click(); });

        Assert.That(newHandle, Is.Not.Null.And.Not.Empty);
        Assert.That(newHandle, Is.Not.EqualTo(current));

        Driver.SwitchTo().Window(newHandle);
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
        Driver.Close();

        Driver.SwitchTo().Window(current);
    }

    [Test]
    public void ShouldFindPopupWindowUsingElementClick()
    {
        Driver.Url = Urls.XhtmlTestPage;
        string current = Driver.CurrentWindowHandle;

        PopupWindowFinder finder = new PopupWindowFinder(Driver);
        string newHandle = finder.Click(Driver.FindElement(By.LinkText("Open new window")));

        Assert.That(newHandle, Is.Not.Null.And.Not.Empty);
        Assert.That(newHandle, Is.Not.EqualTo(current));

        Driver.SwitchTo().Window(newHandle);
        Assert.That(Driver.Title, Is.EqualTo("We Arrive Here"));
        Driver.Close();

        Driver.SwitchTo().Window(current);
    }

    [Test]
    public void ShouldFindMultiplePopupWindowsInSuccession()
    {
        Driver.Url = Urls.XhtmlTestPage;
        string first = Driver.CurrentWindowHandle;

        PopupWindowFinder finder = new PopupWindowFinder(Driver);
        string second = finder.Click(Driver.FindElement(By.Name("windowOne")));
        Assert.That(second, Is.Not.Null.And.Not.Empty);
        Assert.That(second, Is.Not.EqualTo(first));

        finder = new PopupWindowFinder(Driver);
        string third = finder.Click(Driver.FindElement(By.Name("windowTwo")));
        Assert.That(third, Is.Not.Null.And.Not.Empty);
        Assert.That(third, Is.Not.EqualTo(first));
        Assert.That(third, Is.Not.EqualTo(second));

        Driver.SwitchTo().Window(second);
        Driver.Close();

        Driver.SwitchTo().Window(third);
        Driver.Close();

        Driver.SwitchTo().Window(first);
    }

    [Test]
    public void ShouldNotFindPopupWindowWhenNoneExists()
    {
        Driver.Url = Urls.XhtmlTestPage;
        PopupWindowFinder finder = new PopupWindowFinder(Driver);
        Assert.That(
            () => finder.Click(Driver.FindElement(By.Id("linkId"))),
            Throws.TypeOf<WebDriverTimeoutException>());
    }
}
