using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace OpenQa.Selenium
{
    public interface ILocatable
    {
        Point LocationOnScreenOnceScrolledIntoView { get; }
    }
}
