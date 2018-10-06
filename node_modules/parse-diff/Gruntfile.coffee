module.exports = (grunt) ->

  # Project configuration.
	grunt.initConfig
		pkgFile: 'package.json'

		'npm-contributors':
			options:
				commitMessage: 'chore: update contributors'

		bump:
			options:
				commitMessage: 'chore: release v%VERSION%'
				pushTo: 'origin'

		'auto-release':
			options:
				checkTravisBuild: false

		jshint:
			options:
				# Expected an assignment or function call and instead saw an expression.
				'-W030': true,
				globals:
					node: true,
					console: true,
					module: true,
					require: true
			all:
				src: ['*.js']

		coffeelint:
			options:
				no_tabs: {level: 'ignore'}
				indentation: {level: 'ignore'}
			dev: ['*.coffee', 'lib/*.coffee', 'test/*.coffee']

		simplemocha:
			options:
				ui: 'bdd'
				reporter: 'spec'
			all: src: ['test/*.coffee']

		coffee:
			compile:
				options:
					bare: true
				files:
					'index.js': 'parse.coffee'

	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-jshint'
	grunt.loadNpmTasks 'grunt-coffeelint'
	grunt.loadNpmTasks 'grunt-simple-mocha'
	grunt.loadNpmTasks 'grunt-npm'
	grunt.loadNpmTasks 'grunt-bump'
	grunt.loadNpmTasks 'grunt-auto-release'

	grunt.registerTask 'release', 'Bump the version and publish to NPM.',
		(type) -> grunt.task.run [
			'npm-contributors',
			"bump:#{type||'patch'}",
			'npm-publish'
		]

	grunt.registerTask 'lint', ['coffeelint']
	grunt.registerTask 'build', ['coffee']
	grunt.registerTask 'test', ['lint', 'build', 'simplemocha']
	grunt.registerTask 'default', ['test']
