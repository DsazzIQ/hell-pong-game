const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const Env = Object.freeze({
  Production: "production",
  Development: "development",
});
module.exports = (env, argv) => {
  const isProduction = argv.mode === Env.Production;

  return {
    mode: isProduction ? Env.Production : Env.Development,
    entry: "./src/index.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: `ts-loader`,
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json"),
              transpileOnly: true,
            },
          }
        }
      ]
    },
    resolve: {
      alias: {
        // Add an alias for 'matter' module
        matter: "matter-js/build/matter.js",
      },
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, "tsconfig.json"),
        }),
      ],
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [{ from: "assets", to: "assets" }],
      }),
      new HtmlWebpackPlugin({
        template: "src/index.html",
      }),
      new CompressionPlugin({
        algorithm: "gzip",
      }),
    ],
    devtool: isProduction ? "source-map" : "inline-source-map",
  };
};
