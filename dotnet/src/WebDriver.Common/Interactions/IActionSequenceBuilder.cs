using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Interactions
{
    public interface IActionSequenceBuilder
    {
        // Keyboard-related actions.

        IActionSequenceBuilder KeyDown(string theKey);

        IActionSequenceBuilder KeyDown(IWebElement element, string theKey);

        IActionSequenceBuilder KeyUp(string theKey);

        IActionSequenceBuilder KeyUp(IWebElement element, string theKey);

        IActionSequenceBuilder SendKeys(string keysToSend);

        IActionSequenceBuilder SendKeys(IWebElement element, string keysToSend);

        // Mouse-related actions.
        IActionSequenceBuilder ClickAndHold(IWebElement onElement);

        IActionSequenceBuilder Release(IWebElement onElement);

        IActionSequenceBuilder Click(IWebElement onElement);

        // Click where the mouse was last moved to.
        IActionSequenceBuilder Click();

        IActionSequenceBuilder DoubleClick(IWebElement onElement);

        IActionSequenceBuilder MoveToElement(IWebElement toElement);

        IActionSequenceBuilder MoveToElement(IWebElement toElement, int xOffset, int yOffset);

        IActionSequenceBuilder MoveByOffset(int xOffset, int yOffset);

        IActionSequenceBuilder ContextClick(IWebElement onElement);

        IActionSequenceBuilder DragAndDrop(IWebElement source, IWebElement target);

        IAction Build();
    }
}
