> 🛠 **Status: Early Development**
>
> This project is currently in development.

# rogue-laze

Rogue Laze is a rogue-like that requires no player interaction at all to progress. A random seed and a starting point in time
is all that constitutes a play session and you are then welcome to have a look at how your character is doing, delving into
the depths of `[[insert lore here]]`.

## Getting started

### Prerequisites

- [node.js](https://nodejs.org)
- [Pixel Oddysey](https://pixelodyssey.itch.io/2500-fantasy-rpg-icons); adjustments needed for other icon sets

### Install the dependencies

    cp 'No Border/IconSet.png' images/icon-set.png
    yarn install

### Start the development server

This command serves the app at `http://localhost:8000`:

    yarn start

## Guides

### Build for production

This command use Rollup to build an optimized version of the application for production:

    yarn run build

It has two outputs: in addition to outputting a regular build, it outputs a legacy build which is compatible with older browsers down to IE11.

At runtime it is determined which version should be loaded, so that legacy browsers don't force to ship more and slower code to most users on modern browsers.

Note: If you need to add static files to the build, like the `images` folder or the `manifest.webmanifest`, you should register them in the `copy()` plugin of the `rollup.config.js`.
