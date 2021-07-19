# Java
./go javadocs || exit

# Python
tox -c py/tox.ini -e docs || exit

# Ruby
cd rb
bundle install || exit
cd ..
./go //rb:docs || exit

git checkout rb/Gemfile.lock

# switch to gh-pages and copy the files
git checkout gh-pages || exit
# make sure that our local version is up to date.
git pull || exit
rm -rf docs/api/java docs/api/py docs/api/rb

mv build/javadoc docs/api/java
mv build/docs/api/py docs/api/py
mv bazel-bin/rb/docs.runfiles/selenium/docs/api/rb docs/api/rb

git add -A docs/api

read -p "Do you want to commit the changes? (Y/n):" changes </dev/tty

if [ -z $changes ]; then
  changes=Y
fi

case "$changes" in
  Y|y) echo "";;
  N|n) exit;;
  *) exit;;
esac

echo "Committing changes"
git commit -am "updating API docs"

echo "pushing to origin gh-pages"
git push origin gh-pages

echo "switching back to trunk branch"
git checkout trunk
