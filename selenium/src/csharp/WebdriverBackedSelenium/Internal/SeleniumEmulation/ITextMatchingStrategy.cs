using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    public interface ITextMatchingStrategy
    {
        bool IsAMatch(String compareThis, String with);
    }
}
