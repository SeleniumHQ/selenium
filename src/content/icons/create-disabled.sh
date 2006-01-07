#!/bin/sh
#
# Create disabled icons with ImageMagick
#

convert icons.png -fill white -colorize 60% icons_disabled.png
