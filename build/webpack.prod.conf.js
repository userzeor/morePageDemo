const webpack = require('webpack') // 引入webpack
const path = require('path') // 引入nodejs路径模块，处理路径用的
const merge = require('webpack-merge') // 合并json配置
const CleanWebpackPlugin = require('clean-webpack-plugin') // 打包前清空指定的目录

const config = require('../config') // 引入配置项
const baseWebpackConfig = require('./webpack.base.conf') // 引入核心配置

const ProdWebpackConfig = merge(baseWebpackConfig, {
  mode:"production",
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot
  },
  plugins: [
    new CleanWebpackPlugin(['dist'],{
      root: path.resolve(__dirname, '../'),       　　　　　　　　　　//根目录
      verbose:  true,        　　　　　　　　　　//开启在控制台输出信息
      dry:      false        　　　　　　　　　　//启用删除文件
    }),
    new webpack.DefinePlugin({
      'process.env': require('../config/prod.env')
    })
  ]
})

module.exports = ProdWebpackConfig
