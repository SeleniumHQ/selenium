using System;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    public class StubDriver : IWebDriver
    {
        #region IWebDriver Members

        public string Url
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
            }
        }

        public string Title
        {
            get { throw new NotImplementedException(); }
        }

        public string PageSource
        {
            get { throw new NotImplementedException(); }
        }

        public string CurrentWindowHandle
        {
            get { throw new NotImplementedException(); }
        }

        public ReadOnlyCollection<string> WindowHandles
        {
            get { throw new NotImplementedException(); }
        }

        public void Close()
        {
            throw new NotImplementedException();
        }

        public void Quit()
        {
            throw new NotImplementedException();
        }

        public IOptions Manage()
        {
            throw new NotImplementedException();
        }

        public INavigation Navigate()
        {
            throw new NotImplementedException();
        }

        public ITargetLocator SwitchTo()
        {
            throw new NotImplementedException();
        }

        public System.Collections.ObjectModel.ReadOnlyCollection<string> GetWindowHandles()
        {
            throw new NotImplementedException();
        }

        public string GetWindowHandle()
        {
            throw new NotImplementedException();
        }

        #endregion

        #region ISearchContext Members

        public IWebElement FindElement(By by)
        {
            throw new NotImplementedException();
        }

        public System.Collections.ObjectModel.ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            throw new NotImplementedException();
        }

        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}
