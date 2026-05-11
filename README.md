# GitHub Action Deploy SSH

A Github action to deploy a NodeJS service in a remote server

### Options

| Option            | Description                                                                                | Type   | Default |            |
| ----------------- | ------------------------------------------------------------------------------------------ | ------ | ------- | ---------- |
| `host`            | The server host.                                                                           | string |         | `required` |
| `port`            | The server port.                                                                           | number |         | `required` |
| `username`        | Username for authentication.                                                               | string |         | `required` |
| `password`        | Password for user authentication.                                                          | string |         | `required` |
| `cwd`             | The working directory where the commands are executed.                                     | string |         | `required` |
| `package_manager` | Package manager to use (`yarn` or `pnpm`). Auto-detected from lock files if not specified. | string |         | `optional` |

### Example usage

```yml
- name: Deploy React build
  uses: sergiogc9/github-action-deploy-ssh@latest
  with:
    host: ${{ secrets.HOST }}
    port: ${{ secrets.PORT }}
    username: ${{ secrets.USERNAME }}
    password: ${{ secrets.PASSWORD }}
    cwd: '/home/user/web/react/'
```

**IMPORTANT:**

This action will execute the following scripts inside the remote server connected through SSH:

```bash
git pull
<package_manager> deploy
```

The package manager is auto-detected by looking for `pnpm-lock.yaml` in the working directory. If not found, it defaults to `yarn`. You can also explicitly set it using the `package_manager` input.

A `deploy` NPM script is needed to perform the necessary deploy actions. Example:

```json
"deploy": "yarn install && yarn build && pm2 restart server-name",
```

### Development

To create a new version follow these steps:

1. Update and commit code.
2. Create a new build using `yarn build` and commit the `dist` folder.
3. Update version in package.json and commit with name as `Release VERSION`.
4. Create a new version tag using `git tag VERSION`.
5. Set created tag as `latest` tag using `git tag -f latest`.
6. Push tags with `git push --tags --force`.
7. Create a release using the github page.

### Credits

Built using [node-ssh](https://github.com/steelbrain/node-ssh).
