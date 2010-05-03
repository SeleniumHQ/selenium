using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    public class GlobTextMatchingStrategy : ITextMatchingStrategy
    {
        public bool IsAMatch(string compareThis, string with)
        {
            string regex = compareThis.Replace(".", "\\.").Replace("*", ".*").Replace("?", ".?");
            var pattern = new Regex(regex, RegexOptions.Multiline);

            Match matcher = pattern.Match(with);

            return matcher.Success;
        }
    }
}