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
using System.IO;
using System.Runtime.InteropServices;
using System.Security;
using System.Text.RegularExpressions;
using System.Threading;
using System.Xml;
using System.Xml.XPath;
using IEWrapper;
using mshtml;
using SHDocVw;
using STATSTG=System.Runtime.InteropServices.ComTypes.STATSTG;

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
            get { return GetDocument().title; }
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
            while (GetDocument().readyState != "complete")
            {
                Thread.Sleep(20);
            }
        }

        public void DumpBody()
        {
            // Console.WriteLine(GetDocumentText());
        }

        public string GetDocumentText()
        {
            StreamReader reader = new StreamReader(GetDocumentStream());
            return reader.ReadToEnd();
        }

        public XmlDocument GetDocumentXml()
        {
            //HACK: XmlDocument tries to load the dtd - which doesn't always exist.  Chopping it out until a better 
            //way is found

            string text = GetDocumentText();
            text = Regex.Replace(text, "<!DOCTYPE.*?>", "");
            text = Regex.Replace(text, "xmlns=\".*?\"", "");

            // HACK: This takes out the html tag's xmlns declaration so that we can use simple XPath queries
            text = text.Replace("xmlns=\"http://www.w3.org/1999/xhtml\"", "");

            XmlDocument xml = new XmlDocument();
            xml.LoadXml(text);
            return xml;
        }

        private Stream GetDocumentStream()
        {
            /*
         * The only way to get the original document source is to have the browser save it to a stream - this is
         * achieved by casting it to the IPersistStreamInit COM type.  As managed equivalents for this type or the
         * types it uses we have to create them ourselves.  Beware, some of it was lifted from private classes within
         * the .Net framework, so could be legally dodgy.
         */

            IPersistStreamInit persister = browser.Document as IPersistStreamInit;
            MemoryStream baseStream = new MemoryStream();
            ComStream comStream = new ComStream(baseStream);
            persister.Save(comStream, false);
            baseStream.Position = 0;
            return baseStream;

            // We might well try something like this:
//            IHTMLDocument2 doc = (IHTMLDocument2)this.axWebBrowser1.Document;
//            UCOMIPersistFile pf = (UCOMIPersistFile)doc;
//            pf.Save(@"c:\myhtmlpage.html", true);
        }

        public HTMLDocument GetDocument()
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

        [
            ComImport, Guid("7FD52380-4E07-101B-AE2D-08002B2EC713"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)
                ,
                SuppressUnmanagedCodeSecurity]
        private interface IPersistStreamInit
        {
            void GetClassID(out Guid pClassID);

            [PreserveSig]
            int IsDirty();

            void Load([In, MarshalAs(UnmanagedType.Interface)] IStream pstm);

            void Save([In, MarshalAs(UnmanagedType.Interface)] IStream pstm,
                      [In, MarshalAs(UnmanagedType.Bool)] bool fClearDirty);

            void GetSizeMax([Out, MarshalAs(UnmanagedType.U8)] ulong pcbSize);
            void InitNew();
        }

        [
            ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), SuppressUnmanagedCodeSecurity,
                Guid("0000000C-0000-0000-C000-000000000046")]
        private interface IStream
        {
            int Read(IntPtr buf, int len);
            int Write(IntPtr pBuffer, int length);

            [return : MarshalAs(UnmanagedType.I8)]
            long Seek([In, MarshalAs(UnmanagedType.I8)] long dlibMove, int dwOrigin);

            void SetSize([In, MarshalAs(UnmanagedType.I8)] long libNewSize);

            [return : MarshalAs(UnmanagedType.I8)]
            long CopyTo([In, MarshalAs(UnmanagedType.Interface)] IStream pstm, [In, MarshalAs(UnmanagedType.I8)] long cb,
                        [Out, MarshalAs(UnmanagedType.LPArray)] long[] pcbRead);

            void Commit(int grfCommitFlags);
            void Revert();

            void LockRegion([In, MarshalAs(UnmanagedType.I8)] long libOffset, [In, MarshalAs(UnmanagedType.I8)] long cb,
                            int dwLockType);

            void UnlockRegion([In, MarshalAs(UnmanagedType.I8)] long libOffset,
                              [In, MarshalAs(UnmanagedType.I8)] long cb,
                              int dwLockType);

            void Stat([Out] STATSTG pStatstg, int grfStatFlag);

            [return : MarshalAs(UnmanagedType.Interface)]
            IStream Clone();
        }

        private class ComStream : IStream
        {
            private readonly Stream baseStream;

            public ComStream(Stream stream)
            {
                baseStream = stream;
            }

            public int Write(IntPtr pBuffer, int length)
            {
                byte[] buffer = new byte[length];
                Marshal.Copy(pBuffer, buffer, 0, length);
                baseStream.Write(buffer, 0, length);
                return length;
            }

            #region not implemented

            public int Read(IntPtr buf, int len)
            {
                throw new NotImplementedException();
            }

            public long Seek(long dlibMove, int dwOrigin)
            {
                throw new NotImplementedException();
            }

            public void SetSize(long libNewSize)
            {
                throw new NotImplementedException();
            }

            public long CopyTo(IStream pstm, long cb, long[] pcbRead)
            {
                throw new NotImplementedException();
            }

            public void Commit(int grfCommitFlags)
            {
                throw new NotImplementedException();
            }

            public void Revert()
            {
                throw new NotImplementedException();
            }

            public void LockRegion(long libOffset, long cb, int dwLockType)
            {
                throw new NotImplementedException();
            }

            public void UnlockRegion(long libOffset, long cb, int dwLockType)
            {
                throw new NotImplementedException();
            }

            public void Stat(STATSTG pStatstg, int grfStatFlag)
            {
                throw new NotImplementedException();
            }

            public IStream Clone()
            {
                throw new NotImplementedException();
            }

            #endregion
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
                elements.Add(new WrappedWebElement(this, node.CurrentNode));
            }
            return elements;
        }

        public WebElement SelectElement(string xpath)
        {
            if (xpath.StartsWith("link="))
            {
                return SelectLinkWithText(xpath);
            }
            else
            {
                XPathNavigator navigator = CreateNavigator();
                NavigableDocument node = navigator.SelectSingleNode(xpath) as NavigableDocument;
                if (node == null)
                    throw new NoSuchElementException("Cannot find an element with the expression: " + xpath);
                return new WrappedWebElement(this, node.CurrentNode);
            }
        }

        public void EvaluateJavascript(string javascript)
        {
            IHTMLDocument2 document = (IHTMLDocument2) browser.Document;
            IHTMLWindow2 window = document.parentWindow;

            if (window == null)
                return;

            window.execScript(javascript, "javascript");
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
            String linkText = selector.Substring(equalsIndex).Trim();

            IHTMLElementCollection links = GetDocument().links;
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
    }
}