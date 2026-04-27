import { describe, it, expect, vi } from 'vitest'
import {
  shuffleArray,
  imageByKey,
  imageExtensions,
  getRandomImagesFromNode,
  resolveNodeSelection,
  pickWarmUpImages,
  type ImageNode,
  type GalleryImage,
} from '../../app/utils/gestureTimerUtils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const identity = (path: string) => path

const makeLeaf = (key: string, path: string, label = key, data?: string): ImageNode =>
  ({ key, label, path, data })

const makeFolder = (key: string, label: string, children: ImageNode[]): ImageNode =>
  ({ key, label, path: label, children })

// ─── shuffleArray ─────────────────────────────────────────────────────────────

describe('shuffleArray', () => {
  it('returns an array with the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input)
    expect(result).toHaveLength(input.length)
    expect(result.sort()).toEqual([...input].sort())
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3]
    const copy = [...input]
    shuffleArray(input)
    expect(input).toEqual(copy)
  })

  it('returns an empty array when given an empty array', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('returns a single-element array unchanged', () => {
    expect(shuffleArray(['only'])).toEqual(['only'])
  })

  it('works with objects', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = shuffleArray(input)
    expect(result).toHaveLength(3)
    expect(result.map(o => o.id).sort()).toEqual([1, 2, 3])
  })
})

// ─── imageByKey ───────────────────────────────────────────────────────────────

describe('imageByKey', () => {
  it('finds a node at the root level', () => {
    const nodes: ImageNode[] = [makeLeaf('a', '/a'), makeLeaf('b', '/b')]
    const result = imageByKey(nodes, 'a')
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('a')
  })

  it('finds a node nested inside children', () => {
    const nodes: ImageNode[] = [
      makeFolder('root', 'root', [
        makeFolder('child', 'child', [
          makeLeaf('deep', '/deep'),
        ]),
      ]),
    ]
    const result = imageByKey(nodes, 'deep')
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('deep')
  })

  it('returns an empty array when the key is not found', () => {
    const nodes: ImageNode[] = [makeLeaf('a', '/a'), makeLeaf('b', '/b')]
    expect(imageByKey(nodes, 'missing')).toEqual([])
  })

  it('returns an empty array when given an empty array', () => {
    expect(imageByKey([], 'any')).toEqual([])
  })

  it('fills in an empty children array when the matched node has no children', () => {
    const nodes: ImageNode[] = [makeLeaf('a', '/a')]
    const result = imageByKey(nodes, 'a')
    expect(result[0].children).toEqual([])
  })

  it('preserves existing children on the matched node', () => {
    const child = makeLeaf('c', '/c')
    const nodes: ImageNode[] = [makeFolder('parent', 'parent', [child])]
    const result = imageByKey(nodes, 'parent')
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children![0].key).toBe('c')
  })

  it('handles multiple root nodes and returns the correct one', () => {
    const nodes: ImageNode[] = [makeLeaf('x', '/x'), makeLeaf('y', '/y'), makeLeaf('z', '/z')]
    const result = imageByKey(nodes, 'y')
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('y')
  })
})

// ─── imageExtensions ──────────────────────────────────────────────────────────

describe('imageExtensions', () => {
  it('includes common image formats', () => {
    for (const ext of ['.jpg', '.jpeg', '.png', '.gif', '.webp']) {
      expect(imageExtensions).toContain(ext)
    }
  })
})

// ─── getRandomImagesFromNode ──────────────────────────────────────────────────

describe('getRandomImagesFromNode', () => {
  it('converts leaf children into GalleryImage objects', () => {
    const node = makeFolder('folder', 'Folder', [
      makeLeaf('img1', '/images/cat.jpg', 'Cat', 'A cat'),
      makeLeaf('img2', '/images/dog.png', 'Dog', 'A dog'),
    ])
    const result = getRandomImagesFromNode(node, identity)
    expect(result).toHaveLength(2)
    const titles = result.map(r => r.title).sort()
    expect(titles).toEqual(['Cat', 'Dog'])
  })

  it('sets alt from data, defaulting to empty string when data is absent', () => {
    const node = makeFolder('f', 'F', [
      makeLeaf('a', '/a.jpg', 'A', 'alt text'),
      makeLeaf('b', '/b.jpg', 'B'),
    ])
    const result = getRandomImagesFromNode(node, identity)
    const byTitle = Object.fromEntries(result.map(r => [r.title, r]))
    expect(byTitle['A'].alt).toBe('alt text')
    expect(byTitle['B'].alt).toBe('')
  })

  it('passes the path through getImagePath', () => {
    const getImagePath = vi.fn((p: string) => `https://cdn.example.com${p}`)
    const node = makeFolder('f', 'F', [makeLeaf('img', '/photo.jpg', 'Photo')])
    const result = getRandomImagesFromNode(node, getImagePath)
    expect(getImagePath).toHaveBeenCalledWith('/photo.jpg')
    expect(result[0].itemImageSrc).toBe('https://cdn.example.com/photo.jpg')
    expect(result[0].thumbnailImageSrc).toBe('https://cdn.example.com/photo.jpg')
  })

  it('normalizes backslashes in paths before calling getImagePath', () => {
    const getImagePath = vi.fn(identity)
    const node = makeFolder('f', 'F', [makeLeaf('img', 'images\\photo.jpg', 'Photo')])
    getRandomImagesFromNode(node, getImagePath)
    expect(getImagePath).toHaveBeenCalledWith('images/photo.jpg')
  })

  it('recursively collects images from nested folder children', () => {
    const node = makeFolder('root', 'Root', [
      makeFolder('sub', 'Sub', [
        makeLeaf('deep1', '/a.jpg', 'A'),
        makeLeaf('deep2', '/b.jpg', 'B'),
      ]),
    ])
    const result = getRandomImagesFromNode(node, identity)
    expect(result).toHaveLength(2)
  })

  it('returns an empty array for a node with no children', () => {
    const node = makeFolder('empty', 'Empty', [])
    expect(getRandomImagesFromNode(node, identity)).toEqual([])
  })
})

// ─── resolveNodeSelection ─────────────────────────────────────────────────────

describe('resolveNodeSelection', () => {
  it('returns type "tiles" when a folder contains image files', () => {
    const node = makeFolder('f', 'Folder', [
      makeLeaf('img1', '/a.jpg', 'A'),
      makeLeaf('img2', '/b.png', 'B'),
    ])
    const result = resolveNodeSelection(node, identity)
    expect(result.type).toBe('tiles')
    if (result.type === 'tiles') {
      expect(result.images).toHaveLength(2)
      expect(result.images[0].itemImageSrc).toBe('/a.jpg')
    }
  })

  it('returns type "single" for a leaf node (no children)', () => {
    const node = makeLeaf('img', '/photo.jpg', 'Photo', 'A photo')
    const result = resolveNodeSelection(node, identity)
    expect(result.type).toBe('single')
    if (result.type === 'single') {
      expect(result.image.itemImageSrc).toBe('/photo.jpg')
      expect(result.image.alt).toBe('A photo')
      expect(result.image.title).toBe('Photo')
    }
  })

  it('returns type "empty-folder" when folder children have no image extensions', () => {
    const node = makeFolder('f', 'Folder', [
      makeLeaf('doc', '/readme.txt', 'Readme'),
      makeLeaf('pdf', '/manual.pdf', 'Manual'),
    ])
    const result = resolveNodeSelection(node, identity)
    expect(result.type).toBe('empty-folder')
  })

  it('normalizes backslashes in leaf node paths', () => {
    const node = makeLeaf('img', 'images\\photo.jpg', 'Photo')
    const result = resolveNodeSelection(node, identity)
    expect(result.type).toBe('single')
    if (result.type === 'single') {
      expect(result.image.itemImageSrc).toBe('images/photo.jpg')
    }
  })

  it('normalizes backslashes in folder children paths', () => {
    const node = makeFolder('f', 'Folder', [
      makeLeaf('img', 'images\\cat.jpg', 'Cat'),
    ])
    const result = resolveNodeSelection(node, identity)
    expect(result.type).toBe('tiles')
    if (result.type === 'tiles') {
      expect(result.images[0].itemImageSrc).toBe('images/cat.jpg')
    }
  })

  it('defaults alt to empty string when data is absent on a leaf node', () => {
    const node = makeLeaf('img', '/photo.jpg', 'Photo')
    const result = resolveNodeSelection(node, identity)
    if (result.type === 'single') {
      expect(result.image.alt).toBe('')
    }
  })

  it('passes paths through getImagePath', () => {
    const getImagePath = vi.fn((p: string) => `/proxied${p}`)
    const node = makeLeaf('img', '/photo.jpg', 'Photo')
    const result = resolveNodeSelection(node, getImagePath)
    expect(getImagePath).toHaveBeenCalledWith('/photo.jpg')
    if (result.type === 'single') {
      expect(result.image.itemImageSrc).toBe('/proxied/photo.jpg')
    }
  })
})

// ─── pickWarmUpImages ─────────────────────────────────────────────────────────

describe('pickWarmUpImages', () => {
  const makeImagePool = (): ImageNode[] => [
    makeFolder('animals', 'Animals', [
      makeLeaf('cat', '/cat.jpg', 'Cat'),
      makeLeaf('dog', '/dog.jpg', 'Dog'),
      makeLeaf('fox', '/fox.jpg', 'Fox'),
    ]),
    makeFolder('landscapes', 'Landscapes', [
      makeLeaf('mtn', '/mountain.jpg', 'Mountain'),
      makeLeaf('sea', '/sea.jpg', 'Sea'),
      makeLeaf('desert', '/desert.jpg', 'Desert'),
      makeLeaf('forest', '/forest.jpg', 'Forest'),
    ]),
  ]

  it('returns at most the default count of 5 images', () => {
    const pool = makeImagePool()
    const result = pickWarmUpImages(pool, pool, identity)
    expect(result).toHaveLength(5)
  })

  it('respects a custom count', () => {
    const pool = makeImagePool()
    const result = pickWarmUpImages(pool, pool, identity, 3)
    expect(result).toHaveLength(3)
  })

  it('combines images from multiple selected folder nodes', () => {
    const pool = makeImagePool()
    const selected = [pool[0], pool[1]] // animals + landscapes = 7 total
    const result = pickWarmUpImages(selected, pool, identity, 7)
    expect(result).toHaveLength(7)
    const srcs = result.map(r => r.itemImageSrc).sort()
    expect(srcs).toEqual(['/cat.jpg', '/desert.jpg', '/dog.jpg', '/forest.jpg', '/fox.jpg', '/mountain.jpg', '/sea.jpg'])
  })

  it('skips folder nodes not found in allImages', () => {
    const pool = makeImagePool()
    const ghost: ImageNode = makeFolder('ghost', 'Ghost', [makeLeaf('g1', '/ghost.jpg', 'Ghost')])
    const result = pickWarmUpImages([ghost], pool, identity)
    expect(result).toHaveLength(0)
  })

  it('returns fewer than count when the pool has fewer images', () => {
    const small: ImageNode[] = [
      makeFolder('tiny', 'Tiny', [makeLeaf('one', '/one.jpg', 'One')]),
    ]
    const result = pickWarmUpImages(small, small, identity, 5)
    expect(result).toHaveLength(1)
  })

  it('returns an empty array when folderNodes is empty', () => {
    const pool = makeImagePool()
    expect(pickWarmUpImages([], pool, identity)).toEqual([])
  })
})
