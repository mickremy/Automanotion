# Automanotion
## Why ?
This little project has for main purpose to back up the data from notion.

You can do a manual export of your Notion pages as HTML or Makdown.
See https://www.notion.so/help/back-up-your-data

But I wanted to do it automatically every day without having to worry about it.

## How ?
This application can be run directly with NodeJS or with Docker.
It requires a Notion Token v2 to run.

### Token v2
The token is a cookie stored in your browser when you are logged into notion.so.
In order to find this token, follow these steps:
* In your browser, go to www.notion.so
* Make sure to be logged in
* If you're using Google Chrome, click on the lock (🔒) in the URL bar
* Click on Cookies
* Open www.notion.so and then Cookies
* You should find a cookie named tokenv2_
* Copy the value of the token


### Node.js and NPM
Node.js and NPM needs to be installed. For windows see [How to Install Node.js and NPM on Windows](https://phoenixnap.com/kb/install-node-js-npm-on-windows)

```
npm install
TOKEN=[YOUR_TOKEN_v2] node app.mjs
```

See [environment variables](#Environment variables) section for options.

### Docker
Docker can be used to run the backup application too.

#### Docker run
``docker run -e TOKEN=[YOUR_TOKEN_v2] mremy/automanotion``

See [environment variables](#Environment variables) section for options.
```
docker run -d \
--name=automanotion \
-e TOKEN=[YOUR_TOKEN_v2] \
-e TIMEZONE=Europe/Paris \
-e LOCALE=en \
-v /your/local/path:/home/node/data:rw \
mremy/automanotion
```


#### Docker compose
You can also use the ``docker-compose`` command.

Docker compose file example :
```
version: "3.9"

services:
  automanotion:
    image: mremy/automanotion
    volumes:
      - /your/local/path:/home/node/data:rw
    environment:
      LOCALE: "en"
      TIMEZONE: "Europe/Paris"
      # EXPORT_TYPE: html or markdown
      TOKEN: [YOUR_TOKEN_v2]
```

### Environment variables
* ``TIMEZONE``: your timezone (default: Europe/Paris)
* ``LOCALE``: your language code (default: en)
* ``EXPORT_TYPE``: hmtl/markdown (if not specified both exports will be performed)


## Acknowledgements
* [ivanik7](https://github.com/ivanik7) project [notion-backup](https://github.com/ivanik7/notion-backup) which inspired this work
* Pageably on [Where do I find my token to import a Notion page?](https://pageably.com/faqs-where-do-i-find-my-page-url)
* [Artur Burtsev](https://artur-en.medium.com/) on [Automated Notion backups](https://artur-en.medium.com/automated-notion-backups-f6af4edc298d)
* Steven S. Falcon on [How To Build a Node.js Application in Docker](https://morioh.com/p/c3e99e32e846)
* [Thomas Hammoudi](https://thomashammoudi.com/) with his [Notion website](https://thomashammoudi.notion.site/) and his [YouTube channel on Notion](https://www.youtube.com/c/MouTion)