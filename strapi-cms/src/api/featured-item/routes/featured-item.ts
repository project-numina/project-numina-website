import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::featured-item.featured-item', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
