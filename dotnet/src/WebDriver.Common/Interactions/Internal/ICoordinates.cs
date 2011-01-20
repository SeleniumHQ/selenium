using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;

namespace OpenQA.Selenium.Interactions.Internal
{
    public interface ICoordinates
    {
        Point LocationOnScreen { get; }
        Point LocationInViewPort { get; }
        Point LocationInDOM { get; }

        object AuxilliaryLocator { get; }
    }
}
