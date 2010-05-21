using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Encapsulates methods for finding and extracting WebDriver resources.
    /// </summary>
    public static class ResourceUtilities
    {
        /// <summary>
        /// Gets a <see cref="Stream"/> that contains the resource to use.
        /// </summary>
        /// <param name="fileName">A file name in the file system containing the resource to use. 
        /// It should be located in the same directory as the executing assembly.</param>
        /// <param name="resourceId">A string representing the resource name embedded in the
        /// executing assembly, if it is not found in the file system.</param>
        /// <returns>A Stream from which the resource can be read.</returns>
        /// <exception cref="WebDriverException">Thrown if neither the file nor the embedded resource can be found.</exception>
        /// <remarks>
        /// We assume either (1) the .zip file exists in the same directory as the calling assembly
        /// (which should be the browser-specific driver assembly), or (2) it exists inside the calling
        /// assembly as an embedded resource.
        /// </remarks>
        public static Stream GetResourceStream(string fileName, string resourceId)
        {
            Stream resourceStream = null;
            Assembly executingAssembly = Assembly.GetCallingAssembly();
            string currentDirectory = executingAssembly.Location;

            // If we're shadow copying,. fiddle with 
            // the codebase instead 
            if (AppDomain.CurrentDomain.ShadowCopyFiles)
            {
                Uri uri = new Uri(executingAssembly.CodeBase);
                currentDirectory = uri.LocalPath;
            }

            string resourceFilePath = Path.Combine(Path.GetDirectoryName(currentDirectory), fileName);
            if (File.Exists(resourceFilePath))
            {
                resourceStream = new FileStream(resourceFilePath, FileMode.Open, FileAccess.Read);
            }
            else
            {
                resourceStream = executingAssembly.GetManifestResourceStream(resourceId);
            }

            if (resourceStream == null)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot find a file named '{0}' or an embedded resource with the id '{1}'.", resourceFilePath, resourceId));
            }

            return resourceStream;
        }
    }
}
