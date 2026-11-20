import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";

/** Soft backgrounds behind the avatar; one is picked per person */
const BACKGROUNDS = ["b3e5fc", "c8e6c9", "d1c4e9", "ffe0b2", "ffccbc", "bbdefb", "e1bee7", "f0f4c3"];

/**
 * A friendly avatar for a user, drawn in the browser so no details leave the app.
 * The same seed always gives the same picture.
 */
export const avatarFor = (seed: string) =>
  createAvatar(thumbs, { seed, backgroundColor: BACKGROUNDS, radius: 0 }).toDataUri();
