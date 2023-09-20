# Atlassian Forge Nx Plugin

## Installation

Run one of the following commands in a Nx workspace:

`npm install --save-dev @oasisdigital/atlassian-forge-nx-plugin`

`yarn add --dev @oasisdigital/atlassian-forge-nx-plugin`

## Generating Your Atlassian Forge Application Setup

Run the following command to add your own forge application setup to an existing frontend application:

`npx nx generate @oasisdigital/atlassian-forge-nx-plugin:app {project-name}`

Replacing the `{project-name}` with the name of your frontend application project.

## Migrating an Existing Atlassian Connect Setup to a Forge Setup

Run the following command to migrate your connect application setup to a forge application setup:

`npx nx generate @oasisdigital/atlassian-forge-nx-plugin:connect-migration {project-name}`

Replacing the `{project-name}` with the name of your frontend application project.

## Using the Forge CLI

In general you may run the forge commands with `npx forge` inside your nx workspace, though this should only be done for general purpose commands not related to a specific project (login, logout, whoami, etc...). For app specic forge cli commands please make use of this packages executors & generators.

### Forge Deploy

`npx nx forge-deploy {project-name}`

This executor will build (production by default) your project and deploy it to the atlassian servers. If you wish to adjust the build configuration you can do so by adjusting the `buildConfig` property in the options of your `project.json`.

[Feel free to read more about the usage of the command here](https://developer.atlassian.com/platform/forge/cli-reference/deploy/)

### Forge Install

`npx nx forge-install {project-name}`

This executor will install your project's forge application onto a specific site for a specific product. For example the `Jira` product on the site `****.atlassian.net`.

[Feel free to read more about the usage of the command here](https://developer.atlassian.com/platform/forge/cli-reference/install/)

> This currently doesn't support the `list` sub-command. This will be added in the future to this executor or as a secondary `forge-install-list` executor.

### Forge Uninstall

`npx nx forge-uninstall {project-name}`

This executor will uninstall your project's forge application from a specific site.

[Feel free to read more about the usage of the command here](https://developer.atlassian.com/platform/forge/cli-reference/uninstall/)

### Forge Lint

`npx nx forge-lint {project-name}`

This executor will lint your forge application to make sure you are following best practices and to make sure your manifest.yml is properly setup.

[Feel free to read more about the usage of the command here](https://developer.atlassian.com/platform/forge/cli-reference/lint/)
