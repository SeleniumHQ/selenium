namespace Selenium.Internal.SeleniumEmulation
{
    internal class ExactTextMatchingStrategy : ITextMatchingStrategy
    {
        public bool IsAMatch(string compareThis, string compareTo)
        {
            return compareTo.Contains(compareThis);
        }
    }
}