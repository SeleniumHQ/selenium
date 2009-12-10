using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace OpenQA.Selenium
{
    public interface IRenderedWebElement : IWebElement
    {
        Point Location { get; }
        Size Size { get; }
        bool Displayed { get; }
        string GetValueOfCssProperty(string propertyName);
        void Hover();
        void DragAndDropBy(int moveRightBy, int moveDownBy);
        void DragAndDropOn(IRenderedWebElement element);
    }
}
