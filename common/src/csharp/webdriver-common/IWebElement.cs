using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium
{
    public interface IWebElement
    {
        string TagName
        {
            get;
        }

        string Text
        {
            get;
        }

        string Value
        {
            get;
        }

        bool Enabled
        {
            get;
        }

        bool Selected
        {
            get;
        }

        void Clear();
        void SendKeys(string text);

        void Submit();

        void Click();

        void Select();

        string GetAttribute(string attributeName);

        bool Toggle();

        ReadOnlyCollection<IWebElement> FindElements(By by);

        IWebElement FindElement(By by);
    }
}
