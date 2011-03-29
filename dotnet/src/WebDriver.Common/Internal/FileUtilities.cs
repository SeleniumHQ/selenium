using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Encapsulates methods for working with files.
    /// </summary>
    public static class FileUtilities
    {
        /// <summary>
        /// Recursively copies a directory.
        /// </summary>
        /// <param name="sourceDirectory">The source directory to copy.</param>
        /// <param name="destinationDirectory">The destination directory.</param>
        /// <returns><see langword="true"/> if the copy is completed; otherwise <see langword="false"/>.</returns>
        public static bool CopyDirectory(string sourceDirectory, string destinationDirectory)
        {
            bool copyComplete = false;
            DirectoryInfo sourceDirectoryInfo = new DirectoryInfo(sourceDirectory);
            DirectoryInfo destinationDirectoryInfo = new DirectoryInfo(destinationDirectory);

            if (sourceDirectoryInfo.Exists)
            {
                if (!destinationDirectoryInfo.Exists)
                {
                    destinationDirectoryInfo.Create();
                }

                foreach (FileInfo fileEntry in sourceDirectoryInfo.GetFiles())
                {
                    fileEntry.CopyTo(Path.Combine(destinationDirectoryInfo.FullName, fileEntry.Name));
                }

                foreach (DirectoryInfo directoryEntry in sourceDirectoryInfo.GetDirectories())
                {
                    if (!CopyDirectory(directoryEntry.FullName, Path.Combine(destinationDirectoryInfo.FullName, directoryEntry.Name)))
                    {
                        copyComplete = false;
                    }
                }
            }

            copyComplete = true;
            return copyComplete;
        }

        /// <summary>
        /// Recursively deletes a directory, retrying on error until a timeout.
        /// </summary>
        /// <param name="directoryToDelete">The directory to delete.</param>
        /// <remarks>This method does not throw an exception if the delete fails.</remarks>
        public static void DeleteDirectory(string directoryToDelete)
        {
            int numberOfRetries = 0;
            while (Directory.Exists(directoryToDelete) && numberOfRetries < 10)
            {
                try
                {
                    Directory.Delete(directoryToDelete, true);
                }
                catch (IOException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                catch (UnauthorizedAccessException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                finally
                {
                    numberOfRetries++;
                }
            }

            if (Directory.Exists(directoryToDelete))
            {
                Console.WriteLine("Unable to delete directory '{0}'", directoryToDelete);
            }
        }
    }
}
