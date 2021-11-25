import { defineConfig } from 'dumi';

const BaseUrl = '/sentry-doc/'; //  => /仓库名/

export default defineConfig({
  title: 'sentry-doc',
  favicon: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config
  base: BaseUrl,
  publicPath: BaseUrl
});
