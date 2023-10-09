import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'events.js',
  plugins: [commonjs(), nodeResolve()],
  output: [
    {
      file: 'events.umd.js',
      format: 'umd',
      name: 'EventEmitter',
      exports: 'default',
      esModule: false
    },
    {
      file: 'events.umd.min.js',
      format: 'umd',
      name: 'EventEmitter',
      exports: 'default',
      plugins: [terser({ keep_fnames: true })],
      esModule: false
    }
  ]
};
export default config;
