# Java
./go javadocs || exit

# Python
./go py_docs || exit


# switch to gh-pages and copy the files
git checkout gh-pages || exit
rm -rf docs/api/java docs/api/py

mv build/javadoc docs/api/java
mv build/docs/api/py docs/api/py

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
