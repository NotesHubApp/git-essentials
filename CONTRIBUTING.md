# Contributing to Git Essentials

## Submitting a Pull Request (PR)
Before you submit your Pull Request (PR) consider the following guidelines:

- Search [GitHub](https://github.com/NotesHubApp/git-essentials/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
- Make your changes in a new git branch:

  ```shell
  git checkout -b my-fix-branch main
  ```

- Create your patch, following [code style guidelines](#coding-style-guidelines), and **including appropriate test cases**.
- Run the full test suite and ensure that all tests pass.
- Commit your changes using a descriptive commit message that follows our
  [commit message guidelines](#commit-message-guidelines). Adherence to these conventions
  is necessary because release notes are automatically generated from these messages.

- Push your branch to GitHub:

  ```shell
  git push origin my-fix-branch
  ```

- In GitHub, send a pull request to `git-essentials:main`.
- If we suggest changes then:

  - Make the required updates.
  - Re-run the test suites to ensure tests are still passing.
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

  - When updating your feature branch with the requested changes, please do not overwrite the commit history, but rather contain the changes in new commits. This is for the sake of a clearer and easier review process.

That's it! Thank you for your contribution!

### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```shell
  git push origin --delete my-fix-branch
  ```

- Check out the main branch:

  ```shell
  git checkout main -f
  ```

- Delete the local branch:

  ```shell
  git branch -D my-fix-branch
  ```

- Update your master with the latest upstream version:

  ```shell
  git pull --ff upstream main
  ```

## Coding Style Guidelines
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more unit tests.
* All public API methods **must be documented**.
* Please use proper types and generics throughout your code.
* 2 space indentation only
* Favor readability over terseness

(TBD): For now, try to follow the style that exists elsewhere in the source, and use your best judgment.

## Development Workflow
After cloning the project, run `npm install` to fetch its dependencies. Then, you can run several commands:

* `npm run check` - runs TypeScript type checking
* `npm run build` - builds the project and places the output into **dist** folder
* `npm run test` - runs tests in Node.js environment
* `npm run test:browser` - runs tests in browser of your choice
* `npm run test:browsers` - runs tests in a browser environments (headless mode)
* `npm run gen-doc` - generates documentation from TypeScript source code and places the output into **docs** folder
* `npm run gen-fs-fixture` - generates a json file which represents file system fixture for unit tests requiring file system access; you need to pass folderpath as nameless parameter to the command, for example: *npm run gen-fs-fixture folder/path/to/repo*
* `npm run gen-http-fixture` - generates a pair request/response which represents http fixture for unit tests requiring network conectivity; when you run a unit test which does not have coresponding http fixture it will throw an error with the npm command to run to generate a fixuture so you don't have to come up with all parameters by yourself


## Documentation

* The documentation is auto-generated directly from the source code using [TypeDoc](https://github.com/TypeStrong/typedoc)
* After a PR is merged to `main` branch the docs will be published to https://noteshubapp.github.io/git-essentials/modules/API.html

## Unit Tests
???

## Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more readable messages** that are easy to follow when looking through the **project history**. Following formalized conventions for commit messages, **semantic-release** automatically determines the next [semantic version](https://semver.org) number, generates a changelog and publishes the release.


### Commit Message Format

*This specification is inspired by the [Angular Commit Message Conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).*

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer than 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope

The scope could be anything specifying the place of the commit change. For example
`clone`, `merge`, `FsClient`, etc.

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.
