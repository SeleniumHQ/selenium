// <copyright file="SpeculationTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.BrowsingContext;
using OpenQA.Selenium.BiDi.Speculation;

namespace OpenQA.Selenium.Tests.BiDi.Speculation;

internal class SpeculationTests : BiDiTestFixture
{
    [Test]
    [IgnoreBrowser(Infrastructure.Browser.Firefox, "Not supported yet?")]
    public async Task CanListenToPrefetchStatusUpdatedEvent()
    {
        var tcs = new TaskCompletionSource<PrefetchStatusUpdatedEventArgs>();

        var speculation = bidi.AsSpeculation();

        await using var subscription = await speculation.PrefetchStatusUpdated.SubscribeAsync(args =>
        {
            tcs.TrySetResult(args);
        });

        // Navigate to a blank page first
        await context.NavigateAsync(Urls.SimpleTestPage, new() { Wait = ReadinessState.Complete });

        var targetUrl = Urls.FormsPage;

        // Add speculation rules with "immediate" eagerness AND a clickable link
        // The link is necessary for the where clause to match
        await context.Script.EvaluateAsync($$"""
            const link = document.createElement('a');
            link.href = '{{targetUrl}}';
            link.id = 'prefetch-link';
            link.textContent = 'Prefetch Target';
            document.body.appendChild(link);

            const script = document.createElement('script');
            script.type = 'speculationrules';
            script.textContent = JSON.stringify({
              "prefetch": [{
                "where": { "href_matches": "{{targetUrl}}" },
                "eagerness": "immediate"
              }]
            });
            document.head.appendChild(script);
            """, false);

        var args = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(args, Is.Not.Null);
        Assert.That(args.Status, Is.EqualTo(PreloadingStatus.Pending));
        Assert.That(args.Url, Does.Contain("formPage.html"));
        Assert.That(args.Context, Is.EqualTo(context));
    }
}
