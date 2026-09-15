export interface ImageNode {
  key: string
  label: string
  data?: string
  path: string
  children?: ImageNode[]
}

export interface GalleryImage {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt: string
  title: string
  durationSeconds?: number
  roundIndex?: number
}

export interface SessionRound {
  id: string
  sourceType: 'remote' | 'local'
  sourceLabel: string
  remoteNode?: ImageNode
  localImages?: GalleryImage[]
  imageCount: number
  durationSeconds: number
}

export const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.ico']

export const shuffleArray = <T>(array: T[]): T[] =>
  array.map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

export const imageByKey = (imageArray: ImageNode[], key: string): ImageNode[] =>
  imageArray.flatMap((obj) => {
    if (obj.key === key) return { ...obj, children: obj.children ?? [] }
    return obj.children ? imageByKey(obj.children, key) : []
  })

export const getRandomImagesFromNode = (
  node: ImageNode,
  getImagePath: (path: string) => string,
): GalleryImage[] => {
  const imagesForGallery: GalleryImage[] = []
  node.children?.forEach((child) => {
    if (!child.children) {
      imagesForGallery.push({
        itemImageSrc: getImagePath(child.path.replace(/\\/g, '/')),
        thumbnailImageSrc: getImagePath(child.path.replace(/\\/g, '/')),
        alt: child.data ?? '',
        title: child.label,
      })
    } else {
      imagesForGallery.push(...getRandomImagesFromNode(child, getImagePath))
    }
  })
  return shuffleArray(imagesForGallery)
}

export const resolveNodeSelection = (
  node: ImageNode,
  getImagePath: (path: string) => string,
): { type: 'tiles'; images: GalleryImage[] } | { type: 'single'; image: GalleryImage } | { type: 'empty-folder' } => {
  if (node.children) {
    const imageChildren = node.children.filter((c) =>
      imageExtensions.some((ext) => c.path.toLowerCase().endsWith(ext)),
    )
    if (imageChildren.length > 0) {
      return {
        type: 'tiles',
        images: imageChildren.map((c) => ({
          itemImageSrc: getImagePath(c.path.replace(/\\/g, '/')),
          thumbnailImageSrc: getImagePath(c.path.replace(/\\/g, '/')),
          alt: c.data ?? '',
          title: c.label,
        })),
      }
    }
    return { type: 'empty-folder' }
  }
  const formattedPath = node.path.replace(/\\/g, '/')
  return {
    type: 'single',
    image: {
      itemImageSrc: getImagePath(formattedPath),
      thumbnailImageSrc: getImagePath(formattedPath),
      alt: node.data ?? '',
      title: node.label,
    },
  }
}

export const pickWarmUpImages = (
  folderNodes: ImageNode[],
  allImages: ImageNode[],
  getImagePath: (path: string) => string,
  count = 5,
): GalleryImage[] => {
  let galleryImages: GalleryImage[] = []
  folderNodes.forEach((node) => {
    const found = imageByKey(allImages, node.key)
    if (found.length > 0) {
      galleryImages = [...galleryImages, ...getRandomImagesFromNode(found[0], getImagePath)]
    }
  })
  return shuffleArray(galleryImages).slice(0, count)
}

export const pickImagesFromFolder = (
  node: ImageNode,
  count: number,
  getImagePath: (path: string) => string,
): GalleryImage[] => getRandomImagesFromNode(node, getImagePath).slice(0, count)

export const pickImagesFromPool = (pool: GalleryImage[], count: number): GalleryImage[] =>
  shuffleArray(pool).slice(0, count)

export const buildSessionQueue = (
  rounds: SessionRound[],
  allImages: ImageNode[],
  getImagePath: (path: string) => string,
): GalleryImage[] => {
  const queue: GalleryImage[] = []
  rounds.forEach((round, roundIndex) => {
    let picked: GalleryImage[] = []
    if (round.sourceType === 'remote' && round.remoteNode) {
      const found = imageByKey(allImages, round.remoteNode.key)
      const foundNode = found[0]
      if (foundNode) {
        picked = pickImagesFromFolder(foundNode, round.imageCount, getImagePath)
      }
    } else if (round.sourceType === 'local' && round.localImages) {
      picked = pickImagesFromPool(round.localImages, round.imageCount)
    }
    picked.forEach((img) => queue.push({ ...img, durationSeconds: round.durationSeconds, roundIndex }))
  })
  return queue
}
