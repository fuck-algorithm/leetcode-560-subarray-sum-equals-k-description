const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@algorithms': path.resolve(__dirname, 'src/algorithms'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        subarraySumAlgorithms: {
          test: /[\\/]src[\\/]algorithms[\\/]subarray-sum-equals-k[\\/]/,
          name: 'subarray-sum-algorithms',
          chunks: 'async',
          minSize: 10000,
          maxSize: 250000,
          priority: 20,
        },
        visualizationComponents: {
          test: /[\\/]src[\\/]components[\\/]visualization[\\/]/,
          name: 'visualization-components',
          chunks: 'async',
          minSize: 5000,
          priority: 10,
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Subarray Sum Equals K - Algorithm Animation',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 56146,
    hot: true,
    historyApiFallback: true,
  },
};
