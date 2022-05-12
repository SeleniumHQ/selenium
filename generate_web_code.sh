#!/usr/bin/env bash

# copy website to build
cp -R common/src/web build

# switch to gh-pages and copy the files
git checkout gh-pages || exit
# make sure that our local version is up to date.
git pull || exit

rm -rf web
mv build/web web

git add -A web

read -p "Do you want to commit the changes? (Y/n):" changes </dev/tty

if [ -z $changes ]; then
  changes=Y
fi

case "$changes" in
Y | y) echo "" ;;
N | n) exit ;;
*) exit ;;
esac

echo "Committing changes"
git commit -am "updating test website code"

echo "pushing to origin gh-pages"
git push origin gh-pages

echo "switching back to trunk branch"
git checkout trunk
