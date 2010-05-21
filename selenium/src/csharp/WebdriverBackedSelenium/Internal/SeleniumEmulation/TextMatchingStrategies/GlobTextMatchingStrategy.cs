using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GlobTextMatchingStrategy : ITextMatchingStrategy
    {
        public bool IsAMatch(string compareThis, string compareTo)
        {
            string regex = compareThis.Replace(".", "\\.").Replace("*", ".*").Replace("?", ".?");
            var pattern = new Regex(regex, RegexOptions.Multiline);

            Match matcher = pattern.Match(compareTo);

            return matcher.Success;
        }
    }
}