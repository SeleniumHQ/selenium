using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class RegexTextMatchingStrategy : ITextMatchingStrategy
    {
        public bool IsAMatch(string compareThis, string compareTo)
        {
            var pattern = new Regex(compareThis, RegexOptions.Multiline);
            Match matcher = pattern.Match(compareTo);
            return matcher.Success;
        }
    }
}