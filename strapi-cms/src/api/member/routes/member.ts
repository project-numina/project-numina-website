import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::member.member', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});


