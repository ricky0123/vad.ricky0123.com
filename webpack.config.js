const CopyPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              ["@babel/preset-typescript"],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "./lib/highlight.js/highlight.min.js", to: "[name][ext]" },
        { from: "./lib/highlight.js/styles/base16/3024.min.css", to: "highlight.css" },
        {
          from: "src/index.html",
          to: "[name][ext]",
        },
        {
          from: "node_modules/@ricky0123/vad/dist/*.worklet.js",
          to: "[name][ext]",
        },
        {
          from: "node_modules/@ricky0123/vad/dist/*.onnx",
          to: "[name][ext]",
        },

        { from: "node_modules/onnxruntime-web/dist/*.wasm", to: "[name][ext]" },
        { from: "static/*", to: "static/[name][ext]" },
      ],
    }),
  ],
  output: {
    clean: true,
  },
}
