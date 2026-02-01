type TranslateFn = (key: string, fallback?: string, vars?: Record<string, string | number>) => string;

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'");

const ALIASES: Record<string, string> = {
  // Seasons
  primavera: 'term.season.spring',
  spring: 'term.season.spring',
  '春': 'term.season.spring',
  весна: 'term.season.spring',

  estate: 'term.season.summer',
  summer: 'term.season.summer',
  '夏': 'term.season.summer',
  лето: 'term.season.summer',

  autunno: 'term.season.autumn',
  autumn: 'term.season.autumn',
  fall: 'term.season.autumn',
  '秋': 'term.season.autumn',
  осень: 'term.season.autumn',

  inverno: 'term.season.winter',
  winter: 'term.season.winter',
  '冬': 'term.season.winter',
  зима: 'term.season.winter',

  // Categories (common)
  maglietta: 'term.category.tshirt',
  tshirt: 'term.category.tshirt',
  't-shirt': 'term.category.tshirt',
  't shirt': 'term.category.tshirt',
  футболка: 'term.category.tshirt',
  'tシャツ': 'term.category.tshirt',

  camicia: 'term.category.shirt',
  shirt: 'term.category.shirt',
  рубашка: 'term.category.shirt',
  'シャツ': 'term.category.shirt',

  pantaloni: 'term.category.pants',
  pants: 'term.category.pants',
  trousers: 'term.category.pants',
  брюки: 'term.category.pants',
  'パンツ': 'term.category.pants',

  scarpe: 'term.category.shoes',
  shoes: 'term.category.shoes',
  обувь: 'term.category.shoes',
  '靴': 'term.category.shoes',

  giacca: 'term.category.jacket',
  jacket: 'term.category.jacket',
  куртка: 'term.category.jacket',
  'ジャケット': 'term.category.jacket',

  cappotto: 'term.category.coat',
  coat: 'term.category.coat',
  пальто: 'term.category.coat',
  'コート': 'term.category.coat',

  felpa: 'term.category.hoodie',
  hoodie: 'term.category.hoodie',
  sweatshirt: 'term.category.hoodie',
  худи: 'term.category.hoodie',
  'パーカー': 'term.category.hoodie',

  vestito: 'term.category.dress',
  dress: 'term.category.dress',
  платье: 'term.category.dress',
  'ワンピース': 'term.category.dress',

  gonna: 'term.category.skirt',
  skirt: 'term.category.skirt',
  юбка: 'term.category.skirt',
  'スカート': 'term.category.skirt',

  accessori: 'term.category.accessories',
  accessories: 'term.category.accessories',
  аксессуары: 'term.category.accessories',
  'アクセサリー': 'term.category.accessories',

  // Colors (common)
  nero: 'term.color.black',
  black: 'term.color.black',
  '黒': 'term.color.black',
  чёрный: 'term.color.black',
  черный: 'term.color.black',

  bianco: 'term.color.white',
  white: 'term.color.white',
  '白': 'term.color.white',
  белый: 'term.color.white',

  grigio: 'term.color.gray',
  grey: 'term.color.gray',
  gray: 'term.color.gray',
  '灰': 'term.color.gray',
  серый: 'term.color.gray',

  blu: 'term.color.blue',
  blue: 'term.color.blue',
  '青': 'term.color.blue',
  синий: 'term.color.blue',

  rosso: 'term.color.red',
  red: 'term.color.red',
  '赤': 'term.color.red',
  красный: 'term.color.red',

  verde: 'term.color.green',
  green: 'term.color.green',
  '緑': 'term.color.green',
  зелёный: 'term.color.green',
  зеленый: 'term.color.green',

  giallo: 'term.color.yellow',
  yellow: 'term.color.yellow',
  '黄': 'term.color.yellow',
  жёлтый: 'term.color.yellow',
  желтый: 'term.color.yellow',

  rosa: 'term.color.pink',
  pink: 'term.color.pink',
  'ピンク': 'term.color.pink',
  розовый: 'term.color.pink',

  viola: 'term.color.purple',
  purple: 'term.color.purple',
  '紫': 'term.color.purple',
  фиолетовый: 'term.color.purple',

  marrone: 'term.color.brown',
  brown: 'term.color.brown',
  '茶': 'term.color.brown',
  коричневый: 'term.color.brown',

  beige: 'term.color.beige',
  'ベージュ': 'term.color.beige',
  бежевый: 'term.color.beige',

  arancione: 'term.color.orange',
  orange: 'term.color.orange',
  'オレンジ': 'term.color.orange',
  оранжевый: 'term.color.orange',
};

const translateKnown = (value: string, t: TranslateFn) => {
  const key = ALIASES[normalize(value)];
  return key ? t(key, value) : value;
};

export const translateSeason = (value: string, t: TranslateFn) => translateKnown(value, t);
export const translateCategory = (value: string, t: TranslateFn) => translateKnown(value, t);
export const translateColor = (value: string, t: TranslateFn) => translateKnown(value, t);
