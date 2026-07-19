import { ASSETS } from "@/config/assets";

export const dealerProfile = {
  city: "الرياض",
  logo: ASSETS.dealers[0],
  name: "معرض الخليج للسيارات",
  status: "موثق"
} as const;

export const dashboardMetrics = [
  ["عدد السيارات الحالية", "١٢٨", "+١٢ هذا الشهر"],
  ["عدد السيارات المباعة", "٣٦", "+٨ آخر ٣٠ يوم"],
  ["إجمالي الطلبات", "٤٨٢", "+٢٤٪"],
  ["العملاء المحتملون", "٧٤", "١٨ جديد"]
] as const;

export const salesTrend = [32, 45, 38, 58, 64, 52, 76, 88, 72, 96, 110, 104] as const;
export const visitsTrend = [420, 530, 610, 580, 740, 860, 810, 940, 1020, 980, 1180, 1260] as const;

export const dashboardCars = [
  {
    addedAt: "2026-07-01",
    color: "أسود",
    fuel: "بنزين",
    gearbox: "أوتوماتيك",
    imageSrc: ASSETS.cars[0],
    model: "E300 AMG",
    name: "Mercedes E300 AMG",
    price: "٣٧٥٬٠٠٠ ريال",
    status: "نشط",
    year: "2025"
  },
  {
    addedAt: "2026-06-28",
    color: "أبيض",
    fuel: "بنزين",
    gearbox: "أوتوماتيك",
    imageSrc: ASSETS.cars[1],
    model: "LX 600",
    name: "Lexus LX 600",
    price: "٥٨٩٬٠٠٠ ريال",
    status: "نشط",
    year: "2024"
  },
  {
    addedAt: "2026-06-22",
    color: "رمادي",
    fuel: "كهرباء",
    gearbox: "أوتوماتيك",
    imageSrc: ASSETS.cars[2],
    model: "Taycan Turbo",
    name: "Porsche Taycan",
    price: "٥٢٥٬٠٠٠ ريال",
    status: "موقوف",
    year: "2025"
  },
  {
    addedAt: "2026-06-18",
    color: "أزرق",
    fuel: "بنزين",
    gearbox: "أوتوماتيك",
    imageSrc: ASSETS.cars[3],
    model: "X7 M Sport",
    name: "BMW X7",
    price: "٤٩٨٬٠٠٠ ريال",
    status: "نشط",
    year: "2024"
  },
  {
    addedAt: "2026-06-12",
    color: "فضي",
    fuel: "بنزين",
    gearbox: "أوتوماتيك",
    imageSrc: ASSETS.cars[4],
    model: "VXR",
    name: "Toyota Land Cruiser",
    price: "٣٨٥٬٠٠٠ ريال",
    status: "نشط",
    year: "2025"
  }
] as const;

export const leads = [
  ["سارة العتيبي", "+966 55 112 3344", "sarah@example.com", "2026-07-05", "Mercedes E300 AMG", "جديد"],
  ["محمد الحربي", "+966 54 551 1020", "mohammed@example.com", "2026-07-04", "Lexus LX 600", "قيد التواصل"],
  ["عبدالله القحطاني", "+966 50 234 7788", "abdullah@example.com", "2026-07-03", "BMW X7", "تم التحويل"],
  ["نورة الدوسري", "+966 56 919 8821", "noura@example.com", "2026-07-02", "Porsche Taycan", "جديد"]
] as const;

export const customers = [
  ["خالد السالم", "+966 50 123 4567", "khalid@example.com", "٢", "2026-07-01"],
  ["ريم المطيري", "+966 55 456 7788", "reem@example.com", "١", "2026-06-28"],
  ["فهد الزهراني", "+966 54 987 2211", "fahad@example.com", "٣", "2026-06-24"],
  ["هند العنزي", "+966 56 551 2299", "hind@example.com", "١", "2026-06-19"]
] as const;
