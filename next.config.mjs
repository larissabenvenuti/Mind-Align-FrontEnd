// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: 'D:\\Estudos\\Projetos\\Projs-pessoais\\mind-align-app\\frontend'
  },
  sassOptions: {
    silenceDeprecations: ['import', 'global-builtin'],
  }
};

export default nextConfig;