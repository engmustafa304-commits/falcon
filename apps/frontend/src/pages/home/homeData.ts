import { ASSETS } from "@/config/assets";

export type HomeCar = {
  badge: "وسيط فالكون" | "معرض موثق";
  city: string;
  id?: string;
  imageSrc: string;
  name: string;
  price: string;
};

export const falconDirectCars: HomeCar[] = [
  {
    badge: "وسيط فالكون",
    city: "الرياض",
    imageSrc: ASSETS.cars[0],
    name: "مرسيدس S 500 2025",
    price: "٦٤٥٬٠٠٠ ريال"
  },
  {
    badge: "وسيط فالكون",
    city: "الدمام",
    imageSrc: ASSETS.cars[2],
    name: "بورشه تايكان توربو",
    price: "٥٢٥٬٠٠٠ ريال"
  },
  {
    badge: "وسيط فالكون",
    city: "الرياض",
    imageSrc: ASSETS.cars[4],
    name: "تويوتا لاندكروزر VXR",
    price: "٣٨٥٬٠٠٠ ريال"
  }
];

export const dealerCars: HomeCar[] = [
  {
    badge: "معرض موثق",
    city: "جدة",
    imageSrc: ASSETS.cars[1],
    name: "لكزس LX 600 2024",
    price: "٥٨٩٬٠٠٠ ريال"
  },
  {
    badge: "معرض موثق",
    city: "الخبر",
    imageSrc: ASSETS.cars[3],
    name: "BMW X7 M Sport",
    price: "٤٩٨٬٠٠٠ ريال"
  },
  {
    badge: "معرض موثق",
    city: "جدة",
    imageSrc: ASSETS.cars[5],
    name: "شيفروليه تاهو Premier",
    price: "٣١٢٬٠٠٠ ريال"
  }
];

export const newCars: HomeCar[] = [
  falconDirectCars[0],
  dealerCars[0],
  falconDirectCars[2]
];

export const usedCars: HomeCar[] = [
  dealerCars[1],
  falconDirectCars[1],
  dealerCars[2]
];

export const financedCars: HomeCar[] = [
  dealerCars[0],
  falconDirectCars[2],
  dealerCars[2]
];

export const specialOfferCars: HomeCar[] = [
  falconDirectCars[1],
  dealerCars[1],
  falconDirectCars[0]
];

export const latestCars: HomeCar[] = [
  dealerCars[2],
  falconDirectCars[0],
  dealerCars[0]
];

export const mostViewedCars: HomeCar[] = [
  falconDirectCars[2],
  dealerCars[1],
  falconDirectCars[1]
];

export const priceDropCars: HomeCar[] = [
  dealerCars[1],
  dealerCars[2],
  falconDirectCars[2]
];

export const brands = [
  ["Toyota", "تويوتا", ASSETS.logo.falcon],
  ["Lexus", "لكزس", ASSETS.logo.falcon],
  ["Hyundai", "هيونداي", ASSETS.logo.falcon],
  ["Kia", "كيا", ASSETS.logo.falcon],
  ["Nissan", "نيسان", ASSETS.logo.falcon],
  ["Ford", "فورد", ASSETS.logo.falcon],
  ["Mercedes", "مرسيدس", ASSETS.logo.falcon],
  ["BMW", "بي إم دبليو", ASSETS.logo.falcon],
  ["Chevrolet", "شيفروليه", ASSETS.logo.falcon],
  ["GMC", "جي إم سي", ASSETS.logo.falcon],
  ["Jeep", "جيب", ASSETS.logo.falcon],
  ["Mazda", "مازدا", ASSETS.logo.falcon]
] as const;

export const categories = [
  "سيدان",
  "SUV",
  "بيك أب",
  "رياضية",
  "كهربائية",
  "هجينة",
  "فان",
  "شاحنات"
] as const;

export const dealers = [
  {
    cars: "١٢٨ سيارة",
    city: "الرياض",
    imageSrc: ASSETS.dealers[0],
    name: "معرض النخبة للسيارات",
    rating: "4.9"
  },
  {
    cars: "٩٤ سيارة",
    city: "جدة",
    imageSrc: ASSETS.dealers[1],
    name: "دار الخليج للسيارات",
    rating: "4.8"
  },
  {
    cars: "٧٦ سيارة",
    city: "الدمام",
    imageSrc: ASSETS.dealers[2],
    name: "الشرق بريميوم موتورز",
    rating: "4.7"
  },
  {
    cars: "٦٢ سيارة",
    city: "الخبر",
    imageSrc: ASSETS.dealers[3],
    name: "أوتو لاين",
    rating: "4.8"
  }
] as const;

export const dashboardPreviews = [
  ["لوحة صاحب المعرض", ASSETS.dashboard.owner],
  ["إدارة السيارات", ASSETS.dashboard.cars],
  ["طلبات العملاء", ASSETS.dashboard.leads],
  ["الإحصائيات", ASSETS.dashboard.analytics],
  ["إعدادات المعرض", ASSETS.dashboard.profile]
] as const;
