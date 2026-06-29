// <copyright file="DragAndDropTests.cs" company="Selenium Committers">
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

using System.Drawing;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Interactions;

namespace OpenQA.Selenium.Tests.Interactions;

[TestFixture]
public class DragAndDropTests : DriverTestFixture
{
    [SetUp]
    public void SetupTest()
    {
        if (Driver is IActionExecutor actionExecutor)
        {
            actionExecutor.ResetInputState();
        }
    }

    [Test]
    public void DragAndDropRelative()
    {
        Driver.Url = Urls.DragAndDropPage;
        IWebElement img = Driver.FindElement(By.Id("test1"));
        Point expectedLocation = Drag(img, img.Location, 150, 200);
        Assert.That(img.Location, Is.EqualTo(expectedLocation));
        expectedLocation = Drag(img, img.Location, -50, -25);
        Assert.That(img.Location, Is.EqualTo(expectedLocation));
        expectedLocation = Drag(img, img.Location, 0, 0);
        Assert.That(img.Location, Is.EqualTo(expectedLocation));
        expectedLocation = Drag(img, img.Location, 1, -1);
        Assert.That(img.Location, Is.EqualTo(expectedLocation));
    }

    [Test]
    public void DragAndDropToElement()
    {
        Driver.Url = Urls.DragAndDropPage;
        IWebElement img1 = Driver.FindElement(By.Id("test1"));
        IWebElement img2 = Driver.FindElement(By.Id("test2"));
        Actions actionProvider = new Actions(Driver);
        actionProvider.DragAndDrop(img2, img1).Perform();
        Assert.That(img2.Location, Is.EqualTo(img1.Location));
    }

    [Test]
    public void DragAndDropToElementInIframe()
    {
        Driver.Url = Urls.IframesPage;
        IWebElement iframe = Driver.FindElement(By.TagName("iframe"));
        ((IJavaScriptExecutor)Driver).ExecuteScript("arguments[0].src = arguments[1]", iframe,
                                                    Urls.DragAndDropPage);
        Driver.SwitchTo().Frame(0);
        IWebElement img1 = WaitFor<IWebElement>(() =>
            {
                try
                {
                    IWebElement element1 = Driver.FindElement(By.Id("test1"));
                    return element1;
                }
                catch (NoSuchElementException)
                {
                    return null;
                }
            }, "Element with ID 'test1' not found");

        IWebElement img2 = Driver.FindElement(By.Id("test2"));
        new Actions(Driver).DragAndDrop(img2, img1).Perform();
        Assert.That(img2.Location, Is.EqualTo(img1.Location));
    }

    [Test]
    public void DragAndDropElementWithOffsetInIframeAtBottom()
    {
        Driver.Url = Urls.WhereIs("iframeAtBottom.html");

        IWebElement iframe = Driver.FindElement(By.TagName("iframe"));
        Driver.SwitchTo().Frame(iframe);

        IWebElement img1 = Driver.FindElement(By.Id("test1"));
        Point initial = img1.Location;

        new Actions(Driver).DragAndDropToOffset(img1, 20, 20).Perform();
        initial.Offset(20, 20);
        Assert.That(img1.Location, Is.EqualTo(initial));
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.Edge, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.Firefox, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.IE, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.Safari, "Moving outside of view port throws exception in spec-compliant driver")]
    public void DragAndDropElementWithOffsetInScrolledDiv()
    {
        if (TestUtilities.IsFirefox(Driver) && IsNativeEventsEnabled)
        {
            return;
        }

        Driver.Url = Urls.WhereIs("dragAndDropInsideScrolledDiv.html");

        IWebElement el = Driver.FindElement(By.Id("test1"));
        Point initial = el.Location;

        new Actions(Driver).DragAndDropToOffset(el, 3700, 3700).Perform();
        initial.Offset(3700, 3700);
        Assert.That(el.Location, Is.EqualTo(initial));
    }

    [Test]
    public void ElementInDiv()
    {
        Driver.Url = Urls.DragAndDropPage;
        IWebElement img = Driver.FindElement(By.Id("test3"));
        Point startLocation = img.Location;
        Point expectedLocation = Drag(img, startLocation, 100, 100);
        Point endLocation = img.Location;
        Assert.That(endLocation, Is.EqualTo(expectedLocation));
    }

    [Test]
    public void DragTooFar()
    {
        Driver.Url = Urls.DragAndDropPage;
        IWebElement img = Driver.FindElement(By.Id("test1"));

        // Dragging too far left and up does not move the element. It will be at
        // its original location after the drag.
        Point originalLocation = new Point(0, 0);
        Actions actionProvider = new Actions(Driver);
        Assert.That(() => actionProvider.DragAndDropToOffset(img, 2147480000, 2147400000).Perform(), Throws.InstanceOf<WebDriverException>());
        new Actions(Driver).Release().Perform();
    }

    [Test]
    [IgnoreBrowser(Browser.Chrome, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.Edge, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.Firefox, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.IE, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.Safari, "Moving outside of view port throws exception in spec-compliant driver")]
    public void ShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort()
    {
        Size originalSize = Driver.Manage().Window.Size;
        Size testSize = new Size(300, 300);
        Driver.Url = Urls.DragAndDropPage;

        Driver.Manage().Window.Size = testSize;
        try
        {
            Driver.Url = Urls.DragAndDropPage;
            IWebElement img = Driver.FindElement(By.Id("test3"));
            Point expectedLocation = Drag(img, img.Location, 100, 100);
            Assert.That(img.Location, Is.EqualTo(expectedLocation));
        }
        finally
        {
            Driver.Manage().Window.Size = originalSize;
        }
    }

    [Test]
    public void DragAndDropOnJQueryItems()
    {
        Driver.Url = Urls.DroppableItems;

        IWebElement toDrag = Driver.FindElement(By.Id("draggable"));
        IWebElement dropInto = Driver.FindElement(By.Id("droppable"));

        // Wait until all event handlers are installed.
        System.Threading.Thread.Sleep(500);

        Actions actionProvider = new Actions(Driver);
        actionProvider.DragAndDrop(toDrag, dropInto).Perform();

        string text = dropInto.FindElement(By.TagName("p")).Text;

        DateTime endTime = DateTime.Now.Add(TimeSpan.FromSeconds(15));

        while (text != "Dropped!" && (DateTime.Now < endTime))
        {
            System.Threading.Thread.Sleep(200);
            text = dropInto.FindElement(By.TagName("p")).Text;
        }

        Assert.That(text, Is.EqualTo("Dropped!"));

        IWebElement reporter = Driver.FindElement(By.Id("drop_reports"));
        // Assert that only one mouse click took place and the mouse was moved
        // during it.
        string reporterText = reporter.Text;
        Assert.That(reporterText, Does.Match("start( move)* down( move)+ up"));
        Assert.That(Regex.Matches(reporterText, "down"), Has.Count.EqualTo(1), "Reporter text:" + reporterText);
        Assert.That(Regex.Matches(reporterText, "up"), Has.Count.EqualTo(1), "Reporter text:" + reporterText);
        Assert.That(reporterText, Does.Contain("move"));
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Moving outside of view port throws exception in spec-compliant driver")]
    [IgnoreBrowser(Browser.IE, "Moving outside of view port throws exception in spec-compliant driver")]
    public void CanDragAnElementNotVisibleInTheCurrentViewportDueToAParentOverflow()
    {
        Driver.Url = Urls.DragDropOverflowPage;

        IWebElement toDrag = Driver.FindElement(By.Id("time-marker"));
        IWebElement dragTo = Driver.FindElement(By.Id("11am"));

        Point srcLocation = toDrag.Location;
        Point targetLocation = dragTo.Location;

        int yOffset = targetLocation.Y - srcLocation.Y;
        Assert.That(yOffset, Is.Not.Zero);

        new Actions(Driver).DragAndDropToOffset(toDrag, 0, yOffset).Perform();

        Assert.That(toDrag.Location, Is.EqualTo(dragTo.Location));
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void DragAndDropRelativeAndToElement()
    {
        Driver.Url = Urls.DragAndDropPage;
        IWebElement img1 = Driver.FindElement(By.Id("test1"));
        IWebElement img2 = Driver.FindElement(By.Id("test2"));
        Actions actionProvider = new Actions(Driver);
        actionProvider.DragAndDropToOffset(img1, 100, 100).Perform();
        actionProvider.Reset();
        actionProvider.DragAndDrop(img2, img1).Perform();
        Assert.That(img2.Location, Is.EqualTo(img1.Location));
    }

    private Point Drag(IWebElement elem, Point initialLocation, int moveRightBy, int moveDownBy)
    {
        Point expectedLocation = new Point(initialLocation.X, initialLocation.Y);
        expectedLocation.Offset(moveRightBy, moveDownBy);

        Actions actionProvider = new Actions(Driver);
        actionProvider.DragAndDropToOffset(elem, moveRightBy, moveDownBy).Perform();

        return expectedLocation;
    }
}
