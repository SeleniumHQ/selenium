// <copyright file="I18Tests.cs" company="Selenium Committers">
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

[TestFixture]
public class I18Tests : DriverTestFixture
{
    // The Hebrew word shalom (peace) encoded in order Shin (sh) Lamed (L) Vav (O) final-Mem (M).
    private readonly string shalom = "\u05E9\u05DC\u05D5\u05DD";

    // The Hebrew word tmunot (images) encoded in order Taf (t) Mem (m) Vav (u) Nun (n) Vav (o) Taf (t).
    private readonly string tmunot = "\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA";

    // This is the Chinese link text
    private readonly string linkText = "\u4E2D\u56FD\u4E4B\u58F0";

    [Test]
    public void ShouldBeAbleToReadChinese()
    {
        Driver.Url = Urls.ChinesePage;
        Driver.FindElement(By.LinkText(linkText)).Click();
    }

    [Test]
    public void ShouldBeAbleToEnterHebrewTextFromLeftToRight()
    {
        Driver.Url = Urls.ChinesePage;
        IWebElement input = Driver.FindElement(By.Name("i18n"));

        input.SendKeys(shalom);

        Assert.That(input.GetAttribute("value"), Is.EqualTo(shalom));
    }

    [Test]
    public void ShouldBeAbleToEnterHebrewTextFromRightToLeft()
    {
        Driver.Url = Urls.ChinesePage;
        IWebElement input = Driver.FindElement(By.Name("i18n"));

        input.SendKeys(tmunot);

        Assert.That(input.GetAttribute("value"), Is.EqualTo(tmunot));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "ChromeDriver only supports characters in the BMP")]
    [IgnoreBrowser(Browser.Edge, "EdgeDriver only supports characters in the BMP")]
    public void ShouldBeAbleToEnterSupplementaryCharacters()
    {
        if (TestUtilities.IsOldIE(Driver))
        {
            // IE: versions less thank 10 have issue 5069
            return;
        }

        Driver.Url = Urls.ChinesePage;

        string input = string.Empty;
        input += char.ConvertFromUtf32(0x20000);
        input += char.ConvertFromUtf32(0x2070E);
        input += char.ConvertFromUtf32(0x2000B);
        input += char.ConvertFromUtf32(0x2A190);
        input += char.ConvertFromUtf32(0x2A6B2);

        IWebElement el = Driver.FindElement(By.Name("i18n"));
        el.SendKeys(input);

        Assert.That(el.GetAttribute("value"), Is.EqualTo(input));
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldBeAbleToReturnTheTextInAPage()
    {
        string url = Urls.WhereIs("encoding");
        Driver.Url = url;

        string text = Driver.FindElement(By.TagName("body")).Text;

        Assert.That(text, Is.EqualTo(shalom));
    }
}
