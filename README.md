# climem

Monitor the memory consumption of your node process via CLI

![demo](https://raw.githubusercontent.com/mcollina/climem/master/demo.gif)

## Install

```
npm install climem
npm install climem -g
```

## Usage

```
node -r climem yourapp.js &
climem climem-PID
```

You can also set `CLIMEM` env variable to set a specific location or a
TCP port:

```
CLIMEM=8999 node -r climem yourapp.js &
climem 8999 localhost
```

## Acknowledgements

climem is sponsored by [nearForm](http://nearform.com).

## License

MIT
