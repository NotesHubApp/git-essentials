# Contributing to Git Essentials

## Submitting an Issue

Before you submit an issue, please search the issue tracker. An issue for your problem might already exist and the discussion might inform you of workarounds readily available.

Before fixing a bug, we need to reproduce and confirm it.
In order to reproduce bugs, we require that you provide a minimal reproduction.
Having a minimal reproducible scenario gives us a wealth of important information without going back and forth to you with additional questions.

A minimal reproduction allows us to quickly confirm a bug (or point out a coding problem) as well as confirm that we are fixing the right problem.

We require a minimal reproduction to save maintainers' time and ultimately be able to fix more bugs.
Often, developers find coding problems themselves while preparing a minimal reproduction.
We understand that sometimes it might be hard to extract essential bits of code from a larger codebase, but we really need to isolate the problem before we can fix it.

Unfortunately, we are not able to investigate / fix bugs without a minimal reproduction, so if we don't hear back from you, we are going to close an issue that doesn't have enough info to be reproduced.

You can file new issues by selecting from our [new issue templates](https://github.com/NotesHubApp/git-essentials/issues/new/choose) and filling out the issue template.

## Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub](https://github.com/NotesHubApp/git-essentials/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.

2. Be sure that an issue describes the problem you're fixing, or documents the design for the feature you'd like to add.
   Discussing the design upfront helps to ensure that we're ready to accept your work.

3. [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) the *NotesHubApp/git-essentials* repo.

4. In your forked repository, make your changes in a new git branch:

  ```shell
  git checkout -b my-fix-branch main
  ```

5. Create your patch, following [code style guidelines](#coding-style-guidelines), and **including appropriate test cases**.

6. Run the full test suite and ensure that all tests pass.

7. Commit your changes using a descriptive commit message that follows our
  [commit message guidelines](#commit-message-guidelines). Adherence to these conventions is necessary because release notes are automatically generated from these messages.

8. Push your branch to GitHub:

  ```shell
  git push origin my-fix-branch
  ```

9. In GitHub, send a pull request to `git-essentials:main`.

10. If we suggest changes then:
    1. Make the required updates.

    2. Re-run the test suites to ensure tests are still passing.

    3. Create a fixup commit and push to your GitHub repository (this will update your Pull Request)

    4. When updating your feature branch with the requested changes, please do not overwrite the commit history, but rather contain the changes in new commits. This is for the sake of a clearer and easier review process.

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

- Update your `main` with the latest upstream version:

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

For now, try to follow the style that exists elsewhere in the source, and use your best judgment.

## Development Workflow

After cloning the project, run `npm install` to fetch its dependencies. Then, you can run several commands:

* `npm run check` - runs TypeScript type checking
* `npm run build` - builds the project and places the output into **dist** folder
* `npm run test` - runs tests in Node.js environment
* `npm run test:browser` - runs tests in browser of your choice
* `npm run test:browsers` - runs tests in a browser environments (headless mode)
* `npm run gen-doc` - generates the documentation from TypeScript source code and places the output into **docs** folder
* `npm run gen-fs-fixture` - generates a json file which represents file system fixture for unit tests requiring file system access; you need to pass folderpath as nameless parameter to the command, for example: *npm run gen-fs-fixture folder/path/to/repo*
* `npm run gen-http-fixture` - generates a pair request/response which represents http fixture for unit tests requiring network conectivity; when you run a unit test which does not have coresponding http fixture it will throw an error with the npm command to run to generate a fixuture so you don't have to come up with all parameters by yourself

## Documentation

* The documentation is auto-generated directly from the source code using [TypeDoc](https://github.com/TypeStrong/typedoc), so it's important to annotate your code changes with JSDoc comments
* After a PR is merged to `main` branch the docs will be published to https://noteshubapp.github.io/git-essentials

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

## Tests

We use Facebook's [Jest](https://jestjs.io) for testing,
but also the same
tests will run in the browser using [Jasmine](https://jasmine.github.io/) via [Karma](https://karma-runner.github.io) since their API is very similar.
So as result it's very important to run your tests in both Node.js (**Jest**) and browser (**Jasmine**) environments to make sure you did not introduce any breaking changes.

Since **git-essentials** is an [isomorphic library](https://en.wikipedia.org/wiki/Isomorphic_JavaScript) it becomes tricky to write unit tests that could run on both the client and server sides.
This problem has been solved by using file system and HTTP fixtures in the form of JSON files which can easily be imported into TypeScript instead of doing real network requests or file system access. For more details on how to generate those fixtures please refer to [Development Workflow](#development-workflow).

Please note that we still do have end-to-end tests which will use real network calls and file system access, but their goal is to test the overall behavior and their quantity is not comparable to unit tests.
