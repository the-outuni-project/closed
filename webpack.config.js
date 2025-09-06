'use strict';

import fs from 'fs';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const entry = {
  core: [ './assets/index.js', './assets/index.scss'],
};

// Dynamically load all .njk files from the pages directory
// and include their corresponding .data.json file
const pageEntries = () => {
  const entries = {};
  const pagesDir = path.join(__dirname, 'pages');
  const files =  fs.readdirSync(pagesDir);

  files.forEach(file => {
    if (file.endsWith('.njk')) {
      const filenameWithoutExt = path.basename(file, '.njk');
      entries[filenameWithoutExt] = {
        import: `pages/${file}`,
        data: `pages/${filenameWithoutExt}.data.json`
      };
    }
  });

  return entries;
}

const plugins = [
  new MiniCssExtractPlugin({
    filename: 'dist/[name].css',
  }),
  new HtmlBundlerPlugin({
    entry: pageEntries(),
    outputPath: resolve(__dirname, 'wwwroot'),
    preprocessor: 'nunjucks',
    minify: {
      removeComments: true,
    }
  })
];

const moduleConfig = {
  rules: [
    {
      test: /\.js$/,
      include: resolve(__dirname, 'assets'),
      use: 'babel-loader',
    },
    {
      test: /\.s?css$/,
      include: resolve(__dirname, 'assets'),
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader'
      ]
    },
    {
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'images/[name][ext][query]'
      }
    },
    {
      test: /\.(woff2?|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'fonts/[name][ext][query]'
      }
    }
  ]
};

export default {
  mode: 'production',
  entry,
  plugins,
  output: {
    path: resolve(__dirname, 'wwwroot'),
    filename: 'dist/[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.js', '.scss', '.css', '.njk']
  },
  devtool: 'source-map',
  module: moduleConfig
};
