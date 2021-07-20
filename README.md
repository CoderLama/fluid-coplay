An in-sync collaborative media player built using FluidFramework

# @fluid-example/coplay

This example is a collaborative media player. We used Fluid distributed data structures to store and
synchronize the media play. We also built a website that loads and renders the Fluid Container.

## Getting Started

To run this follow the steps below:

1. Run `npm install` from the sudoku folder root
2. Run `npm run start` to start both the client and server
3. Navigate to `http://localhost:8080` in a browser tab
4. Copy full URL, including hash id, to a new tab for collaboration

## Acknowledgements

This example uses the [react-player](https://github.com/cookpete/react-player) npm package by Pete Cook
(<https://github.com/cookpete>).

## Available Scripts

### `build`

```bash
npm run build
```

Runs [`tsc`](###-tsc) and [`webpack`](###-webpack) and outputs the results in `./dist`.

### `start`

```bash
npm run start
```

Runs both [`start:client`](###-start:client) and [`start:server`](###-start:server).

### `start:client`

```bash
npm run start:all
```

Uses `webpack-dev-server` to start a local webserver that will host your webpack file.

Once you run `start` you can navigate to `http://localhost:8080` in any browser window to use your fluid example.

> The Tinylicious Fluid server must be running. See [`start:server`](###-start:server) below.

### `start:server`

```bash
npm run start:server
```

Starts an instance of the Tinylicious Fluid server running locally at `http://localhost:3000`.

> Tinylicious only needs to be running once on a machine and can support multiple examples.

### `tsc`

Compiles the TypeScript code. Output is written to the `./dist` folder.

### `webpack`

Compiles and webpacks the TypeScript code. Output is written to the `./dist` folder.


### Testing the changes

Now run `npm start` again and notice that your selected cell is now highlighted on the other side.

## Next steps

TBD
