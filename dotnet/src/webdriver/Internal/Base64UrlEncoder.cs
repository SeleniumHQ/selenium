// Thanks to Microsoft.IdentityModel.Tokens package for this code.
// https://raw.githubusercontent.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/6.19.0/src/Microsoft.IdentityModel.Tokens/Base64UrlEncoder.cs
using System;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Encodes and Decodes strings as Base64Url encoding.
    /// </summary>
    internal static class Base64UrlEncoder
    {
        private const char base64PadCharacter = '=';
        private const string doubleBase64PadCharacter = "==";
        private const char base64Character62 = '+';
        private const char base64Character63 = '/';
        private const char base64UrlCharacter62 = '-';
        private const char base64UrlCharacter63 = '_';

        /// <summary>
        /// Encoding table
        /// </summary>
        internal static readonly char[] s_base64Table =
        {
            'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
            '0','1','2','3','4','5','6','7','8','9',
            base64UrlCharacter62,
            base64UrlCharacter63
        };

        /// <summary>
        /// The following functions perform base64url encoding which differs from regular base64 encoding as follows
        /// * padding is skipped so the pad character '=' doesn't have to be percent encoded
        /// * the 62nd and 63rd regular base64 encoding characters ('+' and '/') are replace with ('-' and '_')
        /// The changes make the encoding alphabet file and URL safe.
        /// </summary>
        /// <param name="arg">string to encode.</param>
        /// <returns>Base64Url encoding of the UTF8 bytes.</returns>
        public static string Encode(string arg)
        {
            _ = arg ?? throw new ArgumentNullException(nameof(arg));

            return Encode(Encoding.UTF8.GetBytes(arg));
        }

        /// <summary>
        /// Converts a subset of an array of 8-bit unsigned integers to its equivalent string representation which is encoded with base-64-url digits. Parameters specify
        /// the subset as an offset in the input array, and the number of elements in the array to convert.
        /// </summary>
        /// <param name="inArray">An array of 8-bit unsigned integers.</param>
        /// <param name="length">An offset in inArray.</param>
        /// <param name="offset">The number of elements of inArray to convert.</param>
        /// <returns>The string representation in base 64 url encoding of length elements of inArray, starting at position offset.</returns>
        /// <exception cref="ArgumentNullException">'inArray' is null.</exception>
        /// <exception cref="ArgumentOutOfRangeException">offset or length is negative OR offset plus length is greater than the length of inArray.</exception>
        public static string Encode(byte[] inArray, int offset, int length)
        {
            _ = inArray ?? throw new ArgumentNullException(nameof(inArray));

            if (length == 0)
                return string.Empty;

            if (length < 0)
                throw new ArgumentOutOfRangeException(nameof(length));

            if (offset < 0 || inArray.Length < offset)
                throw new ArgumentOutOfRangeException(nameof(offset));

            if (inArray.Length < offset + length)
                throw new ArgumentOutOfRangeException(nameof(length));

            int lengthmod3 = length % 3;
            int limit = offset + (length - lengthmod3);
            char[] output = new char[(length + 2) / 3 * 4];
            char[] table = s_base64Table;
            int i, j = 0;

            // takes 3 bytes from inArray and insert 4 bytes into output
            for (i = offset; i < limit; i += 3)
            {
                byte d0 = inArray[i];
                byte d1 = inArray[i + 1];
                byte d2 = inArray[i + 2];

                output[j + 0] = table[d0 >> 2];
                output[j + 1] = table[((d0 & 0x03) << 4) | (d1 >> 4)];
                output[j + 2] = table[((d1 & 0x0f) << 2) | (d2 >> 6)];
                output[j + 3] = table[d2 & 0x3f];
                j += 4;
            }

            //Where we left off before
            i = limit;

            switch (lengthmod3)
            {
                case 2:
                    {
                        byte d0 = inArray[i];
                        byte d1 = inArray[i + 1];

                        output[j + 0] = table[d0 >> 2];
                        output[j + 1] = table[((d0 & 0x03) << 4) | (d1 >> 4)];
                        output[j + 2] = table[(d1 & 0x0f) << 2];
                        j += 3;
                    }
                    break;

                case 1:
                    {
                        byte d0 = inArray[i];

                        output[j + 0] = table[d0 >> 2];
                        output[j + 1] = table[(d0 & 0x03) << 4];
                        j += 2;
                    }
                    break;

                    //default or case 0: no further operations are needed.
            }

            return new string(output, 0, j);
        }

        /// <summary>
        /// Converts a subset of an array of 8-bit unsigned integers to its equivalent string representation which is encoded with base-64-url digits.
        /// </summary>
        /// <param name="inArray">An array of 8-bit unsigned integers.</param>
        /// <returns>The string representation in base 64 url encoding of length elements of inArray, starting at position offset.</returns>
        /// <exception cref="ArgumentNullException">'inArray' is null.</exception>
        /// <exception cref="ArgumentOutOfRangeException">offset or length is negative OR offset plus length is greater than the length of inArray.</exception>
        public static string Encode(byte[] inArray)
        {
            _ = inArray ?? throw new ArgumentNullException(nameof(inArray));

            return Encode(inArray, 0, inArray.Length);
        }

        internal static string EncodeString(string str)
        {
            _ = str ?? throw new ArgumentNullException(nameof(str));

            return Encode(Encoding.UTF8.GetBytes(str));
        }

        /// <summary>
        ///  Converts the specified string, which encodes binary data as base-64-url digits, to an equivalent 8-bit unsigned integer array.</summary>
        /// <param name="str">base64Url encoded string.</param>
        /// <returns>UTF8 bytes.</returns>
        public static byte[] DecodeBytes(string str)
        {
            _ = str ?? throw new ArgumentNullException(nameof(str));

            // 62nd char of encoding
            str = str.Replace(base64UrlCharacter62, base64Character62);
            
            // 63rd char of encoding
            str = str.Replace(base64UrlCharacter63, base64Character63);

            // check for padding
            switch (str.Length % 4)
            {
                case 0:
                    // No pad chars in this case
                    break;
                case 2:
                    // Two pad chars
                    str += doubleBase64PadCharacter;
                    break;
                case 3:
                    // One pad char
                    str += base64PadCharacter;
                    break;
                default:
                    throw new FormatException(str);
            }

            return Convert.FromBase64String(str);
        }

        /// <summary>
        /// Decodes the string from Base64UrlEncoded to UTF8.
        /// </summary>
        /// <param name="arg">string to decode.</param>
        /// <returns>UTF8 string.</returns>
        public static string Decode(string arg)
        {
            return Encoding.UTF8.GetString(DecodeBytes(arg));
        }
    }
}
