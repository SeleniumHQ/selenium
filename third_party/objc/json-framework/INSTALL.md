Installation
============

The simplest way to start using JSON in your application is to copy all
the source files (the contents of the `Classes` folder) into your own
Xcode project.

1. In the Finder, navigate to the distribution's folder
1. Navigate into the `Classes` folder.
1. Select all the files and drag-and-drop them into your Xcode project.
1. Tick the **Copy items into destination group's folder** option.
1. Use `#import "SBJson.h"` in  your source files.

That should be it. Now create that Twitter client!

Upgrading
---------

If you're upgrading from a previous version, make sure you're deleting
the old SBJson classes first, moving all the files to Trash.


Linking rather than copying
---------------------------

Copying the SBJson classes into your project isn't the only way to use
this framework. With Xcode 4's workspaces it has become much simpler to
link to dependant projects. The examples in the distribution link to the
iOS library and Mac framework, respectively. Des Hartman wrote [a blog
post with step-by-step instructions for iOS][link-ios].

[link-ios]: http://deshartman.wordpress.com/2011/09/02/configuring-sbjson-framework-for-xcode-4-2/


