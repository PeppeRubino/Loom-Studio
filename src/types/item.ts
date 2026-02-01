export type ItemStatus = 'Ready' | 'Needs Repair' | 'Archived';

export interface ImageResource {
  url: string;
  provider: string;
  providerId?: string;
  deleteUrl?: string;
  uploadedAt?: string;
}

export interface Item {
  id: string;
  name?: string;
  category: string;
  color: string;
  season: 'Primavera' | 'Estate' | 'Autunno' | 'Inverno';
  tags: string[];
  status: ItemStatus;
  note: string;
  location?: string;
  updatedAt: string;
  image?: ImageResource;
}
