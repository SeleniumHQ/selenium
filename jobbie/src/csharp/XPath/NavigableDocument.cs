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
        private IHTMLDOMNode currentNode;
        private AttributeNodes attrs;

        public NavigableDocument(IHTMLDocument2 document)
        {
            currentNode = (IHTMLDOMNode) ((IHTMLDocument3)document).documentElement;
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
            IHTMLDOMNode sibling = CurrentNode.nextSibling;
            if (sibling == null)
            {
                return false;
            }
            currentNode = sibling;
            attrs = null;
            return true;
        }

        public override bool MoveToPrevious()
        {
            throw new NotImplementedException();
        }

        public override bool MoveToFirstChild()
        {
            IHTMLDOMNode child = currentNode.firstChild;
            if (child == null)
            {
                return false;
            }
            currentNode = child;
            return true;
        }

        public override bool MoveToParent()
        {
            if (attrs != null)
            {
                attrs = null;
            }
            IHTMLDOMNode parentNode = currentNode.parentNode;
            if (parentNode == null)
                return false;
            currentNode = parentNode;
            attrs = null;
            
            return true;
        }

        public override bool MoveTo(XPathNavigator other)
        {
            NavigableDocument o = other as NavigableDocument;
            if (o == null)
                return false;

            currentNode = o.currentNode;
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
            
            if (!document.Equals(o.document) || !currentNode.Equals(o.currentNode))
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
                
                switch (currentNode.nodeType)
                {
                    case 1:
                        return XPathNodeType.Element;

                    case 3:
                        return XPathNodeType.Text;

                    case 8:
                        return XPathNodeType.Comment;
                        
                    case 9:
                        return XPathNodeType.Root;
                        
                    case 11: // Claims to be a document fragment
                        return XPathNodeType.Text;

                    default:
                        Console.WriteLine("Unknown type: " + currentNode.nodeName + " (" + currentNode.nodeType + ") " + currentNode.nodeValue);
                        break;
                }
                throw new ArgumentException("Cannot identify node type");
            }
        }

        public override string LocalName
        {
            get
            {
                if (attrs != null)
                    return attrs.NodeName;
                return currentNode.nodeName.ToLower();
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
                
                if (currentNode is IHTMLTitleElement)
                    return document.title;
                IHTMLElement element = currentNode as IHTMLElement;
                if (element != null)
                {
                    return element.innerText;
                }
                return currentNode.nodeValue.ToString();
            }
        }

        private IHTMLDOMNode CurrentNode
        {
            get { return currentNode; }
        }


        public override object UnderlyingObject
        {
            get { return CurrentNode; }
        }
    }
}