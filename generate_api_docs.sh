# Java
./go javadocs || exit

# Python
./go //py:setup //py:init py_docs || exit

# Ruby
./go //rb:docs || exit

git checkout rb/Gemfile.lock

# switch to gh-pages and copy the files
git checkout gh-pages || exit
rm -rf docs/api/java docs/api/py docs/api/rb

mv build/javadoc docs/api/java
mv build/docs/api/py docs/api/py
mv build/docs/api/rb docs/api/rb

git add -A docs/api

read -p "Do you want to commit the chages? (Y/n):" changes </dev/tty

if [ -z $changes ]; then
  changes=Y
fi

case "$changes" in
  Y|y) echo "";;
  N|n) exit;;
  *) exit;;
esac

echo "Commiting changes"
git commit -am "updating javadoc and py docs"

echo "pushing to origin gh-pages"
git push origin gh-pages

echo "switching back to master branch"
git checkout master
