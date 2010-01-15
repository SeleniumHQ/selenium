using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;
using System.IO;

namespace OpenQA.Selenium
{
    public class Screenshot
    {
        string base64Encoded = string.Empty;

        public Screenshot(string base64EncodedScreenshot)
        {
            base64Encoded = base64EncodedScreenshot;
        }

        public string AsBase64EncodedString
        {
            get { return base64Encoded; }
        }

        public byte[] AsByteArray
        {
            get { return Convert.FromBase64String(base64Encoded); }
        }

        public Image AsImage
        {
            get { return Image.FromStream(new MemoryStream(AsByteArray)); }
        }

        public void SaveAsFile(string fileName, ImageFormat format)
        {
            AsImage.Save(fileName, format);
        }

        public override string ToString()
        {
            return base64Encoded;
        }
    }
}
