const NpmInstallPlugin = require('npm-install-webpack-plugin');
const path = require('path');

module.exports = {
	entry: './src/index.jsx',
	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: '/build/',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel',
			},
		],
	},
	plugins: [
		new NpmInstallPlugin(),
	],
};
