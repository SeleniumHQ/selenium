using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Environment
{
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
}
