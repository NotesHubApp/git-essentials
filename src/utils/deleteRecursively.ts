import { FileSystem } from '../models/FileSystem'
import { join } from './join'

 /**
  * @param {object} args
  * @param {FileSystem} args.fs
  * @param {string} args.dirname
  */
 export async function deleteRecursively({ fs, dirname }: { fs: FileSystem, dirname: string }) {
   const filesToDelete: string[] = []
   const directoriesToDelete: string[] = []
   const pathsToTraverse = [dirname]

   while (pathsToTraverse.length > 0) {
     const path = pathsToTraverse.pop()!

     if ((await fs.stat(path)).isDirectory()) {
       directoriesToDelete.push(path)
       pathsToTraverse.push(
         ...(await fs.readdir(path))!.map(subPath => join(path, subPath))
       )
     } else {
       filesToDelete.push(path)
     }
   }

   for (const path of filesToDelete) {
     await fs.rm(path)
   }
   for (const path of directoriesToDelete.reverse()) {
     await fs.rmdir(path)
   }
 }
