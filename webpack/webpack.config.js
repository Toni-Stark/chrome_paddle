const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
   mode: "production",
   entry: {
      background: path.resolve(__dirname, "..", "src", "background.js"),
      popup: path.resolve(__dirname, "..", "src", "popup/popup.js"),
      content: path.resolve(__dirname, "..", "src", "content/index.js"),
   },
   output: {
      path: path.join(__dirname, "../dist"),
      filename: "[name].js",
   },
   resolve: {
      extensions: [".ts", ".js"],
   },
   module: {
      rules: [
         {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, "css-loader"]
         }
      ],
   },
   plugins: [
      new HtmlWebpackPlugin({
         filename: "popup.html", // 生成的文件名
         template: path.resolve(__dirname, "..", "src", "popup", "popup.html"), // 原始 HTML 文件路径
         chunks: ["popup"] // 只引入 popup.js
      }),
      new MiniCssExtractPlugin({
         filename: "[name].css", // 生成 popup.css
      })
   ]
};
