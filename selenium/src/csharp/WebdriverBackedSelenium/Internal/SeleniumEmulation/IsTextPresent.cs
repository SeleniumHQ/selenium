using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsTextPresent : SeleneseCommand
    {
        private static readonly Regex TextMatchingStrategyAndValueRegex = new Regex("^([a-zA-Z]+):(.*)");
        private static Dictionary<string, ITextMatchingStrategy> textMatchingStrategies = new Dictionary<string, ITextMatchingStrategy>();

        public IsTextPresent()
        {
            SetUpTextMatchingStrategies();
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string pattern, string ignored)
        {
            string text = string.Empty;
            IWebElement body = driver.FindElement(By.XPath("/html/body"));
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor == null)
            {
                text = body.Text;
            }
            else
            {
                text = JavaScriptLibrary.CallEmbeddedHtmlUtils(driver, "getTextContent", body).ToString();
            }

            text = text.Trim();

            string strategyName = "implicit";
            string use = pattern;

            if (TextMatchingStrategyAndValueRegex.IsMatch(pattern))
            {
                Match textMatch = TextMatchingStrategyAndValueRegex.Match(pattern);
                strategyName = textMatch.Groups[1].Value;
                use = textMatch.Groups[2].Value;
            }

            ITextMatchingStrategy strategy = textMatchingStrategies[strategyName];
            return strategy.IsAMatch(use, text);
        }

        private void SetUpTextMatchingStrategies()
        {
            if (textMatchingStrategies.Count == 0)
            {
                textMatchingStrategies.Add("implicit", new GlobTextMatchingStrategy());
                textMatchingStrategies.Add("glob", new GlobTextMatchingStrategy());
                textMatchingStrategies.Add("regexp", new RegexTextMatchingStrategy());
                textMatchingStrategies.Add("exact", new ExactTextMatchingStrategy());                
            }
        }
    }
}
