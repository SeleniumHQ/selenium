using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    class IsTextPresent : SeleneseCommand
    {
        private static readonly Regex TextMatchingStrategyAndValueRegex = new Regex("^(\\p{Alpha}+):(.*)");
        private static Dictionary<string, ITextMatchingStrategy> textMatchingStrategies = new Dictionary<string, ITextMatchingStrategy>();
        private JavaScriptLibrary library;

        public IsTextPresent(JavaScriptLibrary js)
        {
            library = js;
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
                text = library.CallEmbeddedHtmlUtils(driver, "getTextContent", body).ToString();
            }

            text = text.Trim();


            string strategyName = "implicit";
            string use = pattern;

            if (TextMatchingStrategyAndValueRegex.IsMatch(pattern))
            {
                Match textMatch = TextMatchingStrategyAndValueRegex.Match(pattern);
                strategyName = textMatch.Groups[0].Value;
                use = textMatch.Groups[1].Value;
            }
            ITextMatchingStrategy strategy = textMatchingStrategies[strategyName];

            return strategy.IsAMatch(use, text);

        }

        private void SetUpTextMatchingStrategies()
        {
            textMatchingStrategies.Add("implicit", new GlobTextMatchingStrategy());
            textMatchingStrategies.Add("glob", new GlobTextMatchingStrategy());
            textMatchingStrategies.Add("regexp", new RegExTextMatchingStrategy());
            textMatchingStrategies.Add("exact", new ExactTextMatchingStrategy());
        }
    }
}
