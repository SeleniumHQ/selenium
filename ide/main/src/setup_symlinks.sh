#!/bin/bash
# This file sets up symlinks, so that you can install Selenium IDE from the source tree (through a 'proxy' file as per http://selite.github.io/InstallFromSource).
# Run ./go first. Then run this file.

#change dir to where this script is run from:
cd "$( dirname "${BASH_SOURCE[0]}" )"

# Remove any previously set symlinks
find . -type l -delete

cd content/selenium-core
for f in ../../../../../javascript/selenium-core/*
do
    # copy, except for scripts/
    if [ $f != "../../../../../javascript/selenium-core/scripts" ]
    then
        #echo "Processing $f"
        ln -s $f 
    fi
done

cd scripts
for f in ../../../../../../javascript/selenium-core/scripts/*
do
    # copy, except for scripts/
    if [ $f != "../../../../../../javascript/selenium-core/scripts/selenium-testrunner.js"  -a  $f != "../../../../../../javascript/selenium-core/scripts/user-extensions.js" ]
    then
        #echo "Processing $f"
        ln -s $f
    fi
done

ln -s ../../../../../../build/javascript/selenium-atoms/selenium-atoms.js atoms.js

#cd ..
#cd lib
#ln -s ../../../../../third_party/js/sizzle/sizzle.js

cd ../../../components
ln -s ../../prebuilt/main/SeleniumIDEGenericAutoCompleteSearch.xpt