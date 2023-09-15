# Atlassian Forge Nx Plugin

## Installation

Run one of the following commands in a Nx workspace:

`npm install --save-dev @oasisdigital/atlassian-forgee-nx-plugin`

`yarn add --dev @oasisdigital/atlassian-forgee-nx-plugin`

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
