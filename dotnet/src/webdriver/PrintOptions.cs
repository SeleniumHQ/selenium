// <copyright file="PrintOptions.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the orientation of the page in the printed document.
    /// </summary>
    public enum PrintOrientation
    {
        /// <summary>
        /// Print the document in portrait mode.
        /// </summary>
        Portrait,

        /// <summary>
        /// Print the document in landscape mode.
        /// </summary>
        Landscape
    }

    /// <summary>
    /// Represents the options to send for printing a page.
    /// </summary>
    public class PrintOptions
    {
        private const double DefaultMarginSize = 1.0;
        private const double DefaultPageHeight = 21.59;
        private const double DefaultPageWidth = 27.94;
        private const double CentimetersPerInch = 2.54;

        private PrintOrientation orientation = PrintOrientation.Portrait;
        private double scale = 1.0;
        private bool background = false;
        private bool shrinkToFit = true;
        private PageSize pageSize = new PageSize();
        private Margins margins = new Margins();
        private HashSet<object> pageRanges = new HashSet<object>();

        /// <summary>
        /// Gets or sets the orientation of the pages in the printed document.
        /// </summary>
        public PrintOrientation Orientation
        {
            get { return orientation; }
            set { orientation = value; }
        }

        /// <summary>
        /// Gets or sets the amount which the printed content is zoomed. Valid values are 0.1 to 2.0.
        /// </summary>
        public double ScaleFactor
        {
            get { return scale; }
            set
            {
                if (value < 0.1 || value > 2.0)
                {
                    throw new ArgumentException("Scale factor must be between 0.1 and 2.0.");
                }

                scale = value;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to print background images in the printed document.
        /// </summary>
        public bool OutputBackgroundImages
        {
            get { return background; }
            set { background = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to shrink the content to fit the printed page size.
        /// </summary>
        public bool ShrinkToFit
        {
            get { return shrinkToFit; }
            set { shrinkToFit = value; }
        }

        /// <summary>
        /// Gets the dimensions for each page in the printed document.
        /// </summary>
        public PageSize PageDimensions
        {
            get { return pageSize; }
        }

        /// <summary>
        /// Gets the margins for each page in the doucment.
        /// </summary>
        public Margins PageMargins
        {
            get { return margins; }
        }

        /// <summary>
        /// Adds a page to the list of pages to be included in the document.
        /// </summary>
        /// <param name="pageNumber">The page number to be included in the document.</param>
        public void AddPageToPrint(int pageNumber)
        {
            if (pageNumber < 0)
            {
                throw new ArgumentException("Page number must be greater than or equal to zero");
            }

            if (this.pageRanges.Contains(pageNumber))
            {
                throw new ArgumentException("Cannot add the same page number twice");
            }

            this.pageRanges.Add(pageNumber);
        }

        /// <summary>
        /// Adds a range of pages to be included in the document.
        /// </summary>
        /// <param name="pageRange">A string of the form "x-y" representing the page numbers to include.</param>
        public void AddPageRangeToPrint(string pageRange)
        {
            if (string.IsNullOrEmpty(pageRange))
            {
                throw new ArgumentException("Page range cannot be null or the empty string");
            }

            if (this.pageRanges.Contains(pageRange))
            {
                throw new ArgumentException("Cannot add the same page range twice");
            }

            string[] pageRangeParts = pageRange.Trim().Split('-');
            if (pageRangeParts.Length > 2)
            {
                throw new ArgumentException("Page range cannot have multiple separators");
            }

            int startPage = ParsePageRangePart(pageRangeParts[0], 1);
            if (startPage < 1)
            {
                throw new ArgumentException("Start of a page range must be greater than or equal to 1");
            }

            if (pageRangeParts.Length == 2)
            {
                int endPage = ParsePageRangePart(pageRangeParts[1], int.MaxValue);
                if (endPage < startPage)
                {
                    throw new ArgumentException("End of a page range must be greater than or equal to the start of the page range");
                }
            }

            this.pageRanges.Add(pageRange);
        }

        internal Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> toReturn = new Dictionary<string, object>();

            if (this.orientation != PrintOrientation.Portrait)
            {
                toReturn["orientation"] = this.orientation.ToString().ToLowerInvariant();
            }

            if (this.scale != 1.0)
            {
                toReturn["scale"] = this.scale;
            }

            if (this.background)
            {
                toReturn["background"] = this.background;
            }

            if (!this.shrinkToFit)
            {
                toReturn["shrinkToFit"] = this.shrinkToFit;
            }

            if (this.pageSize.Height != DefaultPageHeight || this.pageSize.Width != DefaultPageWidth)
            {
                Dictionary<string, object> pageSizeDictionary = new Dictionary<string, object>();
                pageSizeDictionary["width"] = this.pageSize.Width;
                pageSizeDictionary["height"] = this.pageSize.Height;
                toReturn["page"] = pageSizeDictionary;
            }

            if (this.margins.Top != DefaultMarginSize || this.margins.Bottom != DefaultMarginSize || this.margins.Left != DefaultMarginSize || this.margins.Right != DefaultMarginSize)
            {
                Dictionary<string, object> marginsDictionary = new Dictionary<string, object>();
                marginsDictionary["top"] = this.margins.Top;
                marginsDictionary["bottom"] = this.margins.Bottom;
                marginsDictionary["left"] = this.margins.Left;
                marginsDictionary["right"] = this.margins.Right;
                toReturn["margin"] = marginsDictionary;
            }

            if (this.pageRanges.Count > 0)
            {
                toReturn["pageRanges"] = new List<object>(this.pageRanges);
            }

            return toReturn;
        }

        private static int ParsePageRangePart(string pageRangePart, int defaultValue)
        {
            pageRangePart = pageRangePart.Trim();
            int pageRangePartValue = defaultValue;
            if (!string.IsNullOrEmpty(pageRangePart))
            {
                if (!int.TryParse(pageRangePart, NumberStyles.Integer, CultureInfo.InvariantCulture, out pageRangePartValue))
                {
                    throw new ArgumentException("Parts of a page range must be an empty string or an integer");
                }
            }

            return pageRangePartValue;
        }

        public class PageSize
        {
            private double height = DefaultPageHeight;
            private double width = DefaultPageWidth;

            /// <summary>
            /// Gets or sets the height of each page in centimeters.
            /// </summary>
            public double Height
            {
                get { return height; }
                set
                {
                    if (value < 0)
                    {
                        throw new ArgumentException("Height must be greater than or equal to zero.");
                    }

                    height = value;
                }
            }

            /// <summary>
            /// Gets or sets the width of each page in centimeters.
            /// </summary>
            public double Width
            {
                get { return width; }
                set
                {
                    if (value < 0)
                    {
                        throw new ArgumentException("Width must be greater than or equal to zero.");
                    }

                    width = value;
                }
            }

            /// <summary>
            /// Gets or sets the height of each page in inches.
            /// </summary>
            public double HeightInInches
            {
                get { return Height / CentimetersPerInch; }
                set { Height = value * CentimetersPerInch; }
            }

            /// <summary>
            /// Gets or sets the width of each page in inches.
            /// </summary>
            public double WidthInInches
            {
                get { return Width / CentimetersPerInch; }
                set { Width = value * CentimetersPerInch; }
            }
        }

        public class Margins
        {
            private double top = DefaultMarginSize;
            private double bottom = DefaultMarginSize;
            private double left = DefaultMarginSize;
            private double right = DefaultMarginSize;

            public double Top
            {
                get { return top; }
                set
                {
                    if (value < 0)
                    {
                        throw new ArgumentException("Top margin must be greater than or equal to zero.");
                    }

                    top = value;
                }
            }

            public double Bottom
            {
                get { return bottom; }
                set
                {
                    if (value < 0)
                    {
                        throw new ArgumentException("Bottom margin must be greater than or equal to zero.");
                    }

                    bottom = value;
                }
            }

            public double Left
            {
                get { return left; }
                set
                {
                    if (value < 0)
                    {
                        throw new ArgumentException("Left margin must be greater than or equal to zero.");
                    }

                    left = value;
                }
            }

            public double Right
            {
                get { return right; }
                set
                {
                    if (value < 0)
                    {
                        throw new ArgumentException("Right margin must be greater than or equal to zero.");
                    }

                    right = value;
                }
            }
        }
    }
}
