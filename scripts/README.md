This module is part of a chatbot monorepo Itboat AI Advisor. Is designed to prepare the initial data, which must be prepared in a certain way and loaded into the database. Part of the data is unloaded from another database, which is accessed via SSH. The second part of the data is obtained by parsing and processing PDF documents previously copied to the `./files` directory in this module.

At the moment, we distinguish between three types of documents received from a remote database - yacht models, shipyards and yacht categories. The workflow is designed in such a way that the script connects to a remote server via the SSH protocol, creates a tunnel and connects to the Postgres server to get the necessary data. Then the data is prepared, text templates are generated and uploaded to another Postgres database server.

The main idea is to prepare text data for building Chat GPT - embeddings. The process is divided into two main parts - preparing a database with text data and building embeddings based on them.

## 1. Installation

```
$ brew install nvm
$ nvm install node
$ npm install -g pnpm
$ pnpm install
$ pnpm --filter "*shared-db" run build
```

## 2. Basic CLI command interface

Note: It's part of the mono repo and to work with this "scripts" package, you have to go into it.

```
$ cd ./scripts
```

All commands will start with the line:

```
$ npm start --
```

To select the type of data to be processed, select - "db" or "pdf".

```
$ npm start -- db
$ npm start -- pdf
```

---

## 3. Data flow from the remote database

As a required argument, you must specify the type of data to be loaded from the remote server.
Possible values: **boat, shipyard, category**.

Following are the possible options:

- download all values from the server: **-a**
- upload using post id: **-i**
- building a summary of downloaded records: **-s**
- building embeddings based on summarized records: **-b**

### 3.1 Get and display record with entity_id 833

```
$ npm start -- db boat -i 833 -q
```

### 3.2 Insert one record to DB

Inserts a record with entity_id 833 if it does not already exist in the database.

```
$ npm start -- db boat -i 833
```

### 3.3 Inserts a record with entity_id 833 with update

```
$ npm start -- db boat -i 833 -rw
```

### 3.4 Process all records

```
$ npm start -- db boat -a
```

### 3.5 Build embeddings using Chat GPT calls

The format of the listed ids can include a range: 1-55 and a single id: 35 integer values separated by a comma. All listed values will be aggregated in such a way that if the id is included in one of the specified ranges, then it will be included in this range, and the ranges themselves will be optimized so that there are no redundant intersections. See example below.

```
$ npm start -- db boat -b 1-100,56,55,30,90-105

Going to make embeddings by range: [ { operation: 'range', numbers: [ 1, 105 ] } ]
```

You can also specify to build embeddings for all records using the **-b all** option.

```
$ npm start -- db boat -b all
```

### 3.6 Delete records from DB by query type

```
$ npm run start -- db shipyard -d
```

---

## 4. Data flow from PDF files

> Note: Before you start processing PDF files, you need to copy them to the `./files` directory within the scripts module. All subsequent commands will refer to PDF files inside this folder.

### 4.1 Display parsed file without updating DB

```
$ npm start -- pdf -f 4529_Yacht_Brokerage_16_17_Module_1_.pdf -p
```

### 4.2 Start processing a specific PDF file. Adds records only if the file does not exist in the database

```
$ npm start -- pdf -f 4529_Yacht_Brokerage_16_17_Module_1_.pdf
```

### 4.3 Start processing a specific PDF file. Adds entries, removing existing ones

```
$ npm start -- pdf -f 4529_Yacht_Brokerage_16_17_Module_1_.pdf -rw
```

### 4.4 Start processing all files from /files folder

```
$ npm start -- pdf -a
```

### 4.5 Build summary using Chat GPT calls

You can read instructions on using ranges in section 3.5.

```
$ npm start -- pdf -s 1-100,56,55,30,90-105

Going to make embeddings by range: [ { operation: 'range', numbers: [ 1, 105 ] } ]
```

### 4.6 Build embeddings using Chat GPT calls

By range:

```
$ npm start -- pdf -b 1-100
```

By filename:

```
$ npm start -- pdf -b 4529_Yacht_Brokerage_16_17_Module_1_.pdf
```

Process all records:

```
$ npm start -- pdf -b all
```

## 5. How to deploy project to remote server

- `git clone git@bitbucket.org:itboat-com/itboat-ai-advisor.git`
- Put ssh key `id_rsa` in the root folder. It will be used to connect to prod DB.
- Build the project `docker-compose up -d` and make sure that everything is all right
- Copy PDF files from local to container using `scp`, `docker cp`
- Set all empty env variables in `docker-compose.yml`
- Set variables in `.env.prod` file by folowing template

```
APP_PORT=9000
APP_URL=localhost:${APP_PORT}

DATABASE_SYNCHRONIZE=false

SSH_HOST=159.69.60.117
SSH_RSA_KEY_PATH=/app/id_rsa

SHOULD_DUMP_RAW_PDF=false
SHOULD_DUMP_PROCESSED_PDF=false

TOKENS_CHUNK_SIZE=200

NODE_ENV=production
```

- Enter the container and run all the necessary script commands from the above steps
  `docker exec -it app_container bash`

## 6. Other stuff

In order to drop whole schema you have to run from ./packages/shared-db

```
$ npm run schema:drop
```
