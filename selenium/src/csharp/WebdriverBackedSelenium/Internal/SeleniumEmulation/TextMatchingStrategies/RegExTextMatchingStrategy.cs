using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    public class RegExTextMatchingStrategy : ITextMatchingStrategy
    {
        public bool IsAMatch(string compareThis, string with)
        {
            var pattern = new Regex(compareThis, RegexOptions.Multiline);
            Match matcher = pattern.Match(with);
            return matcher.Success;
        }
    }
}