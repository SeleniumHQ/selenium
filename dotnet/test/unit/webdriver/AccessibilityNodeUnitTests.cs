// <copyright file="AccessibilityNodeUnitTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

namespace OpenQA.Selenium.Tests;

/// <summary>
/// The text form of a snapshot: the line grammar every binding renders. The browser suite holds
/// it to the shared corpus; these cases pin the grammar's edges without a page.
/// </summary>
public class AccessibilityNodeUnitTests
{
    [Test]
    public void ToText_NameStatesAndValue_RendersOneLineWithEscapes()
    {
        var states = new Dictionary<string, object>
        {
            ["focused"] = true,
            ["disabled"] = true,
            ["level"] = 2L,
            ["selected"] = false,
            ["pressed"] = "mixed",
        };
        var node = new AccessibilityNode(role: "textbox", name: "Say \"hi\" \\ bye", description: "", value: "line one\nline two\\", states: states, element: null, children: []);

        Assert.That(node.ToText(), Is.EqualTo("- textbox \"Say \\\"hi\\\" \\\\ bye\" [pressed=mixed] [level=2] [disabled] [focused]: line one\\nline two\\\\"));
    }

    [Test]
    public void ToText_RoleOnly_RendersTheRole()
    {
        Assert.That(MakeNode("list", "").ToText(), Is.EqualTo("- list"));
    }

    [Test]
    public void ToText_TextNode_RendersTheContentAfterAColon()
    {
        Assert.That(MakeNode("text", "plain words").ToText(), Is.EqualTo("- text: plain words"));
    }

    [Test]
    public void ToText_EmptyValue_OmitsTheValue()
    {
        var node = new AccessibilityNode(role: "textbox", name: "Empty", description: "", value: "", states: new Dictionary<string, object>(), element: null, children: []);

        Assert.That(node.ToText(), Is.EqualTo("- textbox \"Empty\""));
    }

    [Test]
    public void ToText_NestedChildren_IndentsTwoSpacesPerLevel()
    {
        var tree = MakeNode("list", "", MakeNode("listitem", "", MakeNode("text", "one"), MakeNode("link", "more")));

        Assert.That(tree.ToText(), Is.EqualTo("- list\n  - listitem\n    - text: one\n    - link \"more\""));
    }

    [Test]
    public void Constructor_StatesAndChildrenChangedAfterwards_KeepsItsOwnCopies()
    {
        var states = new Dictionary<string, object> { ["checked"] = true };
        var children = new List<AccessibilityNode> { MakeNode("text", "Agree") };
        var node = new AccessibilityNode(role: "checkbox", name: "Agree", description: "Terms", value: null, states: states, element: null, children: children);

        states["checked"] = false;
        children.Clear();

        Assert.That(node.Role, Is.EqualTo("checkbox"));
        Assert.That(node.Name, Is.EqualTo("Agree"));
        Assert.That(node.Description, Is.EqualTo("Terms"));
        Assert.That(node.Value, Is.Null);
        Assert.That(node.States["checked"], Is.EqualTo(true));
        Assert.That(node.Element, Is.Null);
        Assert.That(node.Children, Has.Count.EqualTo(1));
    }

    [Test]
    public void ToString_NodeWithName_ShowsRoleAndName()
    {
        var node = new AccessibilityNode(role: "checkbox", name: "Agree", description: "Terms", value: null, states: new Dictionary<string, object>(), element: null, children: []);

        Assert.That(node.ToString(), Is.EqualTo("AccessibilityNode{role=checkbox, name=\"Agree\"}"));
    }

    [Test]
    public void Constructor_NullRole_ThrowsArgumentNullException()
    {
        Assert.That(() => new AccessibilityNode(role: null!, name: "", description: "", value: null, states: new Dictionary<string, object>(), element: null, children: []), Throws.ArgumentNullException);
    }

    [Test]
    public void Constructor_NullStates_ThrowsArgumentNullException()
    {
        Assert.That(() => new AccessibilityNode(role: "button", name: "", description: "", value: null, states: null!, element: null, children: []), Throws.ArgumentNullException);
    }

    private static AccessibilityNode MakeNode(string role, string name, params AccessibilityNode[] children)
    {
        return new AccessibilityNode(role: role, name: name, description: "", value: null, states: new Dictionary<string, object>(), element: null, children: children);
    }
}
