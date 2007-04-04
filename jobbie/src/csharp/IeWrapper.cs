/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

using System;
using System.Collections;
using System.Runtime.InteropServices;
using System.Threading;
using System.Xml.XPath;
using IEWrapper;
using mshtml;
using SHDocVw;
using WebDriver.XPath;

namespace WebDriver
{
    [Guid("9077DEDA-652B-4efd-9560-3692086D4670")]
    [ClassInterface(ClassInterfaceType.None)]
    [ProgId("InternetExploderFox")]
    public class IeWrapper : WebDriver, IXPathNavigable, IDisposable
    {
        private InternetExplorer browser = new InternetExplorer();
        private bool documentComplete;

        public enum AccessBy
        {
            id,
            name
        }

        public IeWrapper()
        {
            Visible = false;
            browser.DocumentComplete += delegate
                                            {
                                                documentComplete = true;
                                            };
            browser.BeforeNavigate2 += delegate
                                           {
                                               documentComplete = false;
                                           };
        }

        internal bool DocumentComplete
        {
            set { documentComplete = value; }
        }

        public String Title
        {
            get { return HtmlDocument.title; }
        }

        public bool Visible
        {
            get { return browser.Visible; }
            set { browser.Visible = value; }
        }

        private void Navigate(string url)
        {
            object flags = null;
            object objectTargetFrameName = null;
            object postData = null;
            object headers = null;
            browser.Navigate(url, ref flags, ref objectTargetFrameName, ref postData, ref headers);
        }

        public void Get(string url)
        {
            documentComplete = false;
            Navigate(url);
            WaitForLoadToComplete();
        }

        internal void WaitForLoadToComplete()
        {
            if (browser == null)
            {
                return;
            }

            // Wait for IE to download everything
            while (!documentComplete)
            {
                Thread.Sleep(0);
            }

            // And apparently to sort itself out
            while (browser.ReadyState != tagREADYSTATE.READYSTATE_COMPLETE)
            {
                Thread.Sleep(20);
            }

            // This is what Watir does. Will it work here? Who knows?
            while (HtmlDocument.readyState != "complete")
            {
                Thread.Sleep(20);
            }
        }

        public void DumpBody()
        {
            // Console.WriteLine(GetDocumentText());
        }

        public void Close()
        {
            browser.Quit();
        }

        public string SelectTextWithXPath(string xpath)
        {
            XPathNavigator navigator = CreateNavigator();
            XPathNodeIterator iterator = navigator.Select(xpath);
            if (iterator.Count == 0)
                return null;

            iterator.MoveNext();
            return iterator.Current.Value.Trim();
        }

        public ArrayList SelectElementsByXPath(string xpath)
        {
            XPathNavigator navigator = CreateNavigator();
            XPathNodeIterator nodes = navigator.Select(xpath);
            IEnumerator allNodes = nodes.GetEnumerator();
            ArrayList elements = new ArrayList();
            while (allNodes.MoveNext())
            {
                NavigableDocument node = (NavigableDocument) allNodes.Current;
                elements.Add(new WrappedWebElement(this, node.UnderlyingObject as IHTMLDOMNode));
            }
            return elements;
        }

        public WebElement SelectElement(string selector)
        {
            if (selector.StartsWith("link="))
            {
                return SelectLinkWithText(selector);
            } 
            else if (selector.StartsWith("id="))
            {
                return SelectElementById(selector);
            }
            else
            {
                XPathNavigator navigator = CreateNavigator();
                NavigableDocument node = navigator.SelectSingleNode(selector) as NavigableDocument;
                if (node == null)
                    throw new NoSuchElementException("Cannot find an element with the expression: " + selector);
                return new WrappedWebElement(this, node.UnderlyingObject as IHTMLDOMNode);
            }
        }

        public XPathNavigator CreateNavigator()
        {
            return new NavigableDocument(browser.Document as IHTMLDocument2);
        }

        public void Dispose()
        {
            browser = null;
        }

        private WebElement SelectLinkWithText(String selector)
        {
            int equalsIndex = selector.IndexOf('=') + 1;
            string linkText = selector.Substring(equalsIndex).Trim();

            IHTMLElementCollection links = HtmlDocument.links;
            IEnumerator enumerator = links.GetEnumerator();

            while (enumerator.MoveNext())
            {
                IHTMLElement element = (IHTMLElement) enumerator.Current;
                if (element.innerText == linkText)
                {
                    return new WrappedWebElement(this, (IHTMLDOMNode) element);
                }
            }
            throw new NoSuchElementException("Cannot find link with text: " + linkText);
        }

        private WebElement SelectElementById(String selector)
        {
            int equalsIndex = selector.IndexOf('=') + 1;
            string id = selector.Substring(equalsIndex).Trim();

            IHTMLElement element = HtmlDocument.getElementById(id);
            if (element != null)
            {
                return new WrappedWebElement(this, (IHTMLDOMNode) element);
            }
            throw new NoSuchElementException("Cannot find element with id: " + selector);
        }

        private HTMLDocument HtmlDocument
        {
            get
            {
                try
                {
                    return browser.Document as HTMLDocument;
                }
                catch (COMException)
                {
                    return null;
                }
            }
        }

        public string CurrentUrl
        {
            get { return ((HTMLDocument) browser.Document).url; }
        }
    }
}