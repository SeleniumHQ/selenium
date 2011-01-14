using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    internal interface ITextMatchingStrategy
    {
        bool IsAMatch(string compareThis, string compareTo);
    }
}
