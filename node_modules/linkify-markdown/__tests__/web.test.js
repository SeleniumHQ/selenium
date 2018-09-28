const { linkify } = require('../src/web')

const sample = `
# Sample

@nitin42

@kentcdodds

#1

#2

Commit - dfaec38da4cd170dd1acce4e4c260f735fe2cfdc
`

const outputWithStrongOption = `# Sample

[**@nitin42**](https://github.com/nitin42)

[**@kentcdodds**](https://github.com/kentcdodds)

[#1](https://github.com/nitin42/cli-test-repo/issues/1)

[#2](https://github.com/nitin42/cli-test-repo/issues/2)

Commit - [\`dfaec38\`](https://github.com/nitin42/cli-test-repo/commit/dfaec38da4cd170dd1acce4e4c260f735fe2cfdc)\n`

const outputWithoutStrongOption = `# Sample

[@nitin42](https://github.com/nitin42)

[@kentcdodds](https://github.com/kentcdodds)

[#1](https://github.com/nitin42/cli-test-repo/issues/1)

[#2](https://github.com/nitin42/cli-test-repo/issues/2)

Commit - [\`dfaec38\`](https://github.com/nitin42/cli-test-repo/commit/dfaec38da4cd170dd1acce4e4c260f735fe2cfdc)\n`

const empty = ''

describe('linkify for web', () => {
  it("should process a markdown string of code with 'strong' option", () => {
    const options = {
      strong: true,
      repository: 'https://github.com/nitin42/cli-test-repo'
    }

    expect(linkify(sample, options)).toEqual(outputWithStrongOption)
  })

  it("should process a markdown string of code without 'strong' option", () => {
    const options = {
      repository: 'https://github.com/nitin42/cli-test-repo'
    }

    expect(linkify(sample, options)).toEqual(outputWithoutStrongOption)
  })

  it("should skip processing an empty markdown string", () => {
    const options = {
      strong: true,
      repository: 'https://github.com/nitin42/cli-test-repo'
    }

    expect(linkify('', options)).toEqual('\n')
  })

  // This case will be passed if uncommented because it depends on the repository field in package.json file of this project.
  // But that url corresponds to this project on GitHub and not a dummy url, so this will fail. 
  // Uncomment the below code and change the repository field in package.json file to have the url 'https://github.com/nitin42/cli-test-repo'

  // it("should process a markdown string of code if repository is provided in package.json instead of options", () => {
  //   const options = {
  //     strong: true
  //   }
  //
  //   expect(linkify(sample, options)).toEqual(outputWithStrongOption)
  // })
})
