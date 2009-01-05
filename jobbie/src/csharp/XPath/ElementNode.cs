/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System;
using System.Xml.XPath;
using mshtml;

namespace WebDriver
{
    internal class ElementNode
    {
        private readonly IHTMLDocument2 document;
        private readonly IHTMLDOMNode node;

        public ElementNode(IHTMLDocument2 document)
        {
            this.document = document;
            node = (IHTMLDOMNode) ((IHTMLDocument3)document).documentElement;
        }

        public ElementNode(IHTMLDOMNode node)
        {
            this.node = node;
            document = (IHTMLDocument2) ((IHTMLDOMNode2) node).ownerDocument;
        }

        public ElementNode(ElementNode element)
        {
            node = element.node;
            document = element.document;
        }

        public IHTMLDOMNode Node
        {
            get { return node; }
        }

        public bool HasNextSibling
        {
            get
            {
                return node.nextSibling != null;
            }
        }

        public ElementNode NextSibling
        {
            get
            {
                return new ElementNode(node.nextSibling);
            }
        }

        public bool HasFirstChild
        {
            get
            {
                return node.firstChild != null;
            }
        }

        public ElementNode FirstChild
        {
            get
            {
                return new ElementNode(node.firstChild);
            }
        }

        public bool HasParent
        {
            get
            {
                return node.parentNode != null;
            }
        }

        public ElementNode Parent
        {
            get
            {
                return new ElementNode(node.parentNode);
            }
        }

        public XPathNodeType NodeType
        {
            get
            {
                switch (node.nodeType)
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
                        Console.WriteLine("Unknown type: " + node.nodeName + " (" + node.nodeType + ") " + node.nodeValue);
                        break;
                }
                throw new ArgumentException("Cannot identify node type");
            }
        }

        public string NodeName
        {
            get { return node.nodeName.ToLower(); }
        }

        public string NodeValue
        {
            get
            {
                if (node is IHTMLTitleElement)
                    return document.title;
                IHTMLElement element = node as IHTMLElement;
                if (element != null)
                {
                    return element.innerText;
                }
                return node.nodeValue.ToString();
            }
        }


        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            ElementNode elementNode = obj as ElementNode;
            if (elementNode == null) return false;
            return Equals(node, elementNode.node);
        }

        public override int GetHashCode()
        {
            return node.GetHashCode();
        }
    }
}