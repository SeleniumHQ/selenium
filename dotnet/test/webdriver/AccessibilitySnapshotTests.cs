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

using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using OpenQA.Selenium.Testing.NUnit.Environment;

namespace OpenQA.Selenium.Tests;

/// <summary>
/// driver.GetAccessibilitySnapshotAsync() and element.GetAccessibilitySnapshotAsync() over BiDi.
/// The shared corpus in common/src/web/accessibility is the cross-binding contract: every page is
/// snapshotted whole and compared with its recorded tree and text.
/// </summary>
[Parallelizable(ParallelScope.All)]
[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]
public class AccessibilitySnapshotTests
{
    // The atom records frames as leaves; the binding fills them in, so this page has its own tests.
    private const string FramesPage = "014-iframe";

    private static readonly string Corpus = Path.Combine(FindWebContentRoot(), "accessibility");

    private IWebDriver driver;

    private static UrlBuilder Urls => EnvironmentManager.Instance.WebServer.Urls;

    public static IEnumerable<string> CorpusPages()
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

    [SetUp]
    public void CreateBiDiDriver()
    {
        var driverFactory = new DriverFactory(EnvironmentManager.Instance);
        this.driver = driverFactory.CreateDriver(configureOptions: options =>
        {
            options.UseWebSocketUrl = true;

            if (options is Safari.SafariOptions safariOptions)
            {
                safariOptions.AddAdditionalOption("safari:experimentalWebSocketUrl", true);
            }
        });
    }

    [TearDown]
    public async Task QuitDriver()
    {
        if (this.driver is not null)
        {
            await this.driver.DisposeAsync();
        }
    }

    [TestCaseSource(nameof(CorpusPages))]
    public async Task WholePageSnapshotMatchesTheCorpus(string page)
    {
        this.Load(page);

        AccessibilityNode tree = await this.Driver.GetAccessibilitySnapshotAsync();

        JsonNode actual = JsonNode.Parse(Serialize(tree).ToJsonString())!;
        JsonNode expected = JsonNode.Parse(this.Expected(page, "json"))!;
        Assert.That(JsonNode.DeepEquals(actual, expected), Is.True, () => "snapshot differs from the corpus:\n" + actual.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));
        Assert.That(tree.ToText() + "\n", Is.EqualTo(this.Expected(page, "txt")));
    }

    [Test]
    public async Task WholePageSnapshotIsRootedAtTheDocument()
    {
        this.Load("001-headings-and-landmarks");

        AccessibilityNode tree = await this.Driver.GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("document"));
        Assert.That(tree.Element, Is.Not.Null);
        Assert.That(tree.Element!.TagName, Is.EqualTo("html"));
    }

    [Test]
    public async Task ElementReferencesAreUsable()
    {
        this.Load("003-links-and-buttons");

        AccessibilityNode tree = await this.Driver.GetAccessibilitySnapshotAsync();

        AccessibilityNode button = Walk(tree).First(node => node.Role == "button");
        Assert.That(button.Element!.TagName, Is.AnyOf("button", "input", "a"));
        Assert.That(button.Element.GetDomAttribute("id"), Is.Not.Empty);
    }

    [Test]
    public async Task SubtreeSnapshotAlwaysProducesANodeForItsRoot()
    {
        this.Load("005-lists");
        WebElement root = (WebElement)this.driver.FindElement(By.TagName("body"));

        AccessibilityNode tree = await root.GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("generic"));
        Assert.That(tree.Element!.TagName, Is.EqualTo("body"));
        Assert.That(Walk(tree).Any(node => node.Role == "list"), Is.True);
    }

    [Test]
    public async Task SubtreeSnapshotOfANodeFromAnEarlierSnapshot()
    {
        this.Load("005-lists");
        AccessibilityNode firstList = Walk(await this.Driver.GetAccessibilitySnapshotAsync()).First(node => node.Role == "list");

        AccessibilityNode tree = await ((WebElement)firstList.Element!).GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("list"));
        Assert.That(Roles(tree.Children), Is.EqualTo(Roles(firstList.Children)));
    }

    [Test]
    public async Task FramesAreStitchedIn()
    {
        this.Load(FramesPage);

        AccessibilityNode tree = await this.Driver.GetAccessibilitySnapshotAsync();

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
        this.driver.SwitchTo().Frame(frames[0].Element!);
        try
        {
            Assert.That(frames[0].Children[0].Element!.TagName, Is.EqualTo("html"));
        }
        finally
        {
            this.driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public async Task SubtreeSnapshotOfAnIframeElementCarriesItsDocument()
    {
        this.Load(FramesPage);
        WebElement frame = (WebElement)this.driver.FindElement(By.Id("frame"));

        AccessibilityNode tree = await frame.GetAccessibilitySnapshotAsync();

        Assert.That(tree.Role, Is.EqualTo("iframe"));
        Assert.That(tree.Name, Is.EqualTo("Embedded content"));
        Assert.That(Roles(tree.Children), Is.EqualTo(new[] { "document" }));
    }

    [Test]
    public async Task SubtreeSnapshotInsideAFrame()
    {
        this.Load(FramesPage);
        this.driver.SwitchTo().Frame("frame");
        try
        {
            WebElement body = (WebElement)this.driver.FindElement(By.TagName("body"));
            AccessibilityNode tree = await body.GetAccessibilitySnapshotAsync();

            // The root is the frame's body, not the top document that owns the window.
            Assert.That(tree.Role, Is.EqualTo("generic"));
            Assert.That(tree.Name, Is.Empty);
            Assert.That(tree.Element!.TagName, Is.EqualTo("body"));
        }
        finally
        {
            this.driver.SwitchTo().DefaultContent();
        }
    }

    [Test]
    public async Task WholePageSnapshotIgnoresTheFrameTheDriverSwitchedTo()
    {
        this.Load(FramesPage);
        this.driver.SwitchTo().Frame("frame");
        AccessibilityNode tree;
        try
        {
            tree = await this.Driver.GetAccessibilitySnapshotAsync();
        }
        finally
        {
            this.driver.SwitchTo().DefaultContent();
        }

        Assert.That(tree.Name, Is.EqualTo("Frames"));
    }

    [Test]
    public void AStaleRootRaisesTheStaleElementError()
    {
        this.Load("005-lists");
        WebElement root = (WebElement)this.driver.FindElement(By.TagName("body"));
        this.Load("001-headings-and-landmarks");

        Assert.That(async () => await root.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<StaleElementReferenceException>());
    }

    [Test]
    public void ADetachedRootRaisesTheStaleElementError()
    {
        this.Load("005-lists");
        WebElement item = (WebElement)this.driver.FindElement(By.TagName("li"));
        ((IJavaScriptExecutor)this.driver).ExecuteScript("arguments[0].remove()", item);

        Assert.That(async () => await item.GetAccessibilitySnapshotAsync(), Throws.InstanceOf<StaleElementReferenceException>());
    }

    [Test]
    public async Task ASnapshotIsACopy()
    {
        this.Load("005-lists");
        AccessibilityNode before = await this.Driver.GetAccessibilitySnapshotAsync();
        ((IJavaScriptExecutor)this.driver).ExecuteScript("document.querySelector('li').textContent = 'changed'");

        AccessibilityNode after = await this.Driver.GetAccessibilitySnapshotAsync();

        Assert.That(after.ToText(), Is.Not.EqualTo(before.ToText()));
        Assert.That(after.ToText(), Does.Contain("changed"));
    }

    private WebDriver Driver => (WebDriver)this.driver;

    private void Load(string page)
    {
        this.driver.Url = Urls.WhereIs("accessibility/" + page + ".html");
    }

    private string Engine()
    {
        string name = (((IHasCapabilities)this.driver).Capabilities.GetCapability("browserName")?.ToString() ?? string.Empty).ToLowerInvariant();
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
    private string Expected(string page, string suffix)
    {
        string specific = Path.Combine(Corpus, page + ".expected." + this.Engine() + "." + suffix);
        return File.Exists(specific) ? File.ReadAllText(specific, Encoding.UTF8) : Read(page + ".expected." + suffix);
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

    private static List<string> Roles(IEnumerable<AccessibilityNode> nodes)
    {
        return nodes.Select(node => node.Role).ToList();
    }

    private static string Read(string file)
    {
        return File.ReadAllText(Path.Combine(Corpus, file), Encoding.UTF8);
    }

    // The shared test pages, found the way the test web server finds them.
    private static string FindWebContentRoot()
    {
        var info = new DirectoryInfo(AppContext.BaseDirectory);
        while (info is not null && info != info.Root)
        {
            string webPath = Path.Combine(info.FullName, "common", "src", "web");
            if (Directory.Exists(webPath))
            {
                return webPath;
            }

            info = info.Parent;
        }

        throw new DirectoryNotFoundException("common/src/web was not found above " + AppContext.BaseDirectory);
    }
}
