using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Xml.XPath;

namespace WebDriver
{
    [Guid("9077DEDA-652B-4efd-9560-3692086D4670")]
    [ClassInterface(ClassInterfaceType.None)]
    [ProgId("InternetExploderFox")]
    public class InternetExplorerDriver : WebDriver, IXPathNavigable, IDisposable
    {
        private IList<IeWrapper> allWrappers = new List<IeWrapper>();
        private IeWrapper currentWrapper;

        public InternetExplorerDriver()
        {
            currentWrapper = new IeWrapper(this);
            allWrappers.Add(currentWrapper);
        }

        public void Get(string url)
        {
            currentWrapper.Get(url);
        }

        public string SelectTextWithXPath(string xpath)
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.SelectTextWithXPath(xpath);
        }

        public ArrayList SelectElementsByXPath(string xpath)
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.SelectElementsByXPath(xpath);
        }

        public WebElement SelectElement(string selector)
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.SelectElement(selector);
        }

        public void DumpBody()
        {
            currentWrapper.WaitForLoadToComplete();
            currentWrapper.DumpBody();
        }

        public void Close()
        {
            currentWrapper.Close();
        }

        public TargetLocator SwitchTo()
        {
            return currentWrapper.SwitchTo();
        }

        public string CurrentUrl
        {
            get
            {
                currentWrapper.WaitForLoadToComplete();
                return currentWrapper.CurrentUrl;
            }
        }

        public string Title
        {
            get
            {
                currentWrapper.WaitForLoadToComplete();
                return currentWrapper.Title;
            }
        }

        public bool Visible
        {
            get { return currentWrapper.Visible; }
            set { currentWrapper.Visible = value; }
        }

        public void Dispose()
        {
            currentWrapper.Dispose();
        }

        public XPathNavigator CreateNavigator()
        {
            currentWrapper.WaitForLoadToComplete();
            return currentWrapper.CreateNavigator();
        }

        internal void AddWrapper(IeWrapper wrapper)
        {
            allWrappers.Add(wrapper);
            currentWrapper = wrapper;
        }

        public WebDriver SwitchToWindow(int index)
        {
            currentWrapper = allWrappers[index];
            return this;
        }
    }
}
