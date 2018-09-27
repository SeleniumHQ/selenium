# parses unified diff
# http://www.gnu.org/software/diffutils/manual/diffutils.html#Unified-Format
module.exports = (input) ->
	return [] if not input
	return [] if input.match /^\s+$/

	lines = input.split '\n'
	return [] if lines.length == 0

	files = []
	file = null
	ln_del = 0
	ln_add = 0
	current = null

	start = (line) ->
		file =
			chunks: []
			deletions: 0
			additions: 0
		files.push file

		if not file.to and not file.from
			fileNames = parseFile line

			if fileNames
				file.from = fileNames[0]
				file.to = fileNames[1]

	restart = ->
		start() if not file || file.chunks.length

	new_file = ->
		restart()
		file.new = true
		file.from = '/dev/null'

	deleted_file = ->
		restart()
		file.deleted = true
		file.to = '/dev/null'

	index = (line) ->
		restart()
		file.index = line.split(' ').slice(1)

	from_file = (line) ->
		restart()
		file.from = parseFileFallback line

	to_file = (line) ->
		restart()
		file.to = parseFileFallback line

	chunk = (line, match) ->
		ln_del = oldStart = +match[1]
		oldLines = +(match[2] || 0)
		ln_add = newStart = +match[3]
		newLines = +(match[4] || 0)
		current = {
			content: line,
			changes: [],
			oldStart, oldLines, newStart, newLines
		}
		file.chunks.push current

	del = (line) ->
		return unless current
		current.changes.push {type:'del', del:true, ln:ln_del++, content:line}
		file.deletions++

	add = (line) ->
		return unless current
		current.changes.push {type:'add', add:true, ln:ln_add++, content:line}
		file.additions++

	normal = (line) ->
		return unless current
		current.changes.push {
			type: 'normal'
			normal: true
			ln1: ln_del++
			ln2: ln_add++
			content: line
		}

	eof = (line) ->
		[..., recentChange] = current.changes

		current.changes.push {
			type: recentChange.type
			"#{recentChange.type}": true
			ln1: recentChange.ln1
			ln2: recentChange.ln2
			ln: recentChange.ln
			content: line
		}

	schema = [
		# todo beter regexp to avoid detect normal line starting with diff
		[/^\s+/, normal],
		[/^diff\s/, start],
		[/^new file mode \d+$/, new_file],
		[/^deleted file mode \d+$/, deleted_file],
		[/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, index],
		[/^---\s/, from_file],
		[/^\+\+\+\s/, to_file],
		[/^@@\s+\-(\d+),?(\d+)?\s+\+(\d+),?(\d+)?\s@@/, chunk],
		[/^-/, del],
		[/^\+/, add],
		[/^\\ No newline at end of file$/, eof]
	]

	parse = (line) ->
		for p in schema
			m = line.match p[0]
			if m
				p[1](line, m)
				return true
		return false

	for line in lines
		parse line

	return files

parseFile = (s) ->
	return if not s

	fileNames = s.split(' ').slice(-2)
	fileNames.map (fileName, i) ->
		fileNames[i] = fileName.replace(/^(a|b)\//, '')

	return fileNames

# fallback function to overwrite file.from and file.to if executed
parseFileFallback = (s) ->
	s = ltrim s, '-'
	s = ltrim s, '+'
	s = s.trim()
	# ignore possible time stamp
	t = (/\t.*|\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/).exec(s)
	s = s.substring(0, t.index).trim() if t
	# ignore git prefixes a/ or b/
	if s.match (/^(a|b)\//) then s.substr(2) else s

ltrim = (s, chars) ->
	s = makeString(s)
	return trimLeft.call(s) if !chars and trimLeft
	chars = defaultToWhiteSpace(chars)
	return s.replace(new RegExp('^' + chars + '+'), '')

makeString = (s) -> if s == null then '' else s + ''

trimLeft = String.prototype.trimLeft

defaultToWhiteSpace = (chars) ->
  return '\\s' if chars == null
  return chars.source if chars.source
  return '[' + escapeRegExp(chars) + ']'

escapeRegExp = (s) ->
	makeString(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1')
