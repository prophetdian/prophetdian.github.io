import type { BadgeId } from '../types';
import megaphoneImg from '../assets/emoji/megaphone_1f4e3.png';
import eweImg from '../assets/emoji/ewe_1f411.png';
import openBookImg from '../assets/emoji/open-book_1f4d6.png';
import latinCrossImg from '../assets/emoji/latin-cross_271d-fe0f.png';
import eyeImg from '../assets/emoji/eye_1f441-fe0f.png';

export interface Badge {
  id: BadgeId;
  name: string;
  price: number;
  description: string;
  image: string;
}

export const BADGES: Badge[] = [
  {
    id: 'evangelist',
    name: 'Evangelist',
    price: 10,
    description: 'For those called to proclaim the gospel.',
    image: megaphoneImg,
  },
  {
    id: 'pastor',
    name: 'Pastor',
    price: 10,
    description: 'For those called to shepherd and care.',
    image: eweImg,
  },
  {
    id: 'teacher',
    name: 'Teacher',
    price: 10,
    description: 'For those called to teach the word.',
    image: openBookImg,
  },
  {
    id: 'apostle',
    name: 'Apostle',
    price: 20,
    description: 'For those called to plant and build.',
    image: latinCrossImg,
  },
  {
    id: 'prophet',
    name: 'Prophet',
    price: 20,
    description: 'For those called to see and speak.',
    image: eyeImg,
  },
];

export function badgeById(id: BadgeId): Badge {
  return BADGES.find((b) => b.id === id) ?? BADGES[0];
}
