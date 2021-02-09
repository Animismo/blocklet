# Crypto 2048

> The sample starter project used in the "Workshop: Building a blockchain game with Forge SDK and Javascript on ABT Node", which is a session from ArcBlock DevCon 2020

**For complete and working version of this game, please checkout release branch.**

## Install on my ABT Node

[![Install on my ABT Node](https://raw.githubusercontent.com/blocklet/development-guide/main/assets/install_on_abtnode.svg)](https://install.arcblock.io/?action=blocklet-install&meta_url=https%3A%2F%2Fgithub.com%2Fblocklet%2Fcrypto-2048%2Freleases%2Fdownload%2F0.8.0%2Fblocklet.json)

## Requirements

- Install `@abtnode/cli`

## Getting Started

Checkout out workshop video for details.

## Configuration

Checkout `.env` file:

```ini
SKIP_PREFLIGHT_CHECK=true
```

## Run and debug in local
```
yarn global add @abtnode/cli
git clone git@github.com:blocklet/crypto-2048.git
cd crypto-2048

<Checkout .env file>

yarn
abtnode init -f --mode debug
abtnode start
blocklet dev
```

