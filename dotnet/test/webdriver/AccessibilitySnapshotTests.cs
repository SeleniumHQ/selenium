// <copyright file="AccessibilitySnapshotTests.cs" company="Selenium Committers">
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

using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace OpenQA.Selenium.Tests;

/// <summary>
/// driver.GetAccessibilitySnapshotAsync() and element.GetAccessibilitySnapshotAsync() over BiDi.
/// The shared corpus in common/src/web/accessibility is the cross-binding contract: every page is
/// snapshotted whole and compared with its recorded tree and text. The fixture's one driver is
/// created with the WebSocket URL, since the snapshot runs over BiDi.
/// </summary>
[TestFixture]
public class AccessibilitySnapshotTests : DriverTestFixture
{
    // The atom records frames as leaves; the binding fills them in, so this page has its own tests.
    private const string FramesPage = "014-iframe";

    public static IEnumerable<string> ListCorpusPages()
    {
        foreach (JsonNode? page in JsonNode.Parse(Read("index.json"))!.AsArray())
        {
            string name = page!.GetValue<string>();
            if (name != FramesPage)
            {
                yield return name;
            }
        }
    }

    protected override void ConfigureDriverOptions(DriverOptions options)
    {
        options.UseWebSocketUrl = true;

        if (options is Safari.SafariOptions safariOptions)
        {
            safariOptions.AddAdditionalOption("safari:experimentalWebSocketUrl", true);
        }
    }

    [TestCaseSource(nameof(ListCorpusPages))]
    public async Task WholePageSnapshotMatchesTheCorpus(string page)
    {
        this.Load(page);

        AccessibilityNode tree = await this.BiDiDriver.GetAccessibilitySnapshotAsync();

        JsonNode actual = JsonNode.Parse(Serialize(tree).ToJsonString())!;
        JsonNode expected = JsonNode.Parse(this.ReadExpected(page, "json"))!;
        Assert.That(JsonNode.DeepEquals(actual, expected), Is.True, () => "snapshot differs from the corpus:\n" + actual.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));
        Assert.That(tree.ToText() + "\n", Is.EqualTo(this.ReadExpected(page, "txt")));
    }

    [Test]
    public async Task WholePageSnapshotIsRootedAtTheDocument()
    {
        this.Load("001-headings-and-landmarks");

        AccessibilityNode tree = await this.BiDiDriver.GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("document"));
        Assert.That(tree.Element, Is.Not.Null);
        Assert.That(tree.Element!.TagName, Is.EqualTo("html"));
    }

    [Test]
    public async Task ElementReferencesAreUsable()
    {
        this.Load("003-links-and-buttons");

        AccessibilityNode tree = await this.BiDiDriver.GetAccessibilitySnapshotAsync();

        AccessibilityNode button = Walk(tree).First(node => node.Role == "button");
        Assert.That(button.Element!.TagName, Is.AnyOf("button", "input", "a"));
        Assert.That(button.Element.GetDomAttribute("id"), Is.Not.Empty);
    }

    [Test]
    public async Task SubtreeSnapshotAlwaysProducesANodeForItsRoot()
    {
        this.Load("005-lists");
        WebElement root = (WebElement)this.Driver.FindElement(By.TagName("body"));

        AccessibilityNode tree = await root.GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("generic"));
        Assert.That(tree.Element!.TagName, Is.EqualTo("body"));
        Assert.That(Walk(tree).Any(node => node.Role == "list"), Is.True);
    }

    [Test]
    public async Task SubtreeSnapshotOfANodeFromAnEarlierSnapshot()
    {
        this.Load("005-lists");
        AccessibilityNode firstList = Walk(await this.BiDiDriver.GetAccessibilitySnapshotAsync()).First(node => node.Role == "list");

        AccessibilityNode tree = await ((WebElement)firstList.Element!).GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("list"));
        Assert.That(ListRoles(tree.Children), Is.EqualTo(ListRoles(firstList.Children)));
    }

    [Test]
    public async Task FramesAreStitchedIn()
    {
        this.Load(FramesPage);

        AccessibilityNode tree = await this.BiDiDriver.GetAccessibilitySnapshotAsync();

        List<AccessibilityNode> frames = Walk(tree).Where(node => node.Role == "iframe").ToList();
        Assert.That(frames.Select(frame => frame.Name), Is.EqualTo(new[] { "Embedded content", "" }));
        foreach (AccessibilityNode frame in frames)
        {
            Assert.That(frame.Children, Has.Count.EqualTo(1), "a reachable frame carries its document as the one child");
            Assert.That(frame.Children[0].Role, Is.EqualTo("document"));
            Assert.That(frame.Children[0].Element, Is.Not.Null);
        }

        // The text form renders the stitched tree; the atom-level expectation stops at the leaves.
        Assert.That(tree.ToText().Split("- document"), Has.Length.EqualTo(4));

        // A reference inside a frame works through classic commands once that frame is current.
        this.Driver.SwitchTo().Frame(frames[0].Element!);
        try
        {
            Assert.That(frames[0].Children[0].Element!.TagName, Is.EqualTo("html"));
        }
        finally
        {
            this.Driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public async Task SubtreeSnapshotOfAnIframeElementCarriesItsDocument()
    {
        this.Load(FramesPage);
        WebElement frame = (WebElement)this.Driver.FindElement(By.Id("frame"));

        AccessibilityNode tree = await frame.GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("iframe"));
        Assert.That(tree.Name, Is.EqualTo("Embedded content"));
        Assert.That(ListRoles(tree.Children), Is.EqualTo(new[] { "document" }));
    }

    [Test]
    public async Task SubtreeSnapshotInsideAFrame()
    {
        this.Load(FramesPage);
        this.Driver.SwitchTo().Frame("frame");
        try
        {
            WebElement body = (WebElement)this.Driver.FindElement(By.TagName("body"));
            AccessibilityNode tree = await body.GetAccessibilitySnapshotAsync();

            // The root is the frame's body, not the top document that owns the window.
            Assert.That(tree.Role, Is.EqualTo("generic"));
            Assert.That(tree.Name, Is.Empty);
            Assert.That(tree.Element!.TagName, Is.EqualTo("body"));
        }
        finally
        {
            this.Driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public async Task WholePageSnapshotIgnoresTheFrameTheDriverSwitchedTo()
    {
        this.Load(FramesPage);
        this.Driver.SwitchTo().Frame("frame");
        AccessibilityNode tree;
        try
        {
            tree = await this.BiDiDriver.GetAccessibilitySnapshotAsync();
        }
        finally
        {
            this.Driver.SwitchTo().DefaultContent();
        }

        Assert.That(tree.Name, Is.EqualTo("Frames"));
    }

    [Test]
    public void AStaleRootRaisesTheStaleElementError()
    {
        this.Load("005-lists");
        WebElement root = (WebElement)this.Driver.FindElement(By.TagName("body"));
        this.Load("001-headings-and-landmarks");

        Assert.That(async () => await root.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<StaleElementReferenceException>());
    }

    [Test]
    public void ADetachedRootRaisesTheStaleElementError()
    {
        this.Load("005-lists");
        WebElement item = (WebElement)this.Driver.FindElement(By.TagName("li"));
        ((IJavaScriptExecutor)this.Driver).ExecuteScript("arguments[0].remove()", item);

        Assert.That(async () => await item.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<StaleElementReferenceException>());
    }

    [Test]
    public async Task ASnapshotIsACopy()
    {
        this.Load("005-lists");
        AccessibilityNode before = await this.BiDiDriver.GetAccessibilitySnapshotAsync();
        ((IJavaScriptExecutor)this.Driver).ExecuteScript("document.querySelector('li').textContent = 'changed'");

        AccessibilityNode after = await this.BiDiDriver.GetAccessibilitySnapshotAsync();

        Assert.That(after.ToText(), Is.Not.EqualTo(before.ToText()));
        Assert.That(after.ToText(), Does.Contain("changed"));
    }

    private WebDriver BiDiDriver => (WebDriver)this.Driver;

    private void Load(string page)
    {
        this.Driver.Url = Urls.WhereIs("accessibility/" + page + ".html");
    }

    private string DetectEngine()
    {
        string name = (((IHasCapabilities)this.Driver).Capabilities.GetCapability("browserName")?.ToString() ?? string.Empty).ToLowerInvariant();
        if (name.Contains("firefox"))
        {
            return "firefox";
        }

        if (name.Contains("safari") || name.Contains("webkit"))
        {
            return "webkit";
        }

        return "chromium";
    }

    // The engine-specific expectation when one is recorded, else the shared one.
    private string ReadExpected(string page, string suffix)
    {
        return Fetch(page + ".expected." + this.DetectEngine() + "." + suffix) ?? Read(page + ".expected." + suffix);
    }

    // The corpus JSON form: every field written, `element` as the element's id.
    private static JsonObject Serialize(AccessibilityNode node)
    {
        var states = new JsonObject();
        foreach (KeyValuePair<string, object> state in node.States)
        {
            states[state.Key] = state.Value switch
            {
                bool flag => JsonValue.Create(flag),
                long number => JsonValue.Create(number),
                _ => JsonValue.Create(state.Value.ToString()),
            };
        }

        var json = new JsonObject
        {
            ["role"] = node.Role,
            ["name"] = node.Name,
            ["description"] = node.Description,
        };
        if (node.Value is not null)
        {
            json["value"] = node.Value;
        }

        json["states"] = states;
        if (node.Element is not null)
        {
            json["element"] = node.Element.GetDomAttribute("id");
        }

        var children = new JsonArray();
        foreach (AccessibilityNode child in node.Children)
        {
            children.Add(Serialize(child));
        }

        json["children"] = children;
        return json;
    }

    private static IEnumerable<AccessibilityNode> Walk(AccessibilityNode node)
    {
        yield return node;
        foreach (AccessibilityNode child in node.Children)
        {
            foreach (AccessibilityNode descendant in Walk(child))
            {
                yield return descendant;
            }
        }
    }

    private static List<string> ListRoles(IEnumerable<AccessibilityNode> nodes)
    {
        return nodes.Select(node => node.Role).ToList();
    }

    private static string Read(string file)
    {
        return Fetch(file) ?? throw new InvalidOperationException("the corpus has no " + file);
    }

    // The corpus is read from the test web server, as the pages are, so nothing is read from the
    // source tree; null when the server has no such file. A client per read keeps the fixture free
    // of anything to dispose, since the case list is read at discovery time.
    private static string Fetch(string file)
    {
        using var client = new HttpClient();
        using HttpResponseMessage response = client.GetAsync(Urls.WhereIs("accessibility/" + file)).GetAwaiter().GetResult();
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return Encoding.UTF8.GetString(response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult());
    }
}
