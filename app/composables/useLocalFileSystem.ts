interface GalleryImage {
  itemImageSrc: string
  thumbnailImageSrc: string
  alt: string
  title: string
}

const imageMediaTypes = new Set([
  'image/jpeg', 'image/png', 'image/gif',
  'image/webp', 'image/bmp', 'image/tiff',
])

let activeBlobUrls: string[] = []

async function collectImages(dirHandle: FileSystemDirectoryHandle): Promise<GalleryImage[]> {
  const images: GalleryImage[] = []

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await (entry as FileSystemFileHandle).getFile()
      if (imageMediaTypes.has(file.type)) {
        const url = URL.createObjectURL(file)
        activeBlobUrls.push(url)
        images.push({ itemImageSrc: url, thumbnailImageSrc: url, alt: file.name, title: file.name })
      }
    } else if (entry.kind === 'directory') {
      images.push(...await collectImages(entry as FileSystemDirectoryHandle))
    }
  }

  return images
}

export async function useOpenLocalFolder(): Promise<{ name: string; images: GalleryImage[] }> {
  // Revoke previous blob URLs before opening a new folder
  activeBlobUrls.forEach(url => URL.revokeObjectURL(url))
  activeBlobUrls = []

  const dirHandle = await window.showDirectoryPicker({ mode: 'read' })
  const images = await collectImages(dirHandle)
  return { name: dirHandle.name, images }
}

export function isLocalFolderSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}
