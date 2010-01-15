using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    public interface ITakesScreenshot
    {
        Screenshot GetScreenshot();
    }
}
