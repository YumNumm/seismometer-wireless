/** @type {import('next').NextConfig} */
import { WebPlugin } from "web-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
const nextConfig = {
  output: "export",
  webpack: (config) => {
    config.plugins.push(
      new WebPlugin({
        // file name or full path for output file, required.
        // pay attention not to duplication of name,as is will cover other file
        filename: "index.html",
        // this html's requires entry,must be an array.dependent resource will inject into html use the order entry in array.
        requires: ["A", "B"],
      })
    );
    config.plugins.push(
      new HtmlWebpackPlugin({
        inject: false,
        cache: false,
        filename: "index.html",
        favicon: "favicon.ico",
        title: "demo",
      })
    );
    return config;
  },
};

export default nextConfig;
