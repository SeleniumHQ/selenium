#!/bin/bash

echo You must install FireBug and XPath Checker in the default profile of your local Firefox before running this script

this_dir=`pwd`



ff=$HOME/.mozilla/firefox/*.default/extensions
if [ -e $ff ] ; then
	echo Linux..
else
    IFS=$'\n'
    echo Mac..
	ff=$HOME/Library/Application\ Support/Firefox/Profiles/*.default/extensions/
fi

echo Found extensions in $ff

selenium_dir="$this_dir/target"
normal_jar="$selenium_dir/selenium-server.jar"
extended_jar="$selenium_dir/selenium-server-with-FF-extensions.jar"

if [ -e $extended_jar ] ; then
    echo "$extended_jar already exists. Please delete it first."
    exit 1
fi

firebug=$ff/firebug@software.joehewitt.com
xpathchecker=$ff/\{7eb3f691-25b4-4a85-9038-9e57e2bcd537\}

mkdir -p /tmp/ff
cd /tmp/ff

mkdir -p customProfileDirCUSTFF/extensions
cp -R $firebug customProfileDirCUSTFF/extensions
cp -R $xpathchecker customProfileDirCUSTFF/extensions

# make it work for "chrome mode" too (whatever that is)
cp -R customProfileDirCUSTFF/* customProfileDirCUSTFFCHROME

cp $normal_jar $extended_jar
chmod +w $extended_jar
jar -uf $extended_jar .

echo A new jar has been created for you: $extended_jar

cd - > /dev/null
