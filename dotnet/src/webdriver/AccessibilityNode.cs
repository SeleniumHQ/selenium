// <copyright file="AccessibilityNode.cs" company="Selenium Committers">
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

using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium;

/// <summary>
/// One node of an accessibility snapshot, as returned by
/// <see cref="WebDriver.GetAccessibilitySnapshotAsync(CancellationToken)"/> and
/// <see cref="WebElement.GetAccessibilitySnapshotAsync(CancellationToken)"/>.
/// </summary>
/// <remarks>
/// The tree is computed in the page from the DOM following WAI-ARIA, html-aam and accname.
/// It is not the browser's own accessibility tree and can differ from it at the edges.
/// </remarks>
public sealed class AccessibilityNode
{
    // The order the text form writes states in.
    private static readonly string[] StateOrder = { "checked", "pressed", "expanded", "selected", "level", "disabled", "focused" };

    /// <summary>
    /// Initializes a new instance of the <see cref="AccessibilityNode"/> class.
    /// </summary>
    /// <param name="role">The WAI-ARIA role token; <c>text</c> for text leaves and <c>iframe</c> for frames.</param>
    /// <param name="name">The computed accessible name, empty when there is none.</param>
    /// <param name="description">The computed accessible description, empty when there is none.</param>
    /// <param name="value">The current value for textbox, searchbox, combobox and range roles, or <see langword="null"/>.</param>
    /// <param name="states">The states that apply, keyed by name; values are <see cref="bool"/>, <see cref="long"/> or <see cref="string"/>.</param>
    /// <param name="element">The element the node is backed by, or <see langword="null"/> for a text leaf.</param>
    /// <param name="children">The child nodes.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="role"/>, <paramref name="name"/>, <paramref name="description"/>, <paramref name="states"/> or <paramref name="children"/> is <see langword="null"/>.</exception>
    public AccessibilityNode(
        string role,
        string name,
        string description,
        string? value,
        IReadOnlyDictionary<string, object> states,
        IWebElement? element,
        IReadOnlyList<AccessibilityNode> children)
    {
        ArgumentNullException.ThrowIfNull(role);
        ArgumentNullException.ThrowIfNull(name);
        ArgumentNullException.ThrowIfNull(description);
        ArgumentNullException.ThrowIfNull(states);
        ArgumentNullException.ThrowIfNull(children);

        this.Role = role;
        this.Name = name;
        this.Description = description;
        this.Value = value;
        this.States = new ReadOnlyDictionary<string, object>(new Dictionary<string, object>(states.ToDictionary(pair => pair.Key, pair => pair.Value)));
        this.Element = element;
        this.Children = new ReadOnlyCollection<AccessibilityNode>(new List<AccessibilityNode>(children));
    }

    /// <summary>
    /// Gets the WAI-ARIA role token; <c>text</c> for text leaves and <c>iframe</c> for frames,
    /// under which the frame's own tree is attached.
    /// </summary>
    public string Role { get; }

    /// <summary>
    /// Gets the computed accessible name, empty when there is none.
    /// </summary>
    public string Name { get; }

    /// <summary>
    /// Gets the computed accessible description, empty when there is none.
    /// </summary>
    public string Description { get; }

    /// <summary>
    /// Gets the current value for textbox, searchbox, combobox and range roles; <see langword="null"/>
    /// where the role has none. A password field's value is masked.
    /// </summary>
    public string? Value { get; }

    /// <summary>
    /// Gets the states that apply: <c>checked</c>, <c>pressed</c>, <c>expanded</c>, <c>selected</c>,
    /// <c>level</c>, <c>disabled</c> and <c>focused</c>, each present only when it applies, as
    /// <see cref="bool"/>, <see cref="long"/> or <see cref="string"/> values. New keys may be added in
    /// any release, so ignore keys you do not recognise.
    /// </summary>
    public IReadOnlyDictionary<string, object> States { get; }

    /// <summary>
    /// Gets the element the node is backed by, usable for further commands, or <see langword="null"/>
    /// for a text leaf. An element inside a child frame can be used through classic commands only
    /// once the driver has switched to that frame.
    /// </summary>
    public IWebElement? Element { get; }

    /// <summary>
    /// Gets the child nodes, empty for a leaf.
    /// </summary>
    public IReadOnlyList<AccessibilityNode> Children { get; }

    /// <summary>
    /// Renders the tree as text, one node per line.
    /// </summary>
    /// <remarks>
    /// The line grammar is <c>- role "name" [state] [state=value]: value</c>, children indented two
    /// spaces, text leaves written as <c>- text: content</c>. An empty name is left out, as is an
    /// absent or empty value; a <see langword="true"/> state is written bare, a <see langword="false"/>
    /// one left out, any other value spelled. A line break or backslash in a value is escaped so a
    /// node never spans two lines. The description and element references are not rendered.
    /// </remarks>
    /// <returns>The text form, without a trailing newline.</returns>
    public string ToText()
    {
        StringBuilder builder = new StringBuilder();
        this.AppendLines(string.Empty, builder);
        return builder.ToString();
    }

    /// <inheritdoc/>
    public override string ToString()
    {
        return "AccessibilityNode{role=" + this.Role + ", name=" + Quote(this.Name) + "}";
    }

    private void AppendLines(string indent, StringBuilder builder)
    {
        if (builder.Length > 0)
        {
            // Always LF: the text form is compared byte for byte with the corpus and the other
            // bindings, whatever the platform.
            builder.Append('\n');
        }

        builder.Append(indent).Append(this.FormatLine());
        foreach (AccessibilityNode child in this.Children)
        {
            child.AppendLines(indent + "  ", builder);
        }
    }

    private string FormatLine()
    {
        if (this.Role == "text")
        {
            return "- text: " + this.Name;
        }

        StringBuilder line = new StringBuilder("- ").Append(this.Role);
        if (this.Name.Length > 0)
        {
            line.Append(' ').Append(Quote(this.Name));
        }

        foreach (string key in StateOrder)
        {
            if (!this.States.TryGetValue(key, out object? state))
            {
                continue;
            }

            if (state is bool flag)
            {
                if (flag)
                {
                    line.Append(" [").Append(key).Append(']');
                }
            }
            else
            {
                line.Append(" [").Append(key).Append('=').Append(Convert.ToString(state, System.Globalization.CultureInfo.InvariantCulture)).Append(']');
            }
        }

        if (!string.IsNullOrEmpty(this.Value))
        {
            line.Append(": ").Append(EscapeLineBreaks(this.Value!));
        }

        return line.ToString();
    }

    private static string Quote(string text)
    {
        return "\"" + text.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
    }

    private static string EscapeLineBreaks(string text)
    {
        return text.Replace("\\", "\\\\").Replace("\r", "\\r").Replace("\n", "\\n");
    }
}
