// <copyright file="InlinePage.cs" company="Selenium Committers">
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

using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Environment;

public class InlinePage
{
    private string title = string.Empty;
    private List<string> scripts = new List<string>();
    private List<string> styles = new List<string>();
    private List<string> bodyParts = new List<string>();
    private string onLoad;
    private string onBeforeUnload;

    public InlinePage WithTitle(string title)
    {
        this.title = title;
        return this;
    }

    public InlinePage WithScripts(params string[] scripts)
    {
        this.scripts.AddRange(scripts);
        return this;
    }

    public InlinePage WithStyles(params string[] styles)
    {
        this.styles.AddRange(styles);
        return this;
    }

    public InlinePage WithBody(params string[] bodyParts)
    {
        this.bodyParts.AddRange(bodyParts);
        return this;
    }

    public InlinePage WithOnLoad(string onLoad)
    {
        this.onLoad = onLoad;
        return this;
    }

    public InlinePage WithOnBeforeUnload(string onBeforeUnload)
    {
        this.onBeforeUnload = onBeforeUnload;
        return this;
    }

    public override string ToString()
    {
        StringBuilder builder = new StringBuilder("<html>");
        builder.Append("<head>");
        builder.AppendFormat("<title>{0}</title>", this.title);
        builder.Append("</head>");
        builder.Append("<script type='text/javascript'>");
        foreach (string script in this.scripts)
        {
            builder.Append(script).Append("\n");
        }

        builder.Append("</script>");
        builder.Append("<style>");
        foreach (string style in this.styles)
        {
            builder.Append(style).Append("\n");
        }

        builder.Append("</style>");
        builder.Append("<body");
        if (!string.IsNullOrEmpty(this.onLoad))
        {
            builder.AppendFormat(" onload='{0}'", this.onLoad);
        }

        if (!string.IsNullOrEmpty(this.onBeforeUnload))
        {
            builder.AppendFormat(" onbeforeunload='{0}'", this.onBeforeUnload);
        }

        builder.Append(">");
        foreach (string bodyPart in this.bodyParts)
        {
            builder.Append(bodyPart).Append("\n");
        }

        builder.Append("</body>");
        builder.Append("</html>");
        return builder.ToString();
    }
}
