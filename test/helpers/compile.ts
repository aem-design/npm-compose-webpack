import webpack from 'webpack'

export default (compiler: webpack.Compiler): Promise<webpack.Stats> => {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error)
      }

      return resolve(stats)
    })
  })
}
