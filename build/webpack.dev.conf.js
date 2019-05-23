const webpack = require('webpack') // 引入webpack
const utils = require('./utils')
const path = require('path') // 引入nodejs路径模块，处理路径用的
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin') // 网页端报错信息
const merge = require('webpack-merge') // 合并json配置
const os = require('os') // 这个nodejs模块，会帮助我们获取本机ip
const portfinder = require('portfinder') // 这个帮助我们寻找可用的端口，如果默认端口被占用了的话
const fs = require('fs') // 处理文件用的

const config = require('../config') // 引入配置项
const baseWebpackConfig = require('./webpack.base.conf') // 引入核心配置

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
    mode: 'development',
    devServer:{
        clientLogLevel: 'warning',
        // historyApiFallback: true,
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'html/index/index.html') },
            ],
        },
        hot: true,
        //设置基本目录结构
        contentBase: path.join(__dirname, 'dist'),
        //此路径下的打包文件可在浏览器中访问。
        //服务端压缩是否开启
        compress: true,
        //服务器的IP地址，可以使用IP也可以使用localhost
        host: HOST || config.dev.host,
        //配置服务端口号
        port: PORT || config.dev.port,
        open: config.dev.autoOpenBrowser,
        overlay: config.dev.errorOverlay
            ? { warnings: false, errors: true }
            : false,
        publicPath: config.dev.assetsPublicPath,
        proxy: config.dev.proxyTable,
        quiet: true, // necessary for FriendlyErrorsPlugin
        watchOptions: {
            poll: config.dev.poll,
        }
    },
    plugins: [
        new webpack.DefinePlugin({
          'process.env': require('../config/dev.env')
        })
    ]
})

module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err)
        } else {
            // publish the new Port, necessary for e2e tests
            process.env.PORT = port
            // add port to devServer config
            devWebpackConfig.devServer.port = port

            // Add FriendlyErrorsPlugin
            devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
                compilationSuccessInfo: {
                    messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
                },
                onErrors: config.dev.notifyOnErrors
                    ? utils.createNotifierCallback()
                    : undefined
            }))

            resolve(devWebpackConfig)
        }
    })
})

/*
 如果遇到问题，导航到 /webpack-dev-server 路径，可以显示出文件的服务位置。 例如，http://localhost:9000/webpack-dev-server。
*/
