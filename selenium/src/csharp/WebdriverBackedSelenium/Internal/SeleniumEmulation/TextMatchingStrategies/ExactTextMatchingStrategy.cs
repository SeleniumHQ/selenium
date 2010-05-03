namespace Selenium.Internal.SeleniumEmulation
{
    public class ExactTextMatchingStrategy : ITextMatchingStrategy
    {
        public bool IsAMatch(string compareThis, string with)
        {
            return with.Contains(compareThis);
        }
    }
}