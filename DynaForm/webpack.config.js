var path = require('path')
var webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	entry: './src/main.js',
	mode: 'production',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
	},
	cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },	
	externals: {
		"bootstrap-vue": "bootstrap-vue",
		"vue": "vue"
	},
	plugins: [
		new VueLoaderPlugin(),
	],
	optimization: {
    minimize: true,
    minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
          ecma: undefined,
          parse: {},
          compress: {},
          mangle: true, // Note `mangle.properties` is `false` by default.
          module: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
        },				
			})
		],
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: [
          'vue-style-loader',
					'css-loader',
					'sass-loader',
        ],
			},      
			{
        test: /\.vue$/,
        loader: 'vue-loader',
			},
			{
        test: /\.vue$/,
        loader: 'vue-template-merge-load',
        options:{ 
            attr: 'require', 
            alias: {
                }
        }
    	},
      {
        test: /\.js$/,
        loader: 'babel-loader',
        //exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
		overlay: true,
		port: 8181
  },
  performance: {
    hints: false
  },
  devtool: 'source-map'
}

// if (process.env.NODE_ENV === 'production') {
//   module.exports.devtool = '#source-map'
//   // http://vue-loader.vuejs.org/en/workflow/production.html
//   module.exports.plugins = (module.exports.plugins || []).concat([
//     new webpack.DefinePlugin({
//       'process.env': {
//         NODE_ENV: '"production"'
//       }
//     }),
//     new webpack.optimize.UglifyJsPlugin({
//       sourceMap: true,
//       compress: {
//         warnings: false
//       }
//     }),
//     new webpack.LoaderOptionsPlugin({
//       minimize: true
//     })
//   ])
// }
