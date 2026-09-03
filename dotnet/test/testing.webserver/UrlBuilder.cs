// <copyright file="UrlBuilder.cs" company="Selenium Committers">
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

using System;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using System.Text.Json.Nodes;

namespace OpenQA.Selenium.Testing.WebServer;

public class UrlBuilder
{
    private readonly Uri _httpBaseUrl;
    private readonly Uri _httpsBaseUrl;

    public string HostName => _httpBaseUrl.Host;

    public string AlternateHostName { get; }

    public UrlBuilder(string httpUrl, string httpsUrl)
    {
        _httpBaseUrl = new Uri(httpUrl);
        _httpsBaseUrl = new Uri(httpsUrl);

        //Use the first IPv4 address that we find
        IPAddress ipAddress = IPAddress.Parse("127.0.0.1");
        foreach (IPAddress ip in Dns.GetHostEntry(HostName).AddressList)
        {
            if (ip.AddressFamily == AddressFamily.InterNetwork)
            {
                ipAddress = ip;
                break;
            }
        }
        AlternateHostName = ipAddress.ToString();
    }

    public string WhereIs(string page)
    {
        return _httpBaseUrl + "common/" + page;
    }

    public string WhereElseIs(string page)
    {
        return new UriBuilder(_httpBaseUrl) { Host = AlternateHostName } + "common/" + page;
    }

    public string WhereIsViaNonLoopbackAddress(string page)
    {
        string hostNameAsIPAddress = "127.0.0.1";
        IPAddress[] addresses = Dns.GetHostAddresses(Dns.GetHostName());
        foreach (IPAddress address in addresses)
        {
            if (address.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(address))
            {
                hostNameAsIPAddress = address.ToString();
                break;
            }
        }
        return new UriBuilder(_httpBaseUrl) { Host = hostNameAsIPAddress } + "common/" + page;
    }

    public string WhereIsSecure(string page)
    {
        return _httpsBaseUrl + "common/" + page;
    }

    public string AlertsPage => WhereIs("alerts.html");
    public string BlankPage => WhereIs("blank.html");
    public string MacbethPage => WhereIs("macbeth.html");
    public string SimpleTestPage => WhereIs("simpleTest.html");
    public string FramesPage => WhereIs("win32frameset.html");
    public string IframesPage => WhereIs("iframes.html");
    public string FormsPage => WhereIs("formPage.html");
    public string JavascriptPage => WhereIs("javascriptPage.html");
    public string LoginPage => WhereIs("login.html");
    public string ClickEventPage => WhereIs("clickEventPage.html");
    public string ResultPage => WhereIs("resultPage.html");
    public string NestedPage => WhereIs("nestedElements.html");
    public string XhtmlTestPage => WhereIs("xhtmlTest.html");
    public string RichTextPage => WhereIs("rich_text.html");
    public string DragAndDropPage => WhereIs("dragAndDropTest.html");
    public string FramesetPage => WhereIs("frameset.html");
    public string MetaRedirectPage => WhereIs("meta-redirect.html");
    public string RedirectPage => WhereIs("redirect");
    public string RectanglesPage => WhereIs("rectangles.html");
    public string JavascriptEnhancedForm => WhereIs("javascriptEnhancedForm.html");
    public string UploadPage => WhereIs("upload.html");
    public string TransparentUploadPage => WhereIs("transparentUpload.html");
    public string ChildPage => WhereIs("child/childPage.html");
    public string GrandchildPage => WhereIs("child/grandchild/grandchildPage.html");
    public string DocumentWrite => WhereElseIs("document_write_in_onload.html");
    public string ChinesePage => WhereIs("cn-test.html");
    public string SvgPage => WhereIs("svgPiechart.xhtml");
    public string DynamicPage => WhereIs("dynamic.html");
    public string Tables => WhereIs("tables.html");
    public string DeletingFrame => WhereIs("frame_switching_tests/deletingFrame.html");
    public string AjaxyPage => WhereIs("ajaxy_page.html");
    public string SleepingPage => WhereIs("sleep");
    public string SlowIframes => WhereIs("slow_loading_iframes.html");
    public string DraggableLists => WhereIs("draggableLists.html");
    public string DroppableItems => WhereIs("droppableItems.html");
    public string BodyTypingPage => WhereIs("bodyTypingTest.html");
    public string FormSelectionPage => WhereIs("formSelectionPage.html");
    public string SelectableItemsPage => WhereIs("selectableItems.html");
    public string UnderscorePage => WhereIs("underscore.html");
    public string ClickJackerPage => WhereIs("click_jacker.html");
    public string ErrorsPage => WhereIs("errors.html");
    public string SelectPage => WhereIs("selectPage.html");
    public string SimpleXmlDocument => WhereIs("simple.xml");
    public string MapVisibilityPage => WhereIs("map_visibility.html");
    public string MouseTrackerPage => WhereIs("mousePositionTracker.html");
    public string MouseOverPage => WhereIs("mouseOver.html");
    public string MouseInteractionPage => WhereIs("mouse_interaction.html");
    public string ReadOnlyPage => WhereIs("readOnlyPage.html");
    public string ClicksPage => WhereIs("clicks.html");
    public string BooleanAttributes => WhereIs("booleanAttributes.html");
    public string LinkedImage => WhereIs("linked_image.html");
    public string XhtmlFormPage => WhereIs("xhtmlFormPage.xhtml");
    public string SvgTestPage => WhereIs("svgTest.svg");
    public string SlowLoadingAlertPage => WhereIs("slowLoadingAlert.html");
    public string DragDropOverflowPage => WhereIs("dragDropOverflow.html");
    public string MissedJsReferencePage => WhereIs("missedJsReference.html");
    public string AuthenticationPage => WhereIs("basicAuth");
    public string Html5Page => WhereIs("html5Page.html");
    public string ShadowRootPage => WhereIs("shadowRootPage.html");
    public string ScrollFrameOutOfViewport => WhereIs("scrolling_tests/frame_with_nested_scrolling_frame_out_of_view.html");
    public string ScrollFrameInViewport => WhereIs("scrolling_tests/frame_with_nested_scrolling_frame.html");
    public string PrintPage => WhereIs("printPage.html");

    public string CreateInlinePage(InlinePage page)
    {
        Uri createPageUri = new Uri(new Uri(WhereIs(string.Empty)), "createPage");

        var payloadDictionary = new JsonObject
        {
            ["content"] = page.ToString()
        };

        string commandPayload = payloadDictionary.ToJsonString();

        using var httpClient = new HttpClient();

        var postHttpContent = new StringContent(commandPayload, Encoding.UTF8, "application/json");

        using var response = httpClient.PostAsync(createPageUri, postHttpContent).GetAwaiter().GetResult();

        var responseString = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

        // The response string from the Java remote server has trailing null
        // characters. This is due to the fix for issue 288.
        if (responseString.Contains('\0'))
        {
            responseString = responseString[..responseString.IndexOf('\0')];
        }

        if (responseString.Contains("localhost"))
        {
            responseString = responseString.Replace("localhost", HostName);
        }

        return responseString;
    }
}
