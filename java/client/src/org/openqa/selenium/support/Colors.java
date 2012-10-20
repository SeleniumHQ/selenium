package org.openqa.selenium.support;

// Basic colour keywords as defined by the W3C HTML4 spec
// See http://www.w3.org/TR/css3-color/#html4

import org.openqa.selenium.support.Color;

public enum Colors {
    TRANSPARENT(new Color(0, 0, 0, 0d)),
    BLACK(new Color(0, 0, 0, 1d)),
    SILVER(new Color(192, 192, 192, 1d)),
    GRAY(new Color(128, 128, 128, 1d)),
    WHITE(new Color(255, 255, 255, 1d)),
    MAROON(new Color(128, 0, 0, 1d)),
    RED(new Color(255, 0, 0, 1d)),
    PURPLE(new Color(128, 0, 128, 1d)),
    FUCHSIA(new Color(255, 0, 255, 1d)),
    GREEN(new Color(0, 128, 0, 1d)),
    LIME(new Color(0, 255, 0, 1d)),
    OLIVE(new Color(128, 128, 0, 1d)),
    YELLOW(new Color(255, 255, 0, 1d)),
    NAVY(new Color(0, 0, 128, 1d)),
    BLUE(new Color(0, 0, 255, 1d)),
    TEAL(new Color(0, 128, 128, 1d)),
    AQUA(new Color(0, 255, 255, 1d));

    private final Color colorValue;

    private Colors(Color colorValue) {
        this.colorValue = colorValue;
    }

    public Color getColorValue() {
        return this.colorValue;
    }

}
