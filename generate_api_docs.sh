#!/usr/bin/env bash

API_DOCS_LANGUAGE=$1

case ${API_DOCS_LANGUAGE} in
java)
  ./go javadocs || exit
  ;;
py)
  tox -c py/tox.ini -e docs || exit
  ;;
rb)
  cd rb || exit
  bundle install || exit
  cd ..
  bazel run //rb:docs || exit
  git checkout rb/Gemfile.lock || true
  ;;
*)
  echo "Selenium API docs generation"
  echo "ERROR: unknown parameter \"$API_DOCS_LANGUAGE\""
  echo "Usage:"
  echo ""
  echo "./generate_api_docs.sh java|rb|py"
  echo -e "\t Example:"
  echo -e "\t Generating API docs for the Ruby bindings"
  echo -e "\t ./generate_api_docs.sh rb"
  exit 1
  ;;
esac

# switch to gh-pages and copy the files
git checkout gh-pages || exit
# make sure that our local version is up to date.
git pull || exit

case ${API_DOCS_LANGUAGE} in
java)
  rm -rf docs/api/java
  mv build/javadoc docs/api/java
  ;;
py)
  rm -rf docs/api/py
  mv build/docs/api/py docs/api/py
  ;;
rb)
  rm -rf docs/api/rb
  mv bazel-bin/rb/docs.runfiles/selenium/docs/api/rb docs/api/rb
  ;;
*)
  echo "ERROR: unknown parameter \"$API_DOCS_LANGUAGE\""
  exit 1
  ;;
esac

git add -A docs/api

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
git commit -am "updating API docs"

echo "pushing to origin gh-pages"
git push origin gh-pages

echo "switching back to trunk branch"
git checkout trunk
