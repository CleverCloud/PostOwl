# PostOwl 🦉

PostOwl is an open-source web application that let's you create your own website for:

- blogging (public posts)
- sharing letters (share secret links with friends and notify them by email)
- keeping a journal or diary (private posts)

All your writing in one place!

A key feature of PostOwl is 'in-place' editing that makes it super easy and fast to update your site.

Learn more about PostOwl on the website: https://www.postowl.com

## Get your own PostOwl website

PostOwl is open-source software so you can deploy it to any web host you wish.

We'll be releasing a hosted version soon. [Join the email newsletter](https://www.postowl.com/newsletter/) to hear when it's ready.

## Get updates by email

Hear about new releases and what's going on in the PostOwl community by [joining the email newsletter](https://www.postowl.com/newsletter/).

## Developing

### Technology

PostOwl is a [SvelteKit](https://kit.svelte.dev/) application inspired by [editable.website](https://editable.website) using [SQLite](https://www.sqlite.org/) for the database. It's currently optimised for SvelteKit's [adapter-node](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) to enable [deployment to Fly.io](#deployment-to-flyio).

### Requirements

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org) (minimum 16.20.0 LTS or 18.16.0 LTS recommended) or other JavaScript runtime (not tested).
- [SQLite](https://www.sqlite.org)

### How to run PostOwl in development mode on your computer

1. Clone this repo to a directory on your computer: `git clone https://github.com/PostOwl/postowl.git`
1. Enter the directory you cloned the repo to: `cd postowl`
1. Run `npm install`
1. Rename `.env.example` to `.env` and edit for your environment
1. Create the database with `sqlite3 data/db.sqlite3 < scripts/schema.sql`
1. Run the dev server and open a new browser tab with `npm run dev -- --open`
1. Sign in with the ADMIN_PASSWORD you set in `.env`

### Exploring the database

PostOwl uses SQLite. [Beekeeper studio](https://github.com/beekeeper-studio/beekeeper-studio/releases) is an excellent app for exploring the database during development.

### Sending emails in development

PostOwl sends emails when you share a letter with friends.

In development we recommend using [mailpit](https://github.com/axllent/mailpit) to test email without sending real emails.

1. Install [mailpit](https://github.com/axllent/mailpit)
1. Make sure mailpit is running (if installed with Homebrew on macOS run `mailpit`)
1. Configure `.env` with the examples shown for mailpit in `.env.example`
1. Start the local development server with `npm run dev` - the app is now running in `dev` mode and emails can be sent without encryption
1. Use PostOwl to add a friend at http://localhost:5173/friends
1. Create and send them a letter
1. View the email they would have received in the mailpit web interface at http://localhost:8025

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Why aren't there any tests?!

We can't promise we won't add tests in the future 😉

More seriously: PostOwl is currently an early technical preview, so we've been moving fast and breaking things.

## Why is this in JavaScript not TypeScript - don't you know it's 2023?!

We like JavaScript. That doesn't mean that PostOwl might not be converted to TypeScript sometime in the future.

## Contributing

New contributors welcome! Join the [Discussions](https://github.com/PostOwl/postowl/discussions/) or submit a PR. (We have opinions about what should be included in PostOwl, so it's best to discuss with first to see if a new feature will be accepted.)

## Deploy on Clever Cloud

## What is Clever Cloud

Clever Cloud is a European cloud provider that handles all the infrastructure so developers can focus on their code. Deployments are immutable, meaning your app will restart when scaling, crashing or updating. PostOwl uses SQLite, so this tutorial explains how  to deploy PostOwl with a replicated and always updated database. At the end, you'll get:

- A deployed PostOwl app
- A really fast integrated database ❤️
- ... continuously replicated! 

For this, we are going to use [Litestream](https://litestream.io) and [Clever Cloud deployment hooks](https://www.clever-cloud.com/doc/develop/build-hooks/) and its S3-like object storage service, [Cellar](https://www.clever-cloud.com/doc/deploy/addon/cellar/).

## Requirements

- Git
- A Clever Cloud account
- [Litestream](https://litestream.io/install/) installed on your machine

## 📁 Backup your local SQLite

You'll need an object storage bucket (also called S3 storage) where you'll store your database snapshots. From the Clever Cloud Console, create an Cellar add-on: 

1. Click on **Create > an add-on**
2. Choose **Cellar**
3. Create a bucket and name it as you wish

On Cellar dashboard, check **Informations** with the environment variables you'll need in your project: 

- `CELLAR_ADDON_HOST`
- `CELLAR_ADDON_KEY_ID`
- `CELLAR_ADDON_KEY_SECRET`

Copy those values and save it somewhere safe.

Fill `litestream.yml` with these environment variables values:

Now you can run the command to replicate your SQLite database : `./litestream replicate -config litestream.yml`. 

💡I usually advise that you create a specific folder in your bucket to host the database snapshots, you can use [s3cmd CLI](https://s3tools.org/usage) or a S3 client like [Cyberduck](https://cyberduck.io) to do so. If you create a folder in your bucket, make sure to change the `path` value in your `litestream.yml`. 

Finally, add `litestream.yml` to your gitignore, and ⚠️ never commit it anywhere!

## 🛠️ Configure your PostOwl app
 
There is a `litestream.sh` file at the root of this repository that will:

- Download Litestream on Clever Cloud server
- Create a configuration file for Litestream
- Remove your database and recreate it with the last backups from your Cellar bucket

Time to deploy!

## 🚀 Deployment

Follow these steps to deploy your PostOwl app.

### 1. Declare your app

1. From Clever Cloud console, click on **Create>an application**
5. Choose your deployment method (Git or Github)
6. Choose a **NodeJS**  runtime and select your instance size (smallest one works for a small project)
7. Inject the following environment variables (use **Expert**)

```
BUCKET_DIRECTORY= "."
CC_PRE_RUN_HOOK="./litestream.sh"
CC_WORKER_COMMAND="./litestream replicate -config litestream.yml"
CC_WORKER_RESTART="always"
CC_WORKER_RESTART_DELAY="60"
CELLAR_REGION="fr-par"
DATA_DIR="data"
DB_PATH="data/db.sqlite3"
LITESTREAM_BACKUPS="."
LITESTREAM_BUCKET="<name-of-your-bucket>"
LITESTREAM_VERSION="0.3.9"
```

⚠️ If you've created a folder in your Cellar bucket, make sure to change the values of `BUCKET_DIRECTORY` and `LITESTREAM_BACKUPS`.
 
Add variables from your project's `.env` file as well. Variables will be dynamically injected on deployment.

### 2. Connect Cellar add-on

Before pushing your code, we'll connect your Cellar add-on to your app so its environment variables will be injected as well.

1. From your NodeJS app menu, click on **Service dependencies**
2. On **Link add-ons**, select your Cellar add-on

### 3. Push the code

1. From your NodeJS app menu, go to **Information**
2. Copy the deployment command
3. Paste it at the root of your project and launch it

Now your deployment has started, which you can follow from the **Logs** panel.
