using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents an image of the page currently loaded in the browser.
    /// </summary>
    public class Screenshot
    {
        private string base64Encoded = string.Empty;

        /// <summary>
        /// Initializes a new instance of the <see cref="Screenshot"/> class.
        /// </summary>
        /// <param name="base64EncodedScreenshot">The image of the page as a Base64-encoded string.</param>
        public Screenshot(string base64EncodedScreenshot)
        {
            base64Encoded = base64EncodedScreenshot;
        }

        /// <summary>
        /// Gets the value of the screenshot image as a Base64-encoded string.
        /// </summary>
        public string AsBase64EncodedString
        {
            get { return base64Encoded; }
        }

        /// <summary>
        /// Gets the value of the screenshot image as an array of bytes.
        /// </summary>
        public byte[] AsByteArray
        {
            get { return Convert.FromBase64String(base64Encoded); }
        }

        /// <summary>
        /// Gets the value of the screenshot image as a <see cref="System.Drawing.Image"/> object.
        /// </summary>
        public Image AsImage
        {
            get { return Image.FromStream(new MemoryStream(AsByteArray)); }
        }

        /// <summary>
        /// Saves the screenshot to a file, overwriting the file if it already exists.
        /// </summary>
        /// <param name="fileName">The full path and file name to save the screenshot to.</param>
        /// <param name="format">A <see cref="System.Drawing.Imaging.ImageFormat"/> object indicating the format
        /// to save the image to.</param>
        public void SaveAsFile(string fileName, ImageFormat format)
        {
            AsImage.Save(fileName, format);
        }

        /// <summary>
        /// Returns a <see cref="System.String">String</see> that represents the current <see cref="System.Object">Object</see>.
        /// </summary>
        /// <returns>A <see cref="System.String">String</see> that represents the current <see cref="System.Object">Object</see>.</returns>
        public override string ToString()
        {
            return base64Encoded;
        }
    }
}
