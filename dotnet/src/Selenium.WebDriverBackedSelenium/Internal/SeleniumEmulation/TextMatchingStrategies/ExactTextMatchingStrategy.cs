namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods to determine if the text is a match to an exact text string.
    /// </summary>
    internal class ExactTextMatchingStrategy : ITextMatchingStrategy
    {
        /// <summary>
        /// Gets a value indicating whether the specified text is a match.
        /// </summary>
        /// <param name="compareThis">The text to compare.</param>
        /// <param name="compareTo">The text to compare to.</param>
        /// <returns><see langword="true"/> if the strings match; otherwise, <see langword="false"/>.</returns>
        public bool IsAMatch(string compareThis, string compareTo)
        {
            return compareTo.Contains(compareThis);
        }
    }
}