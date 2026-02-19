import type { CollectionConfig, FilterOptionsProps, Where } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { Page } from '@/payload-types'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
    {
      type: 'relationship',
      relationTo: 'brands',
      name: 'brand',
    },
    {
      type: 'relationship',
      relationTo: ['products', 'software'],
      name: 'product',
      admin: {
        condition: (_, siblingData) => !!siblingData.brand,
      },
      filterOptions: ({ siblingData, relationTo }: FilterOptionsProps<Page>): Where => {
        const pageData = siblingData as Page
        const brand = { equals: pageData.brand }
        if (relationTo === 'software') {
          return {
            brand,
            isDiscontinued: { equals: false },
          }
        }
        if (relationTo === 'products') {
          return {
            brand,
            stock: { greater_than: 0 },
          }
        }
        return {}
      },
    },
    {
      type: 'group',
      name: 'softwareOptions',
      admin: {
        condition: (_, siblingData) => siblingData.product?.relationTo === 'software',
      },
      fields: [
        { type: 'number', name: 'price' },
        {
          type: 'textarea',
          name: 'systemRequirements',
          admin: {
            rows: 3,
          },
        },
        {
          type: 'select',
          name: 'type',
          options: [
            { label: 'DAW', value: 'daw' },
            { label: 'Synth', value: 'synth' },
            { label: 'Pitch Correction', value: 'pitchCorrection' },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'instrumentOptions',
      admin: {
        condition: (_, siblingData) => siblingData.product?.relationTo === 'products',
      },
      fields: [
        { type: 'number', name: 'price' },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Guitar', value: 'guitar' },
            { label: 'Bass', value: 'bass' },
            { label: 'Drums', value: 'drums' },
            { label: 'Electronic Instrument', value: 'electronicInstrument' },
          ],
        },
        {
          type: 'number',
          name: 'strings',
          admin: {
            condition: (_, siblingData) =>
              siblingData.type === 'guitar' || siblingData.type === 'bass',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
