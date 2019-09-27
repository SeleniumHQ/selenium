using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods to determine if the text is a match.
    /// </summary>
    internal interface ITextMatchingStrategy
    {
        /// <summary>
        /// Gets a value indicating whether the specified text is a match.
        /// </summary>
        /// <param name="compareThis">The text to compare.</param>
        /// <param name="compareTo">The text to compare to.</param>
        /// <returns><see langword="true"/> if the strings match; otherwise, <see langword="false"/>.</returns>
        bool IsAMatch(string compareThis, string compareTo);
    }
}
