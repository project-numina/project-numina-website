import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::community-photo.community-photo', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});


