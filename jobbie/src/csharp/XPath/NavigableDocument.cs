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
using System.Xml;
using System.Xml.XPath;
using mshtml;
using WebDriver.XPath;

namespace WebDriver
{
    internal class NavigableDocument : XPathNavigator
    {
        private IHTMLDocument2 document;
        private ElementNode element;
        private AttributeNodes attrs;

        public NavigableDocument(IHTMLDocument2 document)
        {
            element = new ElementNode(document);
            this.document = document;
        }
        
        private NavigableDocument()
        {
        }
        
        public override XPathNavigator Clone()
        {
            NavigableDocument other = new NavigableDocument();
            other.document = document;
            other.MoveTo(this);
            return other;
        }

        public override bool MoveToFirstAttribute()
        {
            IHTMLAttributeCollection collection = (IHTMLAttributeCollection)CurrentNode.attributes;
            if (collection == null)
            {
                return false;
            }

            attrs = new AttributeNodes(CurrentNode);
            if (!attrs.MoveNext())
            {
                attrs = null;
                return false;
            }
            return true;
        }

        public override bool MoveToNextAttribute()
        {
            if (!attrs.MoveNext())
            {
                attrs.ResetToCurrentLocation();
                return false;
            }
            return true;
        }

        public override bool MoveToFirstNamespace(XPathNamespaceScope namespaceScope)
        {
            throw new NotImplementedException();
        }

        public override bool MoveToNextNamespace(XPathNamespaceScope namespaceScope)
        {
            throw new NotImplementedException();
        }

        public override bool MoveToNext()
        {
            if (!element.HasNextSibling)
                return false;

            element = element.NextSibling;
            attrs = null;
            return true;
        }

        public override bool MoveToPrevious()
        {
            throw new NotImplementedException();
        }

        public override bool MoveToFirstChild()
        {
            if (!element.HasFirstChild)
                return false;

            element = element.FirstChild;
            return true;
        }

        public override bool MoveToParent()
        {
            if (attrs != null)
            {
                attrs = null;
            }
            if (!element.HasParent)
                return false;
            element = element.Parent;
            attrs = null;
            
            return true;
        }

        public override bool MoveTo(XPathNavigator other)
        {
            NavigableDocument o = other as NavigableDocument;
            if (o == null)
                return false;

            element = new ElementNode(o.element);

            if (o.attrs != null)
            {
                attrs = new AttributeNodes(o.attrs);
            }
            return true;
        }

        public override bool MoveToId(string id)
        {
            throw new NotImplementedException();
        }

        public override bool IsSamePosition(XPathNavigator other)
        {
            NavigableDocument o = other as NavigableDocument;
            if (o == null)
                return false;
            
            if (!document.Equals(o.document) || !element.Equals(o.element))
                return false;
            
            if (o.attrs == null && attrs == null)
                return true;

            return o.attrs == attrs;
        }

        public override XmlNameTable NameTable
        {
            get { throw new NotImplementedException(); }
        }

        public override XPathNodeType NodeType
        {
            get
            {
                if (attrs != null)
                    return attrs.NodeType;

                return element.NodeType;
            }
        }

        public override string LocalName
        {
            get
            {
                if (attrs != null)
                    return attrs.NodeName;
                return element.NodeNode;
            }
        }

        public override string Name
        {
            get { throw new NotImplementedException(); }
        }

        public override string NamespaceURI
        {
            get { return string.Empty; }
        }

        public override string Prefix
        {
            get { throw new NotImplementedException(); }
        }

        public override string BaseURI
        {
            get
            {
                return document.url;
            }
        }

        public override bool IsEmptyElement
        {
            get { throw new NotImplementedException(); }
        }

        public override string Value
        {
            get
            {
                if (attrs != null)
                    return attrs.NodeValue;

                return element.NodeValue;
            }
        }

        private IHTMLDOMNode CurrentNode
        {
            get { return element.Node; }
        }


        public override object UnderlyingObject
        {
            get { return CurrentNode; }
        }
    }
}