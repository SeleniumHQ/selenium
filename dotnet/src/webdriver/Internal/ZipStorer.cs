// <copyright file="ZipStorer.cs" company="Jaime Olivares">
//
// ZipStorer, by Jaime Olivares
// Website: zipstorer.codeplex.com
// Version: 2.35 (March 14, 2010)
//
// Used under the provisions of the Microsoft Public License (Ms-PL).
// You may obtain a copy of the License at
//
//     https://zipstorer.codeplex.com/license
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System.Collections.Generic;
using System.Text;

namespace System.IO.Compression
{
    /// <summary>
    /// Unique class for compression/decompression file. Represents a Zip file.
    /// </summary>
    internal sealed class ZipStorer : IDisposable
    {
        // Static CRC32 Table
        private static uint[] crcTable = GenerateCrc32Table();

        // Default filename encoder
        private static Encoding defaultEncoding = Encoding.GetEncoding(437);

        // List of files to store
        private List<ZipFileEntry> files = new List<ZipFileEntry>();

        // Stream object of storage file
        private Stream zipFileStream;

        // General comment
        private string comment = string.Empty;

        // Central dir image
        private byte[] centralDirectoryImage = null;

        // Existing files in zip
        private ushort existingFileCount = 0;

        // File access for Open method
        private FileAccess access;

        // True if UTF8 encoding for filename and comments, false if default (CP 437)
        private bool encodeUtf8 = false;

        // Force deflate algotithm even if it inflates the stored file. Off by default.
        private bool forceDeflating = false;

        /// <summary>
        /// Compression method enumeration.
        /// </summary>
        public enum CompressionMethod : ushort
        {
            /// <summary>Uncompressed storage.</summary>
            Store = 0,

            /// <summary>Deflate compression method.</summary>
            Deflate = 8
        }

        /// <summary>
        /// Gets a value indicating whether file names and comments should be encoded using UTF-8.
        /// </summary>
        public bool EncodeUtf8
        {
            get { return this.encodeUtf8; }
        }

        /// <summary>
        /// Gets a value indicating whether to force using the deflate algorithm,
        /// even if doing so inflates the stored file.
        /// </summary>
        public bool ForceDeflating
        {
            get { return this.forceDeflating; }
        }

        /// <summary>
        /// Create a new zip storage in a stream.
        /// </summary>
        /// <param name="zipStream">The stream to use to create the Zip file.</param>
        /// <param name="fileComment">General comment for Zip file.</param>
        /// <returns>A valid ZipStorer object.</returns>
        public static ZipStorer Create(Stream zipStream, string fileComment)
        {
            ZipStorer zip = new ZipStorer();
            zip.comment = fileComment;
            zip.zipFileStream = zipStream;
            zip.access = FileAccess.Write;

            return zip;
        }

        /// <summary>
        /// Open the existing Zip storage in a stream.
        /// </summary>
        /// <param name="stream">Already opened stream with zip contents.</param>
        /// <param name="access">File access mode for stream operations.</param>
        /// <returns>A valid ZipStorer object.</returns>
        [Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Reliability", "CA2000:Dispose objects before losing scope", Justification = "Factory method. Caller assumes ownership of returned object")]
        public static ZipStorer Open(Stream stream, FileAccess access)
        {
            if (!stream.CanSeek && access != FileAccess.Read)
            {
                throw new InvalidOperationException("Stream cannot seek");
            }

            ZipStorer zip = new ZipStorer();
            zip.zipFileStream = stream;
            zip.access = access;

            if (zip.ReadFileInfo())
            {
                return zip;
            }

            throw new System.IO.InvalidDataException();
        }

        /// <summary>
        /// Add full contents of a file into the Zip storage.
        /// </summary>
        /// <param name="compressionMethod">Compression method used to store the file.</param>
        /// <param name="sourceFile">Full path of file to add to Zip storage.</param>
        /// <param name="fileNameInZip">File name and path as desired in Zip directory.</param>
        /// <param name="fileEntryComment">Comment for stored file.</param>
        public void AddFile(CompressionMethod compressionMethod, string sourceFile, string fileNameInZip, string fileEntryComment)
        {
            if (this.access == FileAccess.Read)
            {
                throw new InvalidOperationException("Writing is not allowed");
            }

            using (FileStream stream = new FileStream(sourceFile, FileMode.Open, FileAccess.Read))
            {
                this.AddStream(compressionMethod, stream, fileNameInZip, File.GetLastWriteTime(sourceFile), fileEntryComment);
            }
        }

        /// <summary>
        /// Add full contents of a stream into the Zip storage.
        /// </summary>
        /// <param name="compressionMethod">Compression method used to store the stream.</param>
        /// <param name="sourceStream">Stream object containing the data to store in Zip.</param>
        /// <param name="fileNameInZip">File name and path as desired in Zip directory.</param>
        /// <param name="modificationTimeStamp">Modification time of the data to store.</param>
        /// <param name="fileEntryComment">Comment for stored file.</param>
        public void AddStream(CompressionMethod compressionMethod, Stream sourceStream, string fileNameInZip, DateTime modificationTimeStamp, string fileEntryComment)
        {
            if (this.access == FileAccess.Read)
            {
                throw new InvalidOperationException("Writing is not allowed");
            }

            // Prepare the fileinfo
            ZipFileEntry zipFileEntry = default(ZipFileEntry);
            zipFileEntry.Method = compressionMethod;
            zipFileEntry.EncodeUTF8 = this.EncodeUtf8;
            zipFileEntry.FilenameInZip = NormalizeFileName(fileNameInZip);
            zipFileEntry.Comment = fileEntryComment == null ? string.Empty : fileEntryComment;

            // Even though we write the header now, it will have to be rewritten, since we don't know compressed size or crc.
            zipFileEntry.Crc32 = 0;  // to be updated later
            zipFileEntry.HeaderOffset = (uint)this.zipFileStream.Position;  // offset within file of the start of this local record
            zipFileEntry.ModifyTime = modificationTimeStamp;

            // Write local header
            this.WriteLocalHeader(ref zipFileEntry);
            zipFileEntry.FileOffset = (uint)this.zipFileStream.Position;

            // Write file to zip (store)
            this.Store(ref zipFileEntry, sourceStream);
            sourceStream.Close();

            this.UpdateCrcAndSizes(ref zipFileEntry);

            this.files.Add(zipFileEntry);
        }

        /// <summary>
        /// Updates central directory (if needed) and close the Zip storage.
        /// </summary>
        /// <remarks>This is a required step, unless automatic dispose is used.</remarks>
        public void Close()
        {
            if (this.access != FileAccess.Read)
            {
                uint centralOffset = (uint)this.zipFileStream.Position;
                uint centralSize = 0;

                if (this.centralDirectoryImage != null)
                {
                    this.zipFileStream.Write(this.centralDirectoryImage, 0, this.centralDirectoryImage.Length);
                }

                for (int i = 0; i < this.files.Count; i++)
                {
                    long pos = this.zipFileStream.Position;
                    this.WriteCentralDirRecord(this.files[i]);
                    centralSize += (uint)(this.zipFileStream.Position - pos);
                }

                if (this.centralDirectoryImage != null)
                {
                    this.WriteEndRecord(centralSize + (uint)this.centralDirectoryImage.Length, centralOffset);
                }
                else
                {
                    this.WriteEndRecord(centralSize, centralOffset);
                }
            }

            if (this.zipFileStream != null)
            {
                this.zipFileStream.Flush();
                this.zipFileStream.Dispose();
                this.zipFileStream = null;
            }
        }

        /// <summary>
        /// Read all the file records in the central directory.
        /// </summary>
        /// <returns>List of all entries in directory.</returns>
        public List<ZipFileEntry> ReadCentralDirectory()
        {
            if (this.centralDirectoryImage == null)
            {
                throw new InvalidOperationException("Central directory currently does not exist");
            }

            List<ZipFileEntry> result = new List<ZipFileEntry>();

            int pointer = 0;
            while (pointer < this.centralDirectoryImage.Length)
            {
                uint signature = BitConverter.ToUInt32(this.centralDirectoryImage, pointer);
                if (signature != 0x02014b50)
                {
                    break;
                }

                bool isUTF8Encoded = (BitConverter.ToUInt16(this.centralDirectoryImage, pointer + 8) & 0x0800) != 0;
                ushort method = BitConverter.ToUInt16(this.centralDirectoryImage, pointer + 10);
                uint modifyTime = BitConverter.ToUInt32(this.centralDirectoryImage, pointer + 12);
                uint crc32 = BitConverter.ToUInt32(this.centralDirectoryImage, pointer + 16);
                uint comprSize = BitConverter.ToUInt32(this.centralDirectoryImage, pointer + 20);
                uint fileSize = BitConverter.ToUInt32(this.centralDirectoryImage, pointer + 24);
                ushort filenameSize = BitConverter.ToUInt16(this.centralDirectoryImage, pointer + 28);
                ushort extraSize = BitConverter.ToUInt16(this.centralDirectoryImage, pointer + 30);
                ushort commentSize = BitConverter.ToUInt16(this.centralDirectoryImage, pointer + 32);
                uint headerOffset = BitConverter.ToUInt32(this.centralDirectoryImage, pointer + 42);
                uint headerSize = (uint)(46 + filenameSize + extraSize + commentSize);

                Encoding encoder = isUTF8Encoded ? Encoding.UTF8 : defaultEncoding;

                ZipFileEntry zfe = default(ZipFileEntry);
                zfe.Method = (CompressionMethod)method;
                zfe.FilenameInZip = encoder.GetString(this.centralDirectoryImage, pointer + 46, filenameSize);
                zfe.FileOffset = this.GetFileOffset(headerOffset);
                zfe.FileSize = fileSize;
                zfe.CompressedSize = comprSize;
                zfe.HeaderOffset = headerOffset;
                zfe.HeaderSize = headerSize;
                zfe.Crc32 = crc32;
                zfe.ModifyTime = DosTimeToDateTime(modifyTime);
                if (commentSize > 0)
                {
                    zfe.Comment = encoder.GetString(this.centralDirectoryImage, pointer + 46 + filenameSize + extraSize, commentSize);
                }

                result.Add(zfe);
                pointer += 46 + filenameSize + extraSize + commentSize;
            }

            return result;
        }

        /// <summary>
        /// Copy the contents of a stored file into a physical file.
        /// </summary>
        /// <param name="zipFileEntry">Entry information of file to extract.</param>
        /// <param name="destinationFileName">Name of file to store uncompressed data.</param>
        /// <returns><see langword="true"/> if the file is successfully extracted; otherwise, <see langword="false"/>.</returns>
        /// <remarks>Unique compression methods are Store and Deflate.</remarks>
        public bool ExtractFile(ZipFileEntry zipFileEntry, string destinationFileName)
        {
            // Make sure the parent directory exist
            string path = System.IO.Path.GetDirectoryName(destinationFileName);

            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }

            // Check it is directory. If so, do nothing
            if (Directory.Exists(destinationFileName))
            {
                return true;
            }

            bool result = false;
            using (Stream output = new FileStream(destinationFileName, FileMode.Create, FileAccess.Write))
            {
                result = this.ExtractFile(zipFileEntry, output);
            }

            File.SetCreationTime(destinationFileName, zipFileEntry.ModifyTime);
            File.SetLastWriteTime(destinationFileName, zipFileEntry.ModifyTime);

            return result;
        }

        /// <summary>
        /// Copy the contents of a stored file into an open stream.
        /// </summary>
        /// <param name="zipFileEntry">Entry information of file to extract.</param>
        /// <param name="destinationStream">Stream to store the uncompressed data.</param>
        /// <returns><see langword="true"/> if the file is successfully extracted; otherwise, <see langword="false"/>.</returns>
        /// <remarks>Unique compression methods are Store and Deflate.</remarks>
        public bool ExtractFile(ZipFileEntry zipFileEntry, Stream destinationStream)
        {
            if (!destinationStream.CanWrite)
            {
                throw new InvalidOperationException("Stream cannot be written");
            }

            // check signature
            byte[] signature = new byte[4];
            this.zipFileStream.Seek(zipFileEntry.HeaderOffset, SeekOrigin.Begin);
            this.zipFileStream.Read(signature, 0, 4);
            if (BitConverter.ToUInt32(signature, 0) != 0x04034b50)
            {
                return false;
            }

            // Select input stream for inflating or just reading
            Stream inStream;
            if (zipFileEntry.Method == CompressionMethod.Store)
            {
                inStream = this.zipFileStream;
            }
            else if (zipFileEntry.Method == CompressionMethod.Deflate)
            {
                inStream = new DeflateStream(this.zipFileStream, CompressionMode.Decompress, true);
            }
            else
            {
                return false;
            }

            // Buffered copy
            byte[] buffer = new byte[16384];
            this.zipFileStream.Seek(zipFileEntry.FileOffset, SeekOrigin.Begin);
            uint bytesPending = zipFileEntry.FileSize;
            while (bytesPending > 0)
            {
                int bytesRead = inStream.Read(buffer, 0, (int)Math.Min(bytesPending, buffer.Length));
                destinationStream.Write(buffer, 0, bytesRead);
                bytesPending -= (uint)bytesRead;
            }

            destinationStream.Flush();

            if (zipFileEntry.Method == CompressionMethod.Deflate)
            {
                inStream.Dispose();
            }

            return true;
        }

        /// <summary>
        /// Closes the Zip file stream.
        /// </summary>
        public void Dispose()
        {
            this.Close();
        }

        private static uint[] GenerateCrc32Table()
        {
            // Generate CRC32 table
            uint[] table = new uint[256];
            for (int i = 0; i < table.Length; i++)
            {
                uint c = (uint)i;
                for (int j = 0; j < 8; j++)
                {
                    if ((c & 1) != 0)
                    {
                        c = 3988292384 ^ (c >> 1);
                    }
                    else
                    {
                        c >>= 1;
                    }
                }

                table[i] = c;
            }

            return table;
        }

        /* DOS Date and time:
            MS-DOS date. The date is a packed value with the following format. Bits Description
                0-4 Day of the month (1–31)
                5-8 Month (1 = January, 2 = February, and so on)
                9-15 Year offset from 1980 (add 1980 to get actual year)
            MS-DOS time. The time is a packed value with the following format. Bits Description
                0-4 Second divided by 2
                5-10 Minute (0–59)
                11-15 Hour (0–23 on a 24-hour clock)
        */
        private static uint DateTimeToDosTime(DateTime dateTime)
        {
            return (uint)(
                (dateTime.Second / 2) | (dateTime.Minute << 5) | (dateTime.Hour << 11) |
                (dateTime.Day << 16) | (dateTime.Month << 21) | ((dateTime.Year - 1980) << 25));
        }

        private static DateTime DosTimeToDateTime(uint dosTime)
        {
            return new DateTime(
                (int)(dosTime >> 25) + 1980,
                (int)(dosTime >> 21) & 15,
                (int)(dosTime >> 16) & 31,
                (int)(dosTime >> 11) & 31,
                (int)(dosTime >> 5) & 63,
                (int)(dosTime & 31) * 2);
        }

        // Replaces backslashes with slashes to store in zip header
        private static string NormalizeFileName(string fileNameToNormalize)
        {
            string normalizedFileName = fileNameToNormalize.Replace('\\', '/');

            int pos = normalizedFileName.IndexOf(':');
            if (pos >= 0)
            {
                normalizedFileName = normalizedFileName.Remove(0, pos + 1);
            }

            return normalizedFileName.Trim('/');
        }

        // Calculate the file offset by reading the corresponding local header
        private uint GetFileOffset(uint headerOffset)
        {
            byte[] buffer = new byte[2];

            this.zipFileStream.Seek(headerOffset + 26, SeekOrigin.Begin);
            this.zipFileStream.Read(buffer, 0, 2);
            ushort filenameSize = BitConverter.ToUInt16(buffer, 0);
            this.zipFileStream.Read(buffer, 0, 2);
            ushort extraSize = BitConverter.ToUInt16(buffer, 0);

            return (uint)(30 + filenameSize + extraSize + headerOffset);
        }

        /* Local file header:
            local file header signature     4 bytes  (0x04034b50)
            version needed to extract       2 bytes
            general purpose bit flag        2 bytes
            compression method              2 bytes
            last mod file time              2 bytes
            last mod file date              2 bytes
            crc-32                          4 bytes
            compressed size                 4 bytes
            uncompressed size               4 bytes
            filename length                 2 bytes
            extra field length              2 bytes

            filename (variable size)
            extra field (variable size)
        */
        private void WriteLocalHeader(ref ZipFileEntry zipFileEntry)
        {
            long pos = this.zipFileStream.Position;
            Encoding encoder = zipFileEntry.EncodeUTF8 ? Encoding.UTF8 : defaultEncoding;
            byte[] encodedFilename = encoder.GetBytes(zipFileEntry.FilenameInZip);

            this.zipFileStream.Write(new byte[] { 80, 75, 3, 4, 20, 0 }, 0, 6); // No extra header
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)(zipFileEntry.EncodeUTF8 ? 0x0800 : 0)), 0, 2); // filename and comment encoding
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)zipFileEntry.Method), 0, 2);  // zipping method
            this.zipFileStream.Write(BitConverter.GetBytes(DateTimeToDosTime(zipFileEntry.ModifyTime)), 0, 4); // zipping date and time
            this.zipFileStream.Write(new byte[] { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }, 0, 12); // unused CRC, un/compressed size, updated later
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)encodedFilename.Length), 0, 2); // filename length
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)0), 0, 2); // extra length

            this.zipFileStream.Write(encodedFilename, 0, encodedFilename.Length);
            zipFileEntry.HeaderSize = (uint)(this.zipFileStream.Position - pos);
        }

        /* Central directory's File header:
            central file header signature   4 bytes  (0x02014b50)
            version made by                 2 bytes
            version needed to extract       2 bytes
            general purpose bit flag        2 bytes
            compression method              2 bytes
            last mod file time              2 bytes
            last mod file date              2 bytes
            crc-32                          4 bytes
            compressed size                 4 bytes
            uncompressed size               4 bytes
            filename length                 2 bytes
            extra field length              2 bytes
            file comment length             2 bytes
            disk number start               2 bytes
            internal file attributes        2 bytes
            external file attributes        4 bytes
            relative offset of local header 4 bytes

            filename (variable size)
            extra field (variable size)
            file comment (variable size)
        */
        private void WriteCentralDirRecord(ZipFileEntry zipFileEntry)
        {
            Encoding encoder = zipFileEntry.EncodeUTF8 ? Encoding.UTF8 : defaultEncoding;
            byte[] encodedFilename = encoder.GetBytes(zipFileEntry.FilenameInZip);
            byte[] encodedComment = encoder.GetBytes(zipFileEntry.Comment);

            this.zipFileStream.Write(new byte[] { 80, 75, 1, 2, 23, 0xB, 20, 0 }, 0, 8);
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)(zipFileEntry.EncodeUTF8 ? 0x0800 : 0)), 0, 2); // filename and comment encoding
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)zipFileEntry.Method), 0, 2);  // zipping method
            this.zipFileStream.Write(BitConverter.GetBytes(DateTimeToDosTime(zipFileEntry.ModifyTime)), 0, 4);  // zipping date and time
            this.zipFileStream.Write(BitConverter.GetBytes(zipFileEntry.Crc32), 0, 4); // file CRC
            this.zipFileStream.Write(BitConverter.GetBytes(zipFileEntry.CompressedSize), 0, 4); // compressed file size
            this.zipFileStream.Write(BitConverter.GetBytes(zipFileEntry.FileSize), 0, 4); // uncompressed file size
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)encodedFilename.Length), 0, 2); // Filename in zip
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)0), 0, 2); // extra length
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)encodedComment.Length), 0, 2);

            this.zipFileStream.Write(BitConverter.GetBytes((ushort)0), 0, 2); // disk=0
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)0), 0, 2); // file type: binary
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)0), 0, 2); // Internal file attributes
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)0x8100), 0, 2); // External file attributes (normal/readable)
            this.zipFileStream.Write(BitConverter.GetBytes(zipFileEntry.HeaderOffset), 0, 4);  // Offset of header

            this.zipFileStream.Write(encodedFilename, 0, encodedFilename.Length);
            this.zipFileStream.Write(encodedComment, 0, encodedComment.Length);
        }

        /* End of central dir record:
            end of central dir signature    4 bytes  (0x06054b50)
            number of this disk             2 bytes
            number of the disk with the
            start of the central directory  2 bytes
            total number of entries in
            the central dir on this disk    2 bytes
            total number of entries in
            the central dir                 2 bytes
            size of the central directory   4 bytes
            offset of start of central
            directory with respect to
            the starting disk number        4 bytes
            zipfile comment length          2 bytes
            zipfile comment (variable size)
        */
        private void WriteEndRecord(uint size, uint offset)
        {
            Encoding encoder = this.EncodeUtf8 ? Encoding.UTF8 : defaultEncoding;
            byte[] encodedComment = encoder.GetBytes(this.comment);

            this.zipFileStream.Write(new byte[] { 80, 75, 5, 6, 0, 0, 0, 0 }, 0, 8);
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)this.files.Count + this.existingFileCount), 0, 2);
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)this.files.Count + this.existingFileCount), 0, 2);
            this.zipFileStream.Write(BitConverter.GetBytes(size), 0, 4);
            this.zipFileStream.Write(BitConverter.GetBytes(offset), 0, 4);
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)encodedComment.Length), 0, 2);
            this.zipFileStream.Write(encodedComment, 0, encodedComment.Length);
        }

        // Copies all source file into storage file
        private void Store(ref ZipFileEntry zipFileEntry, Stream sourceStream)
        {
            byte[] buffer = new byte[16384];
            int bytesRead;
            uint totalRead = 0;
            Stream outStream;

            long posStart = this.zipFileStream.Position;
            long sourceStart = sourceStream.Position;

            if (zipFileEntry.Method == CompressionMethod.Store)
            {
                outStream = this.zipFileStream;
            }
            else
            {
                outStream = new DeflateStream(this.zipFileStream, CompressionMode.Compress, true);
            }

            zipFileEntry.Crc32 = 0 ^ 0xffffffff;

            do
            {
                bytesRead = sourceStream.Read(buffer, 0, buffer.Length);
                totalRead += (uint)bytesRead;
                if (bytesRead > 0)
                {
                    outStream.Write(buffer, 0, bytesRead);

                    for (uint i = 0; i < bytesRead; i++)
                    {
                        zipFileEntry.Crc32 = ZipStorer.crcTable[(zipFileEntry.Crc32 ^ buffer[i]) & 0xFF] ^ (zipFileEntry.Crc32 >> 8);
                    }
                }
            }
            while (bytesRead == buffer.Length);
            outStream.Flush();

            if (zipFileEntry.Method == CompressionMethod.Deflate)
            {
                outStream.Dispose();
            }

            zipFileEntry.Crc32 ^= 0xffffffff;
            zipFileEntry.FileSize = totalRead;
            zipFileEntry.CompressedSize = (uint)(this.zipFileStream.Position - posStart);

            // Verify for real compression
            if (zipFileEntry.Method == CompressionMethod.Deflate && !this.ForceDeflating && sourceStream.CanSeek && zipFileEntry.CompressedSize > zipFileEntry.FileSize)
            {
                // Start operation again with Store algorithm
                zipFileEntry.Method = CompressionMethod.Store;
                this.zipFileStream.Position = posStart;
                this.zipFileStream.SetLength(posStart);
                sourceStream.Position = sourceStart;
                this.Store(ref zipFileEntry, sourceStream);
            }
        }

        /* CRC32 algorithm
          The 'magic number' for the CRC is 0xdebb20e3.
          The proper CRC pre and post conditioning
          is used, meaning that the CRC register is
          pre-conditioned with all ones (a starting value
          of 0xffffffff) and the value is post-conditioned by
          taking the one's complement of the CRC residual.
          If bit 3 of the general purpose flag is set, this
          field is set to zero in the local header and the correct
          value is put in the data descriptor and in the central
          directory.
        */
        private void UpdateCrcAndSizes(ref ZipFileEntry zipFileEntry)
        {
            long lastPos = this.zipFileStream.Position;  // remember position

            this.zipFileStream.Position = zipFileEntry.HeaderOffset + 8;
            this.zipFileStream.Write(BitConverter.GetBytes((ushort)zipFileEntry.Method), 0, 2);  // zipping method

            this.zipFileStream.Position = zipFileEntry.HeaderOffset + 14;
            this.zipFileStream.Write(BitConverter.GetBytes(zipFileEntry.Crc32), 0, 4);  // Update CRC
            this.zipFileStream.Write(BitConverter.GetBytes(zipFileEntry.CompressedSize), 0, 4);  // Compressed size
            this.zipFileStream.Write(BitConverter.GetBytes(zipFileEntry.FileSize), 0, 4);  // Uncompressed size

            this.zipFileStream.Position = lastPos;  // restore position
        }

        // Reads the end-of-central-directory record
        private bool ReadFileInfo()
        {
            if (this.zipFileStream.Length < 22)
            {
                return false;
            }

            try
            {
                this.zipFileStream.Seek(-17, SeekOrigin.End);
                BinaryReader br = new BinaryReader(this.zipFileStream);
                do
                {
                    this.zipFileStream.Seek(-5, SeekOrigin.Current);
                    uint sig = br.ReadUInt32();
                    if (sig == 0x06054b50)
                    {
                        this.zipFileStream.Seek(6, SeekOrigin.Current);

                        ushort entries = br.ReadUInt16();
                        int centralSize = br.ReadInt32();
                        uint centralDirOffset = br.ReadUInt32();
                        ushort commentSize = br.ReadUInt16();

                        // check if comment field is the very last data in file
                        if (this.zipFileStream.Position + commentSize != this.zipFileStream.Length)
                        {
                            return false;
                        }

                        // Copy entire central directory to a memory buffer
                        this.existingFileCount = entries;
                        this.centralDirectoryImage = new byte[centralSize];
                        this.zipFileStream.Seek(centralDirOffset, SeekOrigin.Begin);
                        this.zipFileStream.Read(this.centralDirectoryImage, 0, centralSize);

                        // Leave the pointer at the begining of central dir, to append new files
                        this.zipFileStream.Seek(centralDirOffset, SeekOrigin.Begin);
                        return true;
                    }
                }
                while (this.zipFileStream.Position > 0);
            }
            catch (IOException)
            {
            }

            return false;
        }

        /// <summary>
        /// Represents an entry in Zip file directory
        /// </summary>
        public struct ZipFileEntry
        {
            /// <summary>Compression method</summary>
            public CompressionMethod Method;

            /// <summary>Full path and filename as stored in Zip</summary>
            public string FilenameInZip;

            /// <summary>Original file size</summary>
            public uint FileSize;

            /// <summary>Compressed file size</summary>
            public uint CompressedSize;

            /// <summary>Offset of header information inside Zip storage</summary>
            public uint HeaderOffset;

            /// <summary>Offset of file inside Zip storage</summary>
            public uint FileOffset;

            /// <summary>Size of header information</summary>
            public uint HeaderSize;

            /// <summary>32-bit checksum of entire file</summary>
            public uint Crc32;

            /// <summary>Last modification time of file</summary>
            public DateTime ModifyTime;

            /// <summary>User comment for file</summary>
            public string Comment;

            /// <summary>True if UTF8 encoding for filename and comments, false if default (CP 437)</summary>
            public bool EncodeUTF8;

            /// <summary>Overriden method</summary>
            /// <returns>Filename in Zip</returns>
            public override string ToString()
            {
                return this.FilenameInZip;
            }
        }
    }
}
