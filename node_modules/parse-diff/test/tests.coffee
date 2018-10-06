expect = require 'expect.js'
parse = require '../index'

describe 'diff parser', ->
	it 'should parse null', ->
		expect(parse(null).length).to.be(0)

	it 'should parse empty string', ->
		expect(parse('').length).to.be(0)

	it 'should parse whitespace', ->
		expect(parse(' ').length).to.be(0)

	it 'should parse simple git-like diff', ->
		diff = """
diff --git a/file b/file
index 123..456 789
--- a/file
+++ b/file
@@ -1,2 +1,2 @@
- line1
+ line2
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.from).to.be('file')
		expect(file.to).to.be('file')
		expect(file.chunks.length).to.be(1)
		chunk = file.chunks[0]
		expect(chunk.content).to.be('@@ -1,2 +1,2 @@')
		expect(chunk.changes.length).to.be(2)
		expect(chunk.changes[0].content).to.be('- line1')
		expect(chunk.changes[1].content).to.be('+ line2')

	it 'should parse diff with new file mode line', ->
		diff = """
diff --git a/test b/test
new file mode 100644
index 0000000..db81be4
--- /dev/null
+++ b/test
@@ -0,0 +1,2 @@
+line1
+line2
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.new).to.be.true
		expect(file.from).to.be('/dev/null')
		expect(file.to).to.be('test')
		expect(file.chunks[0].content).to.be('@@ -0,0 +1,2 @@')
		expect(file.chunks[0].changes.length).to.be(2)
		expect(file.chunks[0].changes[0].content).to.be('+line1')
		expect(file.chunks[0].changes[1].content).to.be('+line2')

	it 'should parse diff with deleted file mode line', ->
		diff = """
diff --git a/test b/test
deleted file mode 100644
index db81be4..0000000
--- b/test
+++ /dev/null
@@ -1,2 +0,0 @@
-line1
-line2
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.deleted).to.be.true
		expect(file.from).to.be('test')
		expect(file.to).to.be('/dev/null')
		expect(file.chunks[0].content).to.be('@@ -1,2 +0,0 @@')
		expect(file.chunks[0].changes.length).to.be(2)
		expect(file.chunks[0].changes[0].content).to.be('-line1')
		expect(file.chunks[0].changes[1].content).to.be('-line2')

	it 'should parse diff with single line files', ->
		diff = """
diff --git a/file1 b/file1
deleted file mode 100644
index db81be4..0000000
--- b/file1
+++ /dev/null
@@ -1 +0,0 @@
-line1
diff --git a/file2 b/file2
new file mode 100644
index 0000000..db81be4
--- /dev/null
+++ b/file2
@@ -0,0 +1 @@
+line1
"""
		files = parse diff
		expect(files.length).to.be(2)
		file = files[0]
		expect(file.deleted).to.be.true
		expect(file.from).to.be('file1')
		expect(file.to).to.be('/dev/null')
		expect(file.chunks[0].content).to.be('@@ -1 +0,0 @@')
		expect(file.chunks[0].changes.length).to.be(1)
		expect(file.chunks[0].changes[0].content).to.be('-line1')
		expect(file.chunks[0].changes[0].type).to.be('del')
		file = files[1]
		expect(file.new).to.be.true
		expect(file.from).to.be('/dev/null')
		expect(file.to).to.be('file2')
		expect(file.chunks[0].content).to.be('@@ -0,0 +1 @@')
		expect(file.chunks[0].newLines).to.be(0)
		expect(file.chunks[0].changes.length).to.be(1)
		expect(file.chunks[0].changes[0].content).to.be('+line1')
		expect(file.chunks[0].changes[0].type).to.be('add')

	it 'should parse multiple files in diff', ->
		diff = """
diff --git a/file1 b/file1
index 123..456 789
--- a/file1
+++ b/file1
@@ -1,2 +1,2 @@
- line1
+ line2
diff --git a/file2 b/file2
index 123..456 789
--- a/file2
+++ b/file2
@@ -1,3 +1,3 @@
- line1
+ line2
"""
		files = parse diff
		expect(files.length).to.be(2)
		file = files[0]
		expect(file.from).to.be('file1')
		expect(file.to).to.be('file1')
		expect(file.chunks[0].content).to.be('@@ -1,2 +1,2 @@')
		expect(file.chunks[0].changes.length).to.be(2)
		expect(file.chunks[0].changes[0].content).to.be('- line1')
		expect(file.chunks[0].changes[1].content).to.be('+ line2')
		file = files[1]
		expect(file.from).to.be('file2')
		expect(file.to).to.be('file2')
		expect(file.chunks[0].content).to.be('@@ -1,3 +1,3 @@')
		expect(file.chunks[0].changes.length).to.be(2)
		expect(file.chunks[0].changes[0].content).to.be('- line1')
		expect(file.chunks[0].changes[1].content).to.be('+ line2')

	it 'should parse diff with EOF flag', ->
		diff = """
diff --git a/file1 b/file1
index 123..456 789
--- a/file1
+++ b/file1
@@ -1,2 +1,2 @@
- line1
+ line2
\\ No newline at end of file
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.from).to.be('file1')
		expect(file.to).to.be('file1')
		chunk = file.chunks[0]
		expect(chunk.content).to.be('@@ -1,2 +1,2 @@')
		expect(chunk.changes.length).to.be(3)
		expect(chunk.changes[0].content).to.be('- line1')
		expect(chunk.changes[1].content).to.be('+ line2')
		expect(chunk.changes[2].type).to.be('add')
		expect(chunk.changes[2].content).to.be('\\ No newline at end of file')

	it 'should parse gnu sample diff', ->
		diff = """
--- lao	2002-02-21 23:30:39.942229878 -0800
+++ tzu	2002-02-21 23:30:50.442260588 -0800
@@ -1,7 +1,6 @@
-The Way that can be told of is not the eternal Way;
-The name that can be named is not the eternal name.
 The Nameless is the origin of Heaven and Earth;
-The Named is the mother of all things.
+The named is the mother of all things.
+
 Therefore let there always be non-being,
	so we may see their subtlety,
And let there always be being,
@@ -9,3 +8,6 @@
 The two are the same,
 But after they are produced,
	they have different names.
+They both may be called deep and profound.
+Deeper and more profound,
+The door of all subtleties!
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.from).to.be('lao')
		expect(file.to).to.be('tzu')
		expect(file.chunks.length).to.be(2)
		chunk0 = file.chunks[0]
		expect(chunk0.oldStart).to.be(1)
		expect(chunk0.oldLines).to.be(7)
		expect(chunk0.newStart).to.be(1)
		expect(chunk0.newLines).to.be(6)
		chunk1 = file.chunks[1]
		expect(chunk1.oldStart).to.be(9)
		expect(chunk1.oldLines).to.be(3)
		expect(chunk1.newStart).to.be(8)
		expect(chunk1.newLines).to.be(6)

	it 'should parse hg diff output', ->
		diff = """
diff -r 514fc757521e lib/parsers.coffee
--- a/lib/parsers.coffee	Thu Jul 09 00:56:36 2015 +0200
+++ b/lib/parsers.coffee	Fri Jul 10 16:23:43 2015 +0200
@@ -43,6 +43,9 @@
             files[file] = { added: added, deleted: deleted }
         files

+    diff: (out) ->
+        files = {}
+
 module.exports = Parsers

 module.exports.version = (out) ->
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.chunks[0].content).to.be('@@ -43,6 +43,9 @@')
		expect(file.from).to.be('lib/parsers.coffee')
		expect(file.to).to.be('lib/parsers.coffee')

	it 'should parse svn diff output', ->
		diff = """
Index: new.txt
===================================================================
--- new.txt	(revision 0)
+++ new.txt	(working copy)
@@ -0,0 +1 @@
+test
Index: text.txt
===================================================================
--- text.txt	(revision 6)
+++ text.txt	(working copy)
@@ -1,7 +1,5 @@
-This part of the
-document has stayed the
-same from version to
-version.  It shouldn't
+This is an important
+notice! It shouldn't
 be shown if it doesn't
 change.  Otherwise, that
 would not be helping to
"""
		files = parse diff
		expect(files.length).to.be(2)
		file = files[0]
		expect(file.from).to.be('new.txt')
		expect(file.to).to.be('new.txt')
		expect(file.chunks[0].changes.length).to.be(1)

	it 'should parse file names for n new empty file', ->
		diff = """
diff --git a/newFile.txt b/newFile.txt
new file mode 100644
index 0000000..e6a2e28
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.from).to.be('/dev/null')
		expect(file.to).to.be('newFile.txt')

	it 'should parse file names for a deleted file', ->
		diff = """
diff --git a/deletedFile.txt b/deletedFile.txt
deleted file mode 100644
index e6a2e28..0000000
"""
		files = parse diff
		expect(files.length).to.be(1)
		file = files[0]
		expect(file.from).to.be('deletedFile.txt')
		expect(file.to).to.be('/dev/null')
