using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetElementIndex : SeleneseCommand
    {
        private const string ElementIndexFinderScript =
@"var _isCommentOrEmptyTextNode = function(node) {
    return node.nodeType == 8 || ((node.nodeType == 3) && !(/[^\\t\\n\\r ]/.test(node.data)));
}
var element = arguments[0];
var previousSibling;
var index = 0;
while ((previousSibling = element.previousSibling) != null) {
    if (!_isCommentOrEmptyTextNode(previousSibling)) {
        index++;
    }
    element = previousSibling;
}
return index;";

        private ElementFinder finder;

        public GetElementIndex(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            return JavaScriptLibrary.ExecuteScript(driver, ElementIndexFinderScript, element);
        }
    }
}
