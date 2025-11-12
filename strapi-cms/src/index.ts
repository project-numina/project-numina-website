// import type { Core } from '@strapi/strapi';
import path from 'node:path';
import fs from 'node:fs';
import slugify from 'slugify';
import matter from 'gray-matter';

async function ensurePublicReadPermissions(strapi: any): Promise<void> {
  try {
    const rolesService = strapi.service('plugin::users-permissions.role');
    const roles = await rolesService.find();
    const publicRole = roles.find((r: any) => r.type === 'public');
    if (!publicRole) return;
    const roleId = publicRole.id;
    const perms: any = publicRole.permissions || {};

    const allow = (apiUid: string, ctrl: string) => {
      perms[apiUid] = perms[apiUid] || { controllers: {} };
      perms[apiUid].controllers[ctrl] = perms[apiUid].controllers[ctrl] || {};
      perms[apiUid].controllers[ctrl].find = true;
      perms[apiUid].controllers[ctrl].findOne = true;
    };

    allow('api::member.member', 'member');
    allow('api::project.project', 'project');
    allow('api::article.article', 'article');
    allow('api::community-photo.community-photo', 'community-photo');
    allow('api::member-tag.member-tag', 'member-tag');
    allow('api::project-tag.project-tag', 'project-tag');

    // Forcer la mise à jour complète des permissions
    await rolesService.updateRole(roleId, { permissions: perms });
    
    // Attendre un peu pour que les permissions soient appliquées
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    strapi.log.info('Public permissions updated (read-only).');
  } catch (e) {
    strapi.log.warn(`Failed to set public permissions: ${e?.message || e}`);
  }
}

async function uploadLocalFile(strapi: any, absPath: string): Promise<number | null> {
  try {
    if (!fs.existsSync(absPath)) return null;
    const fileStat = fs.statSync(absPath);
    const stream = fs.createReadStream(absPath);
    const uploadService = strapi.plugin('upload').service('upload');
    const res = await uploadService.upload({
      data: {},
      files: {
        path: absPath,
        name: path.basename(absPath),
        type: 'image/jpeg',
        size: fileStat.size,
        stream,
      },
    });
    const file = Array.isArray(res) ? res[0] : res;
    return file?.id || null;
  } catch (e) {
    strapi.log.warn(`Upload failed for ${absPath}: ${e?.message || e}`);
    return null;
  }
}

function projectRoot(): string {
  // When compiled, __dirname ≈ strapi-cms/dist/src → go three levels up to repo root
  return path.resolve(__dirname, '..', '..', '..');
}

async function seedTags(strapi: any): Promise<void> {
  const entity = strapi.entityService;
  const ensure = async (uid: string, name: string) => {
    const key = slugify(name, { lower: true, strict: true });
    const existing: any[] = await entity.findMany(uid, {
      filters: { key },
      limit: 1,
      fields: ['id', 'name', 'key'],
    });
    if (existing && existing.length > 0) return existing[0].id;
    const created = await entity.create(uid, { data: { name, key } });
    return created.id;
  };

  const memberTags = ['Active Contributor', 'Alumni', 'Founding Members', 'Scientific Advisors'];
  const projectTags = ['models', 'datasets', 'tools', 'research'];

  for (const t of memberTags) await ensure('api::member-tag.member-tag', t);
  for (const t of projectTags) await ensure('api::project-tag.project-tag', t);
  strapi.log.info('Tags seeded.');
}

async function migrateMembers(strapi: any): Promise<void> {
  const entity = strapi.entityService;
  const root = projectRoot();
  const dir = path.join(root, 'data', 'team');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = slugify(rec.name, { lower: true, strict: true });
    const existing: any[] = await entity.findMany('api::member.member', { filters: { slug }, limit: 1, fields: ['id'] });
    let imageId: number | null = null;
    if (rec.image && !String(rec.image).startsWith('http')) {
      const abs = path.resolve(root, rec.image.replace(/^\//, ''));
      imageId = await uploadLocalFile(strapi, abs);
    }
    // resolve tags
    const tagIds: number[] = [];
    if (Array.isArray(rec.tags)) {
      for (const t of rec.tags) {
        const found: any[] = await entity.findMany('api::member-tag.member-tag', { filters: { name: t }, limit: 1, fields: ['id'] });
        if (found?.[0]?.id) {
          tagIds.push(found[0].id);
          strapi.log.info(`Linked tag "${t}" to member "${rec.name}"`);
        } else {
          strapi.log.warn(`Tag "${t}" not found for member "${rec.name}"`);
        }
      }
    }
    const data: any = { name: rec.name, slug, url: rec.url || null, publishedAt: new Date().toISOString() };
    if (imageId) data.image = imageId;
    
    let memberId: number;
    if (existing && existing.length > 0) {
      await entity.update('api::member.member', existing[0].id, { data });
      memberId = existing[0].id;
    } else {
      const created = await entity.create('api::member.member', { data });
      memberId = created.id;
    }
    
    // Établir les relations tags après création/mise à jour
    if (tagIds.length > 0) {
      strapi.log.info(`Setting ${tagIds.length} tags for member "${rec.name}"`);
      await entity.update('api::member.member', memberId, {
        data: { member_tags: tagIds }
      });
    }
  }
  strapi.log.info('Members migrated.');
}

async function migrateProjects(strapi: any): Promise<void> {
  const entity = strapi.entityService;
  const root = projectRoot();
  const dir = path.join(root, 'data', 'projects');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const slug = slugify(rec.title, { lower: true, strict: true });
    const existing: any[] = await entity.findMany('api::project.project', { filters: { slug }, limit: 1, fields: ['id'] });
    let imageId: number | null = null;
    if (rec.image && !String(rec.image).startsWith('http')) {
      const abs = path.resolve(root, rec.image.replace(/^\//, ''));
      imageId = await uploadLocalFile(strapi, abs);
    }
    const tagIds: number[] = [];
    if (Array.isArray(rec.tags)) {
      for (const t of rec.tags) {
        const found: any[] = await entity.findMany('api::project-tag.project-tag', { filters: { name: t }, limit: 1, fields: ['id'] });
        if (found?.[0]?.id) tagIds.push(found[0].id);
      }
    }
    const data: any = {
      title: rec.title,
      slug,
      status: rec.status || null,
      description: rec.description || '',
      highlight: !!rec.highlight,
      published: rec.published || 'draft',
      ctas: Array.isArray(rec.ctas) ? rec.ctas.map((c: any) => ({ text: c.text, url: c.url, type: c.type || 'primary' })) : [],
    };
    // Publier seulement les projets marqués "published"
    if ((rec.published || '').toLowerCase() === 'published') {
      data.publishedAt = new Date().toISOString();
    } else {
      data.publishedAt = null;
    }
    if (imageId) data.image = imageId;
    
    let projectId: number;
    if (existing && existing.length > 0) {
      await entity.update('api::project.project', existing[0].id, { data });
      projectId = existing[0].id;
    } else {
      const created = await entity.create('api::project.project', { data });
      projectId = created.id;
    }
    
    // Établir les relations tags après création/mise à jour
    if (tagIds.length > 0) {
      await entity.update('api::project.project', projectId, {
        data: { project_tags: tagIds }
      });
    }
  }
  strapi.log.info('Projects migrated.');
}

async function migrateArticles(strapi: any): Promise<void> {
  const entity = strapi.entityService;
  const root = projectRoot();
  const dir = path.join(root, 'posts');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data: fm, content } = matter(raw);
    const base = path.basename(f, path.extname(f));
    const slug = slugify(fm?.title || base, { lower: true, strict: true });
    const existing: any[] = await entity.findMany('api::article.article', { filters: { slug }, limit: 1, fields: ['id'] });
    let imageId: number | null = null;
    const fmImage = fm?.image as string | undefined;
    if (fmImage && !fmImage.startsWith('http')) {
      const fixed = fmImage.replace(/^\/assets\//i, 'Assets/');
      const abs = path.resolve(root, fixed.replace(/^\//, ''));
      imageId = await uploadLocalFile(strapi, abs);
    }
    const ctas = Array.isArray(fm?.ctas) ? fm.ctas.map((c: any) => ({ text: c.text, url: c.url, type: c.type || 'primary' })) : [];
    const data: any = {
      title: fm?.title || base,
      slug,
      date: fm?.date || null,
      body: content || '',
      status: fm?.status || 'brouillon',
      ctas,
    };
    // Publier si statut "publié"
    if ((fm?.status || '').toLowerCase() === 'publié') {
      data.publishedAt = new Date().toISOString();
    } else {
      data.publishedAt = null;
    }
    if (imageId) data.image = imageId;
    if (existing && existing.length > 0) {
      await entity.update('api::article.article', existing[0].id, { data });
    } else {
      await entity.create('api::article.article', { data });
    }
  }
  strapi.log.info('Articles migrated.');
}

async function migrateCommunityPhotos(strapi: any): Promise<void> {
  const entity = strapi.entityService;
  const root = projectRoot();
  const dir = path.join(root, 'data', 'photos_community');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const title = rec.title;
    const existing: any[] = await entity.findMany('api::community-photo.community-photo', { filters: { title }, limit: 1, fields: ['id'] });
    let imageId: number | null = null;
    if (rec.image && !String(rec.image).startsWith('http')) {
      const abs = path.resolve(root, rec.image.replace(/^\//, ''));
      imageId = await uploadLocalFile(strapi, abs);
    }
    const data: any = { title, description: rec.description || '', publishedAt: new Date().toISOString() };
    if (imageId) data.image = imageId;
    if (existing && existing.length > 0) {
      await entity.update('api::community-photo.community-photo', existing[0].id, { data });
    } else {
      await entity.create('api::community-photo.community-photo', { data });
    }
  }
  strapi.log.info('Community photos migrated.');
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: any }) {
    // Optionnel: migration automatique si demandé
    if (process.env.MIGRATE_ON_BOOT === '1') {
      try {
        const membersCount = await strapi.entityService.count('api::member.member');
        const force = process.env.MIGRATE_FORCE === '1';
        if (!force && membersCount > 0) {
          strapi.log.info('Migration skipped (data already present).');
        } else {
          await seedTags(strapi);
          await migrateMembers(strapi);
          await migrateProjects(strapi);
          await migrateArticles(strapi);
          await migrateCommunityPhotos(strapi);
          const mc = await strapi.entityService.count('api::member.member');
          const pc = await strapi.entityService.count('api::project.project');
          const ac = await strapi.entityService.count('api::article.article');
          const cc = await strapi.entityService.count('api::community-photo.community-photo');
          strapi.log.info(`✅ Migration completed. Members=${mc} Projects=${pc} Articles=${ac} CommunityPhotos=${cc}`);
        }
      } catch (e) {
        strapi.log.error(`Migration failed: ${e?.message || e}`);
      }
    }
    await ensurePublicReadPermissions(strapi);
  },
};
