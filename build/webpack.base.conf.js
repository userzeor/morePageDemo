const webpack = require('webpack') // 引入webpack
const path = require('path') // 引入nodejs路径模块，处理路径用的
const glob = require('glob') // glob，这个是一个全局的模块，动态配置多页面会用得着
const HtmlWebpackPlugin = require('html-webpack-plugin') // 这个是通过html模板生成html页面的插件，动态配置多页面用得着
const MiniCssExtractPlugin = require("mini-css-extract-plugin") // 分离css，webpack4推荐的分离css的插件
const TransferWebpackPlugin = require('transfer-webpack-plugin') // 原封不动的把assets中的文件复制到dist文件夹中
const autoprefixer = require('autoprefixer') // 给css自动加浏览器兼容性前缀的插件
const utils = require('./utils')

const config = require('../config') // 引入配置项

//动态添加入口
function getEntry() {
    let entry = {}
    //读取src目录所有page入口
    glob.sync('./src/view/**/*.js').forEach(function (name) {
        let start = name.indexOf('src/') + 4
        let end = name.length - 3
        let eArr = []
        let n = name.slice(start, end)
        n = n.split('/')[1]
        eArr.push(name)
        entry[n] = eArr
    })
    return entry
}

//动态加时间戳
function stamp() {
    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()
    let h = date.getHours()
    let f = date.getMinutes()
    let s = date.getSeconds()
    if (m < 10) {
        m = "0" + m
    }
    if (d < 10) {
        d = "0" + d
    }
    if (h < 10) {
        h = "0" + h
    }
    if (f < 10) {
        f = "0" + f
    }
    if (s < 10) {
        s = "0" + s
    }
    date = y + '-' + m + '-' + d + '-' + h + '-' + f + '-' + s

    return date
}

//动态生成html
//获取html-webpack-plugin参数的方法
const getHtmlConfig = function (name, chunks) {
    return {
        template: `./src/view/${name}/${name}.html`,
        filename: `view/${name}/${name}.html`,
        inject: true,
        hash: false,
        chunks: chunks
    }
}

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: getEntry(),
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: `view/[name]/[name]-${stamp()}-[hash:4]-bundle.js`,
        publicPath: process.env.NODE_ENV === 'production'
            ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                include: /src/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env',],
                            plugins: ['@babel/transform-runtime']
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                //use:['style-loader','css-loader','postcss-loader']//css不分离写法
                //css分离写法
                use: [MiniCssExtractPlugin.loader, "css-loader", {
                    loader: "postcss-loader",
                    options: {
                        plugins: [
                            autoprefixer({
                                overrideBrowserslist: ['ie >= 8', 'Firefox >= 20', 'Safari >= 5', 'Android >= 4', 'Ios >= 6', 'last 4 version']
                            })
                        ]
                    }
                }]
            },
            {
                test: /\.scss$/,
                //use:['style-loader','css-loader','sass-loader','postcss-loader']//css不分离写法
                //css分离写法
                use: [MiniCssExtractPlugin.loader, "css-loader", {
                    loader: "postcss-loader",
                    options: {
                        plugins: [
                            autoprefixer({
                                overrideBrowserslist: ['ie >= 8', 'Firefox >= 20', 'Safari >= 5', 'Android >= 4', 'Ios >= 6', 'last 4 version']
                            })
                        ]
                    }
                }, "sass-loader"]
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader'
                }
                
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('images/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('media/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': resolve('src'),
        }
    },
    performance: {
        hints: false
    },
    //插件
    plugins: [
        new MiniCssExtractPlugin({
            filename: `view/[name]/[name]-${stamp()}-[hash:4].css`,
            publicPath: "."
        }),
        new TransferWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.dev.assetsSubDirectory
            }
        ], path.resolve(__dirname, "src"))
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                //打包公共模块
                commons: {
                    chunks: 'initial', //initial表示提取入口文件的公共部分
                    minChunks: 2, //表示提取公共部分最少的文件数
                    minSize: 0, //表示提取公共部分最小的大小
                    name: 'commons' //提取出来的文件命名
                }
            }
        }
    }
}

//配置页面
const entryObj = getEntry()
const htmlArray = []
Object.keys(entryObj).forEach(function (element) {
    htmlArray.push({
        _html: element,
        title: '',
        chunks: [element,'commons']
    })
})

//自动生成html模板
htmlArray.forEach(function (element) {
    module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)))
})
