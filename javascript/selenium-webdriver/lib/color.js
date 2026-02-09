class Color {
  constructor(colorStr) {
    this.original = colorStr.trim();
    this.parse(this.original);
  }

  parse(colorStr) {
    if (!colorStr) throw new Error('Color string is required');

    // HEX
    if (colorStr.startsWith('#')) {
      this.hex = colorStr.toLowerCase();
      this.rgb = Color.hexToRgb(this.hex);
      this.alpha = 1;
    }
    // RGB / RGBA
    else if (colorStr.startsWith('rgb')) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
      if (!match) throw new Error(`Invalid rgb(a) format: ${colorStr}`);
      const [_, r, g, b, a] = match;
      this.rgb = `rgb(${r}, ${g}, ${b})`;
      this.hex = Color.rgbToHex(this.rgb);
      this.alpha = a !== undefined ? parseFloat(a) : 1;
    }
    // Named colors (optional)
    else {
      throw new Error(`Unsupported color format: ${colorStr}`);
    }
  }

  getRgb() {
    return this.rgb;
  }

  getRgba() {
    return `rgba(${this.rgb.match(/\d+/g).join(', ')}, ${this.alpha})`;
  }

  getHex() {
    return this.hex;
  }

  toString() {
    return this.original;
  }

  // Helpers
  static hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  static rgbToHex(rgb) {
    const match = rgb.match(/\d+/g);
    if (!match) return null;
    return (
      '#' +
      match
        .slice(0, 3)
        .map((x) => parseInt(x).toString(16).padStart(2, '0'))
        .join('')
    ).toLowerCase();
  }
}

module.exports = Color;
