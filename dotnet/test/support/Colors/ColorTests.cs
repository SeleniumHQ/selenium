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

namespace OpenQA.Selenium.Support.Colors
{
    [TestFixture]
    public class ColorTests
    {
        [Test]
        public void RgbToRgb()
        {
            string rgb = "rgb(1, 2, 3)";
            Assert.That(Color.FromString(rgb).Rgb, Is.EqualTo(rgb));
        }

        [Test]
        public void RgbToRgba()
        {
            string rgb = "rgb(1, 2, 3)";
            Assert.That(Color.FromString(rgb).Rgba, Is.EqualTo("rgba(1, 2, 3, 1)"));
        }

        [Test]
        public void RgbPctToRgba()
        {
            string rgba = "rgb(10%, 20%, 30%)";
            Assert.That(Color.FromString(rgba).Rgba, Is.EqualTo("rgba(25, 51, 76, 1)"));
        }

        [Test]
        public void RgbAllowsWhitespace()
        {
            string rgb = "rgb(\t1,   2    , 3)";
            string canonicalRgb = "rgb(1, 2, 3)";
            Assert.That(Color.FromString(rgb).Rgb, Is.EqualTo(canonicalRgb));
        }

        [Test]
        public void RgbaToRgba()
        {
            string rgba = "rgba(1, 2, 3, 0.5)";
            Assert.That(Color.FromString(rgba).Rgba, Is.EqualTo(rgba));
        }

        [Test]
        public void RgbaPctToRgba()
        {
            string rgba = "rgba(10%, 20%, 30%, 0.5)";
            Assert.That(Color.FromString(rgba).Rgba, Is.EqualTo("rgba(25, 51, 76, 0.5)"));
        }

        [Test]
        public void HexToHex()
        {
            string hex = "#ff00a0";
            Assert.That(Color.FromString(hex).Hex, Is.EqualTo(hex));
        }

        [Test]
        public void HexToRgba()
        {
            string hex = "#01Ff03";
            string rgba = "rgba(1, 255, 3, 1)";
            Assert.That(Color.FromString(hex).Rgba, Is.EqualTo(rgba));
            // same test data as hex3 below
            hex = "#00ff33";
            rgba = "rgba(0, 255, 51, 1)";
            Assert.That(Color.FromString(hex).Rgba, Is.EqualTo(rgba));
        }

        [Test]
        public void RgbToHex()
        {
            string hex = "#01ff03";
            string rgb = "rgb(1, 255, 3)";
            Assert.That(Color.FromString(rgb).Hex, Is.EqualTo(hex));
        }

        [Test]
        public void Hex3ToRgba()
        {
            string hex = "#0f3";
            string rgba = "rgba(0, 255, 51, 1)";
            Assert.That(Color.FromString(hex).Rgba, Is.EqualTo(rgba));
        }

        [Test]
        public void HslToRgba()
        {
            string hsl = "hsl(120, 100%, 25%)";
            string rgba = "rgba(0, 128, 0, 1)";
            Assert.That(Color.FromString(hsl).Rgba, Is.EqualTo(rgba));
            hsl = "hsl(100, 0%, 50%)";
            rgba = "rgba(128, 128, 128, 1)";
            Assert.That(Color.FromString(hsl).Rgba, Is.EqualTo(rgba));
            hsl = "hsl(0, 100%, 50%)"; // red
            rgba = "rgba(255, 0, 0, 1)";
            Assert.That(Color.FromString(hsl).Rgba, Is.EqualTo(rgba));
            hsl = "hsl(120, 100%, 50%)"; // green
            rgba = "rgba(0, 255, 0, 1)";
            Assert.That(Color.FromString(hsl).Rgba, Is.EqualTo(rgba));
            hsl = "hsl(240, 100%, 50%)"; // blue
            rgba = "rgba(0, 0, 255, 1)";
            Assert.That(Color.FromString(hsl).Rgba, Is.EqualTo(rgba));
            hsl = "hsl(0, 0%, 100%)"; // white
            rgba = "rgba(255, 255, 255, 1)";
            Assert.That(Color.FromString(hsl).Rgba, Is.EqualTo(rgba));
        }

        [Test]
        public void HslaToRgba()
        {
            string hsla = "hsla(120, 100%, 25%, 1)";
            string rgba = "rgba(0, 128, 0, 1)";
            Assert.That(Color.FromString(hsla).Rgba, Is.EqualTo(rgba));
            hsla = "hsla(100, 0%, 50%, 0.5)";
            rgba = "rgba(128, 128, 128, 0.5)";
            Assert.That(Color.FromString(hsla).Rgba, Is.EqualTo(rgba));
        }

        [Test]
        public void BaseColourToRgba()
        {
            string baseColour = "green";
            string rgba = "rgba(0, 128, 0, 1)";
            Assert.That(Color.FromString(baseColour).Rgba, Is.EqualTo(rgba));
            baseColour = "gray";
            rgba = "rgba(128, 128, 128, 1)";
            Assert.That(Color.FromString(baseColour).Rgba, Is.EqualTo(rgba));
        }

        [Test]
        public void TransparentToRgba()
        {
            string transparent = "transparent";
            string rgba = "rgba(0, 0, 0, 0)";
            Assert.That(Color.FromString(transparent).Rgba, Is.EqualTo(rgba));
        }

        [Test]
        public void CheckEqualsWorks()
        {
            Color objectA = Color.FromString("#f00");
            Color objectB = Color.FromString("rgb(255, 0, 0)");
            Assert.That(objectA, Is.EqualTo(objectB));
        }

        [Test]
        public void CheckHashCodeWorks()
        {
            Color objectA = Color.FromString("#f00");
            Color objectB = Color.FromString("rgb(255, 0, 0)");
            Assert.That(objectA.GetHashCode(), Is.EqualTo(objectB.GetHashCode()));
        }

        [Test]
        public void CheckSettingOpacityRGB()
        {
            string initial = "rgb(1, 255, 3)";
            Color actual = Color.FromString(initial);

            actual.Alpha = 0.5;

            string expected = "rgba(1, 255, 3, 0.5)";
            Assert.That(expected, Is.EqualTo(actual.Rgba));
        }

        [Test]
        public void CheckSettingOpacityRGBA()
        {
            string initial = "rgba(1, 255, 3, 1)";
            Color actual = Color.FromString(initial);

            actual.Alpha = 0;

            string expected = "rgba(1, 255, 3, 0)";
            Assert.That(expected, Is.EqualTo(actual.Rgba));
        }

        [Test]
        public void BaseColourToAwt()
        {
            System.Drawing.Color green = System.Drawing.Color.FromArgb(255, 0, 255, 0);
            string rgba = "rgba(0, 255, 0, 1)";
            Assert.That(Color.FromString(rgba).GetColor, Is.EqualTo(green));
        }

        [Test]
        public void TransparentColourToAwt()
        {
            System.Drawing.Color transGreen = System.Drawing.Color.FromArgb(0, 0, 255, 0);
            string rgba = "rgba(0, 255, 0, 0)";
            Assert.That(Color.FromString(rgba).GetColor, Is.EqualTo(transGreen));
        }
    }
}