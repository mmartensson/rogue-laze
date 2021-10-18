> 🛠 **Status: Early Development**
>
> This project is currently in development.

[![CI](https://github.com/mmartensson/rogue-laze/actions/workflows/snowpack.yml/badge.svg)](https://github.com/mmartensson/rogue-laze/actions)

# rogue-laze

Rogue Laze is a rogue-like that requires no player interaction at all to progress. A random seed and a starting point in time
is all that constitutes a play session and you are then welcome to have a look at how your character is doing at any time.
Watch the action live, be it light shopping in town or a slow treck through the next dungeon. Or just check in a couple of
seconds every day until the character eventually dies and the game ends - but is forever saved; at least until the next version
of the game which will invariably make use of the available pool of random numbers differently, causing another timeline to
take place.

## Getting started

### Prerequisites

- [node.js](https://nodejs.org)
- [Pixel Oddysey](https://pixelodyssey.itch.io/2500-fantasy-rpg-icons); adjustments needed for other icon sets

### Install the dependencies

    cp 'No Border/IconSet.png' images/icon-set.png
    npm install

### Start the development server

This command serves the app at `http://localhost:8080`:

    npm start

## Guides

### Build for production

This command builds an optimized version of the application for production:

    npm run build
