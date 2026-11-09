export interface AvatarPreset {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  url: string;
}

export const BOY_AVATARS: AvatarPreset[] = [
  {
    id: 'boy_1',
    name: 'Emerald Miner',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
  {
    id: 'boy_2',
    name: 'Cyber Pioneer',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Jack&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
  {
    id: 'boy_3',
    name: 'Golden Trader',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Leo&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
  {
    id: 'boy_4',
    name: 'Urban Node',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Mason&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
  {
    id: 'boy_5',
    name: 'Cosmic Explorer',
    gender: 'boy',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Oliver&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
];

export const GIRL_AVATARS: AvatarPreset[] = [
  {
    id: 'girl_1',
    name: 'Emerald Queen',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Amaya&backgroundColor=ffd5dc,ffdfbf',
  },
  {
    id: 'girl_2',
    name: 'Cyber Innovator',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Sophia&backgroundColor=ffd5dc,ffdfbf',
  },
  {
    id: 'girl_3',
    name: 'Golden VIP',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Luna&backgroundColor=ffd5dc,ffdfbf',
  },
  {
    id: 'girl_4',
    name: 'Urban Pioneer',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Aria&backgroundColor=ffd5dc,ffdfbf',
  },
  {
    id: 'girl_5',
    name: 'Star Miner',
    gender: 'girl',
    url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Mia&backgroundColor=ffd5dc,ffdfbf',
  },
];

export const ALL_AVATARS: AvatarPreset[] = [...BOY_AVATARS, ...GIRL_AVATARS];
