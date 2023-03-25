import fs from 'fs';
import { readdir, unlink } from 'fs/promises';
import path from 'path';

import fetch from 'node-fetch';

const IMAGE_EXT = '.png';

export const manageAvatars = async (
  { learners = [], admins = [], coaches = [] },
  avatarsPath,
) => {
  // --- make an array of all configured users, with no duplicates ---

  const localUsers = [...learners, ...admins, ...coaches].reduce(
    (all, next) =>
      all.find((user) => user.user === next.user) ? all : [...all, next],
    [],
  );

  // --- make an array of all saved avatars ---

  const savedAvatars = (await readdir(avatarsPath))
    .filter((pathName) => pathName.endsWith(IMAGE_EXT))
    .map((fileName) => path.join(avatarsPath, fileName))
    .map((filePath) => ({
      path: filePath,
      userName: filePath.split(path.sep).pop().replace(IMAGE_EXT, ''),
    }));

  // --- remove extra avatars ---

  const avatarsToRemove = savedAvatars
    .filter(
      (avatar) => !localUsers.find((user) => user.user === avatar.userName),
    )
    .map((savedAvatar) => unlink(savedAvatar.path));

  // --- fetch missing avatars ---

  const avatarsToFetch = localUsers
    .filter(
      (user) => !savedAvatars.find((avatar) => user.user === avatar.userName),
    )
    .map((toFetch) =>
      // https://chrisfrew.in/blog/saving-images-in-node-js-using-fetch-with-array-buffer-and-buffer/
      fetch(`https://github.com/${toFetch.user}.png?size=150`)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => {
          const avatarPath = path.join(avatarsPath, toFetch.user + IMAGE_EXT);
          const buffer = Buffer.from(arrayBuffer);
          fs.createWriteStream(avatarPath).write(buffer);
        }),
    );

  await Promise.all([...avatarsToRemove, ...avatarsToFetch]);
};
