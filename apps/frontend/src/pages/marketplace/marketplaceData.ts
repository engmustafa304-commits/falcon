import { ASSETS } from "@/config/assets";

export type MarketplaceCar = {
  badge: "وسيط فالكون" | "معرض موثق";
  brandSlug: string;
  categorySlug: string;
  city: string;
  falconScore: string;
  id?: string;
  imageSrc: string;
  mileage: string;
  model: string;
  name: string;
  price: string;
  year: string;
};

export const marketplaceCars: MarketplaceCar[] = [
  {
    badge: "وسيط فالكون",
    brandSlug: "mercedes",
    categorySlug: "sedan",
    city: "الرياض",
    falconScore: "9.2",
    imageSrc: ASSETS.cars[0],
    mileage: "١٢٬٠٠٠ كم",
    model: "S 500",
    name: "مرسيدس S 500",
    price: "٦٤٥٬٠٠٠ ريال",
    year: "2025"
  },
  {
    badge: "معرض موثق",
    brandSlug: "lexus",
    categorySlug: "suv",
    city: "جدة",
    falconScore: "8.9",
    imageSrc: ASSETS.cars[1],
    mileage: "٨٬٤٠٠ كم",
    model: "LX 600",
    name: "لكزس LX 600",
    price: "٥٨٩٬٠٠٠ ريال",
    year: "2024"
  },
  {
    badge: "وسيط فالكون",
    brandSlug: "porsche",
    categorySlug: "electric",
    city: "الدمام",
    falconScore: "9.4",
    imageSrc: ASSETS.cars[2],
    mileage: "٣٬١٠٠ كم",
    model: "Taycan Turbo",
    name: "بورشه تايكان توربو",
    price: "٥٢٥٬٠٠٠ ريال",
    year: "2025"
  },
  {
    badge: "معرض موثق",
    brandSlug: "bmw",
    categorySlug: "suv",
    city: "الخبر",
    falconScore: "8.7",
    imageSrc: ASSETS.cars[3],
    mileage: "١٩٬٠٠٠ كم",
    model: "X7 M Sport",
    name: "BMW X7 M Sport",
    price: "٤٩٨٬٠٠٠ ريال",
    year: "2024"
  },
  {
    badge: "وسيط فالكون",
    brandSlug: "toyota",
    categorySlug: "suv",
    city: "الرياض",
    falconScore: "9.0",
    imageSrc: ASSETS.cars[4],
    mileage: "٥٬٨٠٠ كم",
    model: "VXR",
    name: "تويوتا لاندكروزر",
    price: "٣٨٥٬٠٠٠ ريال",
    year: "2025"
  },
  {
    badge: "معرض موثق",
    brandSlug: "chevrolet",
    categorySlug: "suv",
    city: "جدة",
    falconScore: "8.5",
    imageSrc: ASSETS.cars[5],
    mileage: "٢٦٬٠٠٠ كم",
    model: "Premier",
    name: "شيفروليه تاهو",
    price: "٣١٢٬٠٠٠ ريال",
    year: "2023"
  }
];

export const marketplaceDealers = [
  {
    cars: "١٢٨ سيارة",
    city: "الرياض",
    imageSrc: ASSETS.dealers[0],
    inventory: ["جديد", "مستعمل"],
    name: "معرض النخبة للسيارات",
    rating: "4.9"
  },
  {
    cars: "٩٤ سيارة",
    city: "جدة",
    imageSrc: ASSETS.dealers[1],
    inventory: ["جديد", "مستعمل"],
    name: "دار الخليج للسيارات",
    rating: "4.8"
  },
  {
    cars: "٧٦ سيارة",
    city: "الدمام",
    imageSrc: ASSETS.dealers[2],
    inventory: ["مستعمل"],
    name: "الشرق بريميوم موتورز",
    rating: "4.7"
  },
  {
    cars: "٦٢ سيارة",
    city: "الخبر",
    imageSrc: ASSETS.dealers[3],
    inventory: ["جديد"],
    name: "أوتو لاين",
    rating: "4.8"
  }
] as const;

export const marketplaceBrands = [
  ["Toyota", "تويوتا", "/images/brands/toyota.svg"],
  ["Lexus", "لكزس", "/images/brands/lexus.svg"],
  ["Hyundai", "هيونداي", "/images/brands/hyundai.svg"],
  ["Kia", "كيا", "/images/brands/kia.svg"],
  ["Nissan", "نيسان", "/images/brands/nissan.svg"],
  ["Ford", "فورد", "/images/brands/ford.svg"],
  ["Mercedes", "مرسيدس", "/images/brands/mercedes.svg"],
  ["BMW", "بي إم دبليو", "/images/brands/bmw.svg"],
  ["Chevrolet", "شيفروليه", "/images/brands/chevrolet.svg"],
  ["GMC", "جي إم سي", "/images/brands/gmc.svg"],
  ["Jeep", "جيب", "/images/brands/jeep.svg"],
  ["Mazda", "مازدا", "/images/brands/mazda.svg"]
] as const;

export const marketplaceCategories = [
  ["سيدان", "سيارات يومية أنيقة ومريحة", "sedan", "السيارات السيدان تتميز بالراحة والاقتصادية وسهولة الاستخدام داخل المدينة والسفر اليومي."],
  ["SUV", "مساحة أكبر للعائلة والرحلات", "suv", "فئة SUV تمنح مساحة أكبر وارتفاعًا مناسبًا ومرونة للعائلات والرحلات الطويلة."],
  ["بيك أب", "عملية وقوية للاستخدام المتعدد", "pickup", "سيارات البيك أب مناسبة للأعمال والاستخدامات العملية والطرق المختلفة."],
  ["رياضية", "أداء أعلى وحضور أقوى", "sports", "السيارات الرياضية تقدم أداءً أقوى وتجربة قيادة أكثر حماسًا وحضورًا."],
  ["كهربائية", "تقنيات حديثة وتشغيل هادئ", "electric", "السيارات الكهربائية توفر قيادة هادئة وتقنيات حديثة وكفاءة عالية في التشغيل."],
  ["هجينة", "توازن بين الكفاءة والمدى", "hybrid", "السيارات الهجينة توازن بين استهلاك الوقود والمدى العملي للقيادة اليومية."],
  ["فان", "حلول عملية للعائلات والأعمال", "van", "سيارات الفان توفر مساحة ركاب أو تحميل أكبر للاستخدام العائلي أو التجاري."],
  ["شاحنات", "خيارات للأعمال والنقل", "trucks", "الشاحنات مصممة للنقل والأعمال والاحتياجات التشغيلية الثقيلة."]
] as const;
