# Analytics for Monitors
An Ionic / Hybrid app for DAFF Monitors to view information collected at landing
sites. This information is scraped from ODK 2 Aggregate.

You will find this app live at:
https://abalobi-analytics-for-monitors.herokuapp.com/

### Technical information
- This is a two part app - An **Ionic App**, and a **Node.js server** (`server.js`).
- The secrets in the server.js are pointing to variables Heroku, which store
the actual strings.
- All SQL queries to the Heroku database are stored in Server.js
- The **queries** are exposed to the Ionic app through an **HTTP request API**
- The login for the web app, as well as the API are secured by **Auth0** Authentication.

### Repo Syncing
This repo is stored in two locations.
1. [Heroku](https://dashboard.heroku.com/apps/abalobi-analytics-for-monitors)
2. [Github](https://github.com/AbalobiSA/abalobi-analytics-for-monitors)

There is a batch script (`git-push.bat`) for pushing to both of these at the same time - you will need to configure your Heroku CLI beforehand to push to Heroku.

>Note: Pushing to Heroku will INSTANTLY deploy the app and server.

### Getting Started

The dashboard for this app can be found at:
<br >https://dashboard.heroku.com/apps/abalobi-analytics-for-monitors

Clone the repo from heroku:

    $ heroku git:clone -a abalobi-analytics-for-monitors

Add the github repo as origin

    $ git remote add origin https://github.com/AbalobiSA/abalobi-analytics-for-monitors.git

You will now have two remotes:
- Heroku
- Origin
