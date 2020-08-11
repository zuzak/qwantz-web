# qwantz-web

![Screenshot as of e36eb2cc707c5273ad79db15d89ffb0018eebec6](https://i.imgur.com/ni5prch.png)

Images from Dinosaur Comics, Copyright (c) 2003

Not an official thing, just a fan creation.

## Installation

* Install dependencies:
```sh
     $ npm install
```

*  run the app:
```sh
     $ DEBUG=qwantz-web:* npm start
```

For GPT to work, you'll need to download separately [gpt2tc](https://bellard.org/nncp/gpt2tc.html)
and place it in the `gpt` directory.

## Environment variables

| Variable      | Description                                                                                                              |
|---------------|--------------------------------------------------------------------------------------------------------------------------|
| `NODE_ENV`    | If set to `production`, will suppress things like stack traces                                                           |
| `TRUST_PROXY` | If set, treat the left-most entry in the `X-Forwarded-Header-*` as the client's IP address, instead of the "actual" one. |
| `DISABLE_GPT` | Set this to disable the GPT routes.                                                                                      |
| `PORT`        | The port the app will listen on (by default, 3000).                                                                      |

The TRUST_PROXY variable is useful when you're hosting the app behind a proxy and
you don't want the app to treat everybody as coming from the same IP address (and
getting rate-limited as a consequence).

## Transcripts

Stick a load of transcripts, one per file, in a `comics` folder in project root:

```sh
mkdir comics
echo "AN EXAMPLE COMIC

T-Rex: I HAVE OPINIONS!" > comics/example
```

Alternatively, a load of GPT-2 generated comics are available at [zuzak/qwantz-gpt](https://github.com/zuzak/qwantz-gpt).
It's linked into this repository as a submodule, so to get them run:

```sh
git submodule init
git submodule update
```

You can then pull in changes in the future with:

```sh
git submodule update
```
