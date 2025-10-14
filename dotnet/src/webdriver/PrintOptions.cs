// <copyright file="PrintOptions.cs" company="Selenium Committers">
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
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium;

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

    private double scale = 1.0;
    private PageSize pageSize = new PageSize();
    private Margins margins = new Margins();
    private readonly HashSet<object> pageRanges = new HashSet<object>();

    /// <summary>
    /// Gets or sets the orientation of the pages in the printed document.
    /// </summary>
    public PrintOrientation Orientation { get; set; } = PrintOrientation.Portrait;

    /// <summary>
    /// Gets or sets the amount which the printed content is zoomed. Valid values are 0.1 to 2.0.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException">If the value is not set between 0.1 and 2.0.</exception>
    public double ScaleFactor
    {
        get => this.scale;
        set
        {
            if (value < 0.1 || value > 2.0)
            {
                throw new ArgumentOutOfRangeException(nameof(value), "Scale factor must be between 0.1 and 2.0.");
            }

            this.scale = value;
        }
    }

    /// <summary>
    /// Gets or sets a value indicating whether to print background images in the printed document.
    /// </summary>
    public bool OutputBackgroundImages { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to shrink the content to fit the printed page size.
    /// </summary>
    public bool ShrinkToFit { get; set; } = true;

    /// <summary>
    /// Gets or sets the dimensions for each page in the printed document.
    /// </summary>
    /// <exception cref="ArgumentNullException">If the value is set to <see langword="null"/>.</exception>
    public PageSize PageDimensions
    {
        get => this.pageSize;
        set => this.pageSize = value ?? throw new ArgumentNullException(nameof(value));
    }

    /// <summary>
    /// Gets or sets the margins for each page in the document.
    /// </summary>
    /// <exception cref="ArgumentNullException">If the value is set to <see langword="null"/>.</exception>
    public Margins PageMargins
    {
        get => this.margins;
        set => this.margins = value ?? throw new ArgumentNullException(nameof(value));
    }

    /// <summary>
    /// Adds a page to the list of pages to be included in the document.
    /// </summary>
    /// <param name="pageNumber">The page number to be included in the document.</param>
    /// <exception cref="ArgumentOutOfRangeException">If <paramref name="pageNumber"/> is negative.</exception>
    /// <exception cref="ArgumentException">If the requested page has already been added.</exception>
    public void AddPageToPrint(int pageNumber)
    {
        if (pageNumber < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(pageNumber), "Page number must be greater than or equal to zero");
        }

        if (this.pageRanges.Contains(pageNumber))
        {
            throw new ArgumentException("Cannot add the same page number twice", nameof(pageNumber));
        }

        this.pageRanges.Add(pageNumber);
    }

    /// <summary>
    /// Adds a range of pages to be included in the document.
    /// </summary>
    /// <param name="pageRange">A string of the form "x-y" representing the page numbers to include.</param>
    /// <exception cref="ArgumentException">
    /// <para>If <paramref name="pageRange"/> is <see langword="null"/> or <see cref="string.Empty"/>.</para>
    /// <para>-or-</para>
    /// <para>If the requested <paramref name="pageRange"/> is already included.</para>
    /// <para>-or-</para>
    /// <para>If the requested <paramref name="pageRange"/> has multiple '-' separators.</para>
    /// <para>-or-</para>
    /// <para>If a bound value is neither empty nor a number.</para>
    /// </exception>
    /// <exception cref="ArgumentOutOfRangeException">
    /// <para>If <paramref name="pageRange"/> has a negative lower bound.</para>
    /// <para>-or-</para>
    /// <para>If <paramref name="pageRange"/> has an upper bound less than the lower bound.</para>
    /// </exception>
    public void AddPageRangeToPrint(string pageRange)
    {
        if (string.IsNullOrEmpty(pageRange))
        {
            throw new ArgumentException("Page range cannot be null or the empty string", nameof(pageRange));
        }

        if (this.pageRanges.Contains(pageRange))
        {
            throw new ArgumentException("Cannot add the same page range twice", nameof(pageRange));
        }

        string[] pageRangeParts = pageRange.Trim().Split('-');
        if (pageRangeParts.Length > 2)
        {
            throw new ArgumentException("Page range cannot have multiple separators", nameof(pageRange));
        }

        int startPage = ParsePageRangePart(pageRangeParts[0], 1);
        if (startPage < 1)
        {
            throw new ArgumentOutOfRangeException(nameof(pageRange), "Start of a page range must be greater than or equal to 1");
        }

        if (pageRangeParts.Length == 2)
        {
            int endPage = ParsePageRangePart(pageRangeParts[1], int.MaxValue);
            if (endPage < startPage)
            {
                throw new ArgumentOutOfRangeException(nameof(pageRange), "End of a page range must be greater than or equal to the start of the page range");
            }
        }

        this.pageRanges.Add(pageRange);
    }

    internal Dictionary<string, object?> ToDictionary()
    {
        Dictionary<string, object?> toReturn = new Dictionary<string, object?>();

        if (this.Orientation != PrintOrientation.Portrait)
        {
            toReturn["orientation"] = this.Orientation.ToString().ToLowerInvariant();
        }

        if (this.scale != 1.0)
        {
            toReturn["scale"] = this.scale;
        }

        if (this.OutputBackgroundImages)
        {
            toReturn["background"] = this.OutputBackgroundImages;
        }

        if (!this.ShrinkToFit)
        {
            toReturn["shrinkToFit"] = this.ShrinkToFit;
        }

        if (this.pageSize.Height != DefaultPageHeight || this.pageSize.Width != DefaultPageWidth)
        {
            Dictionary<string, object?> pageSizeDictionary = new Dictionary<string, object?>();
            pageSizeDictionary["width"] = this.pageSize.Width;
            pageSizeDictionary["height"] = this.pageSize.Height;
            toReturn["page"] = pageSizeDictionary;
        }

        if (this.margins.Top != DefaultMarginSize || this.margins.Bottom != DefaultMarginSize || this.margins.Left != DefaultMarginSize || this.margins.Right != DefaultMarginSize)
        {
            Dictionary<string, object?> marginsDictionary = new Dictionary<string, object?>();
            marginsDictionary["top"] = this.margins.Top;
            marginsDictionary["bottom"] = this.margins.Bottom;
            marginsDictionary["left"] = this.margins.Left;
            marginsDictionary["right"] = this.margins.Right;
            toReturn["margin"] = marginsDictionary;
        }

        if (this.pageRanges.Count > 0)
        {
            toReturn["pageRanges"] = new List<object?>(this.pageRanges);
        }

        return toReturn;
    }

    private static int ParsePageRangePart(string pageRangePart, int defaultValue)
    {
        pageRangePart = pageRangePart.Trim();

        if (string.IsNullOrEmpty(pageRangePart))
        {
            return defaultValue;
        }

        if (int.TryParse(pageRangePart, NumberStyles.Integer, CultureInfo.InvariantCulture, out int pageRangePartValue))
        {
            return pageRangePartValue;
        }

        throw new ArgumentException("Parts of a page range must be an empty string or an integer");
    }

    /// <summary>
    /// An object representing the page size of the print options.
    /// </summary>
    public class PageSize
    {
        private double height = DefaultPageHeight;
        private double width = DefaultPageWidth;

        /// <summary>
        /// Represents the A4 paper size.
        /// Width: 21.0 cm, Height: 29.7 cm
        /// </summary>
        public static PageSize A4 => new PageSize { Width = 21.0, Height = 29.7 }; // cm

        /// <summary>
        /// Represents the Legal paper size.
        /// Width: 21.59 cm, Height: 35.56 cm
        /// </summary>
        public static PageSize Legal => new PageSize { Width = 21.59, Height = 35.56 }; // cm

        /// <summary>
        /// Represents the Letter paper size.
        /// Width: 21.59 cm, Height: 27.94 cm
        /// </summary>
        public static PageSize Letter => new PageSize { Width = 21.59, Height = 27.94 }; // cm

        /// <summary>
        /// Represents the Tabloid paper size.
        /// Width: 27.94 cm, Height: 43.18 cm
        /// </summary>
        public static PageSize Tabloid => new PageSize { Width = 27.94, Height = 43.18 }; // cm

        /// <summary>
        /// Gets or sets the height of each page in centimeters.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double Height
        {
            get => this.height;
            set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), "Height must be greater than or equal to zero.");
                }

                this.height = value;
            }
        }

        /// <summary>
        /// Gets or sets the width of each page in centimeters.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double Width
        {
            get => this.width;
            set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), "Width must be greater than or equal to zero.");
                }

                this.width = value;
            }
        }

        /// <summary>
        /// Gets or sets the height of each page in inches.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double HeightInInches
        {
            get => this.Height / CentimetersPerInch;
            set => this.Height = value * CentimetersPerInch;
        }

        /// <summary>
        /// Gets or sets the width of each page in inches.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double WidthInInches
        {
            get => this.Width / CentimetersPerInch;
            set => this.Width = value * CentimetersPerInch;
        }
    }

    /// <summary>
    /// An object representing the margins for printing.
    /// </summary>
    public class Margins
    {
        private double top = DefaultMarginSize;
        private double bottom = DefaultMarginSize;
        private double left = DefaultMarginSize;
        private double right = DefaultMarginSize;

        /// <summary>
        /// Gets or sets the top margin of the print options.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double Top
        {
            get => this.top;
            set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), "Top margin must be greater than or equal to zero.");
                }

                this.top = value;
            }
        }

        /// <summary>
        /// Gets or sets the bottom margin of the print options.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double Bottom
        {
            get => this.bottom;
            set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), "Bottom margin must be greater than or equal to zero.");
                }

                this.bottom = value;
            }
        }

        /// <summary>
        /// Gets or sets the left margin of the print options.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double Left
        {
            get => this.left;
            set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), "Left margin must be greater than or equal to zero.");
                }

                this.left = value;
            }
        }

        /// <summary>
        /// Gets or sets the right margin of the print options.
        /// </summary>
        /// <exception cref="ArgumentOutOfRangeException">If the value is set to a negative value.</exception>
        public double Right
        {
            get => this.right;
            set
            {
                if (value < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(value), "Right margin must be greater than or equal to zero.");
                }

                this.right = value;
            }
        }
    }
}
