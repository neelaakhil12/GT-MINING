export interface AvatarPreset {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  url: string;
}

export const BOY_AVATARS: AvatarPreset[] = [
  {
    id: 'boy_1',
    name: 'Alex (Cool Hoodie)',
    gender: 'boy',
    url: 'https://gtnetwork.in/avatars/boy_1.png',
  },
  {
    id: 'boy_2',
    name: 'Leo (Smart Caesar)',
    gender: 'boy',
    url: 'https://gtnetwork.in/avatars/boy_2.png',
  },
  {
    id: 'boy_3',
    name: 'Ryan (Sporty Waved)',
    gender: 'boy',
    url: 'https://gtnetwork.in/avatars/boy_3.png',
  },
];

export const GIRL_AVATARS: AvatarPreset[] = [
  {
    id: 'girl_1',
    name: 'Emma (Chic Straight)',
    gender: 'girl',
    url: 'https://gtnetwork.in/avatars/girl_1.png',
  },
  {
    id: 'girl_2',
    name: 'Mia (Bouncy Curvy)',
    gender: 'girl',
    url: 'https://gtnetwork.in/avatars/girl_2.png',
  },
  {
    id: 'girl_3',
    name: 'Chloe (Modern Bob)',
    gender: 'girl',
    url: 'https://gtnetwork.in/avatars/girl_3.png',
  },
];

export const ALL_AVATARS: AvatarPreset[] = [...BOY_AVATARS, ...GIRL_AVATARS];
