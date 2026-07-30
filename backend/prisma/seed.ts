import { PrismaClient, UserRole, Permission } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'AdminPass123!',
    10,
  );
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@nutrizaria.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@nutrizaria.com',
      password: adminPassword,
      name: 'Admin',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });
  console.log('Admin user created');

  const categories = [
    { name: 'Vegetables', slug: 'vegetables', image: 'tomato.avif', sortOrder: 1 },
    { name: 'Spice', slug: 'spice', image: 'spices2.avif', sortOrder: 2 },
    { name: 'Meat', slug: 'meat', image: 'meat.avif', sortOrder: 3 },
    { name: 'Fish', slug: 'fish', image: 'salmon.avif', sortOrder: 4 },
    { name: 'Oil', slug: 'oil', image: 'olive-oil.avif', sortOrder: 5 },
    { name: 'Nuts', slug: 'nuts', image: 'nuts2.avif', sortOrder: 6 },
    { name: 'Fruit', slug: 'fruit', image: 'fruit2.avif', sortOrder: 7 },
    { name: 'Cheese', slug: 'cheese', image: 'cheese2.avif', sortOrder: 8 },
    { name: 'Dates', slug: 'dates', image: 'dates2.avif', sortOrder: 9 },
    { name: 'Dry Food', slug: 'dry-food', image: 'nuts2.avif', sortOrder: 10 },
    { name: 'Juice', slug: 'juice', image: 'fruit2.avif', sortOrder: 11 },
    { name: 'Honey', slug: 'honey', image: 'honey2.avif', sortOrder: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`${categories.length} categories created`);

  const products = [
    { name: 'Premium Dates', slug: 'premium-dates', image: 'dates.avif', categorySlug: 'dates', price: 1400, description: 'খেজুরে ফাইবার, ভিটামিন বি এবং আয়রন থাকে। এটি হজম শক্তি বাড়ায় এবং দ্রুত শক্তির উত্স হিসেবে কাজ করে।', unit: '1 kg', benefits: ['খেজুর হল একটি জনপ্রিয় ফল, যা প্রধানত মরুভূমি অঞ্চলে উৎপন্ন হয়।', 'খেজুরের মধ্যে প্রচুর পরিমাণে ফাইবার থাকে, যা হজমের সমস্যায় সাহায্য করে।', 'খেজুর রক্তে শর্করার মাত্রা নিয়ন্ত্রণে রাখতে সাহায্য করে।', 'এটি প্রাকৃতিক চিনির উৎস, তাই শরীরকে তাৎক্ষণিক শক্তি প্রদান করে।', 'খেজুরে উপস্থিত পটাশিয়াম হৃদযন্ত্রের স্বাস্থ্য ভালো রাখতে সহায়ক।'] },
    { name: 'Regular Nut', slug: 'regular-nut', image: 'regular-nut.avif', categorySlug: 'nuts', price: 240, description: 'বাদাম প্রোটিন, ফাইবার এবং স্বাস্থ্যকর চর্বিতে সমৃদ্ধ।', unit: '1 kg', benefits: ['বাদাম নিয়মিত খেলে শরীরে প্রাকৃতিক চর্বি ও প্রোটিন সরবরাহ হয়।', 'বাদামে থাকা অ্যান্টিঅক্সিডেন্ট দেহের রোগ প্রতিরোধ ক্ষমতা বাড়ায়।', 'বাদাম ওমেগা-৩ ফ্যাটি অ্যাসিড সমৃদ্ধ, যা হৃদরোগ প্রতিরোধ করতে সাহায্য করে।'] },
    { name: 'Premium Cheese', slug: 'premium-cheese', image: 'cheese.avif', categorySlug: 'cheese', price: 890, description: 'চিজ প্রোটিন এবং ক্যালসিয়ামে সমৃদ্ধ, যা হাড়ের স্বাস্থ্য ও মাংসপেশীর জন্য উপকারী।', unit: '500g', benefits: ['চিজ ক্যালসিয়াম সমৃদ্ধ, যা হাড় ও দাঁতের মজবুতি বাড়ায়।', 'চিজে থাকা প্রোটিন শরীরের পেশি গঠনে গুরুত্বপূর্ণ ভূমিকা পালন করে।'] },
    { name: 'Cashew Nut', slug: 'cashew-nut', image: 'cashew.avif', categorySlug: 'nuts', price: 1600, description: 'কাজু বাদামে প্রচুর পরিমাণে ভিটামিন কে, আয়রন এবং ম্যাগনেসিয়াম থাকে।', unit: '700g', benefits: ['কাজু বাদাম খেলে শরীরে প্রোটিন ও স্বাস্থ্যকর ফ্যাট সরবরাহ হয়।', 'কাজু বাদামে থাকা ম্যাগনেসিয়াম এবং ক্যালসিয়াম হাড় ও দাঁতের মজবুতি বজায় রাখে।'] },
    { name: 'Olive Oil', slug: 'olive-oil', image: 'olive-oil.avif', categorySlug: 'oil', price: 1000, description: 'জলপাই তেল মনো-আনস্যাচুরেটেড চর্বিতে সমৃদ্ধ, যা হৃদয়ের স্বাস্থ্য রক্ষায় সহায়ক।', unit: '900ml', benefits: ['অলিভ তেল হৃদযন্ত্রের জন্য খুবই উপকারী।', 'অলিভ তেল অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ।'] },
    { name: 'Chili Powder', slug: 'chili-powder', image: 'chili.avif', categorySlug: 'spice', price: 670, description: 'মরিচ গুঁড়া বিপাকক্রিয়া বৃদ্ধি করে এবং ওজন কমাতে সহায়তা করে।', unit: '950gm', benefits: ['পাচনতন্ত্রের উন্নতি করে।', 'ওজন কমাতে সহায়ক।'] },
    { name: 'Pure Natural Honey', slug: 'pure-natural-honey', image: 'honey.avif', categorySlug: 'honey', price: 960, description: 'মধু প্রাকৃতিক মিষ্টি, যা অ্যান্টিব্যাকটেরিয়াল এবং অ্যান্টিঅক্সিডেন্টে সমৃদ্ধ।', unit: '800gm', benefits: ['Natural Sweetener', 'Rich in Antioxidants', 'Soothes Sore Throats'] },
    { name: 'Coriander Powder', slug: 'coriander-powder', image: 'coriander.avif', categorySlug: 'spice', price: 600, description: 'ধনিয়া গুঁড়া হজমশক্তি বৃদ্ধি করে এবং শরীর থেকে টক্সিন বের করতে সাহায্য করে।', unit: '1 kg', benefits: ['পাচনতন্ত্রের উন্নতি করে।', 'অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ।'] },
    { name: 'Premium Almond Nut', slug: 'premium-almond-nut', image: 'almond.avif', categorySlug: 'nuts', price: 1100, description: 'কাঠবাদাম ক্যালসিয়াম, ভিটামিন ই এবং অ্যান্টিঅক্সিডেন্টে সমৃদ্ধ।', unit: '1kg', benefits: ['হৃদস্বাস্থ্যের জন্য উপকারী।', 'মস্তিষ্কের উন্নতি করে।'] },
    { name: 'Natural Coconut Oil', slug: 'natural-coconut-oil', image: 'coconut-oil.avif', categorySlug: 'oil', price: 750, description: 'প্রাকৃতিক নারকেল তেল চুল এবং ত্বকের জন্য অত্যন্ত উপকারী।', unit: '1 liter', benefits: ['নারকেল তেল চুলের বৃদ্ধি বাড়ায়।', 'ত্বকের আর্দ্রতা বজায় রাখে।'] },
    { name: 'Black Seed Oil', slug: 'black-seed-oil', image: 'black-seed-oil.avif', categorySlug: 'oil', price: 1200, description: 'কালোজিরার তেল অ্যান্টিঅক্সিডেন্টে সমৃদ্ধ এবং রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করতে কার্যকর।', unit: '500ml', benefits: ['শরীরের প্রদাহ কমাতে সহায়ক।', 'রোগ প্রতিরোধ ক্ষমতা বাড়ায়।'] },
    { name: 'Whole Cloves', slug: 'whole-cloves', image: 'cloves.avif', categorySlug: 'spice', price: 450, description: 'লবঙ্গ এক প্রাচীন মশলা, যা হজম এবং সংক্রমণ প্রতিরোধে সহায়ক।', unit: '250g', benefits: ['দাঁতের ব্যথা উপশমে কার্যকর।', 'পাচনতন্ত্রের উন্নতি করতে সহায়ক।'] },
    { name: 'Turmeric Powder', slug: 'turmeric-powder', image: 'turmeric.avif', categorySlug: 'spice', price: 580, description: 'হলুদের মধ্যে থাকা কারকুমিন প্রদাহ কমাতে এবং সংক্রমণ প্রতিরোধে সাহায্য করে।', unit: '1kg', benefits: ['রোগ প্রতিরোধ ক্ষমতা বাড়াতে কার্যকর।', 'ত্বকের উজ্জ্বলতা বাড়ায়।'] },
    { name: 'Organic Green Tea', slug: 'organic-green-tea', image: 'green-tea.avif', categorySlug: 'tea', price: 400, description: 'গ্রীন টি অ্যান্টিঅক্সিডেন্টে সমৃদ্ধ এবং ওজন কমাতে সহায়ক।', unit: '200g', benefits: ['বিপাকক্রিয়া বাড়িয়ে ওজন কমাতে সাহায্য করে।', 'রোগ প্রতিরোধ ক্ষমতা বাড়ায়।'] },
    { name: 'Raw Brown Sugar', slug: 'raw-brown-sugar', image: 'brown-sugar.avif', categorySlug: 'sweeteners', price: 340, description: 'কাঁচা লাল চিনি প্রাকৃতিক মিষ্টি, যা শরীরের জন্য তুলনামূলক ভালো।', unit: '1kg', benefits: ['শরীরে তৎক্ষণাৎ শক্তি যোগায়।', 'হজম প্রক্রিয়ায় সহায়ক।'] },
    { name: 'Organic Cinnamon Sticks', slug: 'organic-cinnamon-sticks', image: 'cinnamon-sticks.avif', categorySlug: 'spice', price: 580, description: 'দারুচিনি একটি প্রাচীন মশলা, যা বিপাক বৃদ্ধি ও সংক্রমণ প্রতিরোধে সহায়ক।', unit: '500g', benefits: ['ব্লাড সুগার নিয়ন্ত্রণে সহায়ক।', 'হৃদয়ের স্বাস্থ্য রক্ষা করে।'] },
    { name: 'Organic Mustard Oil', slug: 'organic-mustard-oil', image: 'mustard-oil.avif', categorySlug: 'oil', price: 620, description: 'সরিষার তেল ত্বক ও চুলের যত্নে অত্যন্ত কার্যকর এবং হৃদপিণ্ডের জন্য ভালো।', unit: '1 liter', benefits: ['ত্বক ও চুলের যত্নে ব্যবহৃত হয়।', 'হৃদপিণ্ডের জন্য উপকারী।'] },
    { name: 'Dry Figs', slug: 'dry-figs', image: 'figs.avif', categorySlug: 'dried-fruits', price: 880, description: 'শুকনো ডুমুর ফাইবার সমৃদ্ধ এবং পাচনতন্ত্রের উন্নতি ও শক্তি বৃদ্ধিতে সাহায্য করে।', unit: '1kg', benefits: ['পাচনতন্ত্রের কার্যকারিতা বাড়ায়।', 'রক্তচাপ নিয়ন্ত্রণে সহায়ক।'] },
    { name: 'Natural Peanut Butter', slug: 'natural-peanut-butter', image: 'peanut-butter.avif', categorySlug: 'spread', price: 550, description: 'পিনাট বাটার স্বাস্থ্যকর চর্বি এবং প্রোটিন সমৃদ্ধ।', unit: '250g', benefits: ['প্রোটিন সমৃদ্ধ।', 'শক্তি সরবরাহ করে।'] },
    { name: 'Premium Cashew Nuts', slug: 'premium-cashew-nuts', image: 'cashew-nuts.avif', categorySlug: 'nuts', price: 850, description: 'কাজু বাদাম ভিটামিন এবং প্রোটিনে সমৃদ্ধ।', unit: '500g', benefits: ['হার্ট হেলথ: কাজু বাদাম হৃদযন্ত্রের জন্য ভালো।', 'ত্বকের উজ্জ্বলতা বাড়ায়।'] },
    { name: 'Fresh Spinach', slug: 'fresh-spinach', image: 'fresh-spinach.avif', categorySlug: 'vegetables', price: 80, description: 'পুষ্টি সমৃদ্ধ তাজা পালং শাক, যা স্বাস্থ্যের জন্য অত্যন্ত উপকারী।', unit: '1kg', benefits: ['ভিটামিন এ এবং সি সমৃদ্ধ।', 'আয়রন সমৃদ্ধ।'] },
    { name: 'Organic Carrots', slug: 'organic-carrots', image: 'organic-carrots.avif', categorySlug: 'vegetables', price: 120, description: 'জৈবভাবে চাষ করা গাজর, যা স্বাদে মিষ্টি এবং পুষ্টি সমৃদ্ধ।', unit: '1kg', benefits: ['ভিটামিন এ সমৃদ্ধ।', 'প্রাকৃতিক মিষ্টি।'] },
    { name: 'Fresh Chicken Breast', slug: 'fresh-chicken-breast', image: 'chicken.avif', categorySlug: 'meat', price: 450, description: 'তাজা চিকেন ব্রেস্ট প্রোটিন এবং লো-ফ্যাটে সমৃদ্ধ।', unit: '1kg', benefits: ['প্রোটিন সমৃদ্ধ।', 'লো-ফ্যাট।'] },
    { name: 'Fresh Fish Fillets', slug: 'fresh-fish-fillets', image: 'salmon.avif', categorySlug: 'fish', price: 650, description: 'তাজা মাছের ফিলেট ওমেগা-৩ ফ্যাটি অ্যাসিডে সমৃদ্ধ।', unit: '1kg', benefits: ['হার্ট হেলথ: ওমেগা-৩ হৃদরোগের ঝুঁকি কমায়।', 'প্রোটিন সমৃদ্ধ।'] },
    { name: 'Ajwa Dates', slug: 'ajwa-dates', image: 'ajwa-dates.avif', categorySlug: 'dates', price: 800, description: 'আজওয়া খেজুর, যা পবিত্র ও পুষ্টিকর খাদ্য হিসেবে পরিচিত।', unit: '1kg', benefits: ['পটাশিয়াম এবং আয়রন সমৃদ্ধ।', 'প্রাকৃতিক শক্তির উৎস।'] },
    { name: 'Medjool Dates', slug: 'medjool-dates', image: 'medjool-dates.avif', categorySlug: 'dates', price: 1200, description: 'মেডজুল খেজুর, যা মিষ্টি এবং উচ্চ পুষ্টিগুণে ভরপুর।', unit: '1kg', benefits: ['প্রাকৃতিক চিনি এবং ফাইবার সমৃদ্ধ।', 'এনার্জি বুস্টার।'] },
    { name: 'Wildflower Honey', slug: 'wildflower-honey', image: 'wildflower-honey.avif', categorySlug: 'honey', price: 850, description: 'বুনো ফুলের গন্ধযুক্ত মধু, যা ফুলের প্রাকৃতিক স্বাদ এবং সুগন্ধ প্রদান করে।', unit: '500g', benefits: ['ইমিউন বুস্টার।', 'প্রাকৃতিক মিষ্টি।'] },
    { name: 'Fresh Mozzarella Cheese', slug: 'fresh-mozzarella-cheese', image: 'mozzarella-cheese.avif', categorySlug: 'cheese', price: 500, description: 'তাজা মোজারেলা চিজ, যা পিৎজা, পাস্তা, এবং সালাদের জন্য আদর্শ।', unit: '250g', benefits: ['উচ্চ ক্যালসিয়াম।', 'প্রোটিন সমৃদ্ধ।'] },
    { name: 'Fresh Orange Juice', slug: 'fresh-orange-juice', image: 'orange-juice.avif', categorySlug: 'juice', price: 150, description: 'তাজা কমলার রস, যা ভিটামিন সি সমৃদ্ধ এবং দেহকে চাঙ্গা রাখে।', unit: '1L', benefits: ['ভিটামিন সি সমৃদ্ধ।', 'প্রাকৃতিক হাইড্রেটর।'] },
    { name: 'Fresh Apples', slug: 'fresh-apples', image: 'apples.avif', categorySlug: 'fruit', price: 150, description: 'তাজা আপেল, যা স্বাদ এবং পুষ্টি উভয়েই সমৃদ্ধ।', unit: '1kg', benefits: ['ভিটামিন সি এবং ফাইবার সমৃদ্ধ।', 'হজমে সহায়ক।'] },
    { name: 'Bananas', slug: 'bananas', image: 'bananas.avif', categorySlug: 'fruit', price: 60, description: 'পুষ্টিকর কলা, যা শক্তির একটি চমৎকার উৎস।', unit: '1kg', benefits: ['পটাশিয়াম সমৃদ্ধ।', 'শক্তি বৃদ্ধি করে।'] },
  ];

  for (const prod of products) {
    const category = await prisma.category.findUnique({
      where: { slug: prod.categorySlug },
    });
    if (category) {
      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {},
        create: {
          name: prod.name,
          slug: prod.slug,
          image: prod.image,
          price: prod.price,
          description: prod.description,
          unit: prod.unit,
          benefits: prod.benefits,
          categoryId: category.id,
          isFeatured: products.indexOf(prod) < 8,
        },
      });
    }
  }
  console.log(`${products.length} products created`);

  const faqs = [
    { question: 'NutriZaria কী?', answer: 'NutriZaria একটি অনলাইন প্ল্যাটফর্ম যা গুণগত মানের খাবার সরবরাহ করে সুলভ মূল্যে, গ্রাহকদের সন্তুষ্টি নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।', sortOrder: 1 },
    { question: 'NutriZaria থেকে কী ধরনের পণ্য পাওয়া যায়?', answer: 'NutriZaria-এ বিভিন্ন প্রকারের খাঁটি খাদ্যপণ্য পাওয়া যায়, যেমন বাদাম, মধু, ডেটস, অলিভ অয়েল, মশলা, এবং আরও অনেক।', sortOrder: 2 },
    { question: 'NutriZaria পণ্য কীভাবে অর্ডার করবো?', answer: 'আমাদের ওয়েবসাইট বা মোবাইল অ্যাপ থেকে সহজেই পণ্য অর্ডার করতে পারেন। শুধু পছন্দের পণ্য যোগ করুন এবং চেকআউট করুন।', sortOrder: 3 },
    { question: 'অর্ডার কতদিনের মধ্যে ডেলিভারি হবে?', answer: 'সাধারণত ২-৩ কার্যদিবসের মধ্যে অর্ডার ডেলিভারি করা হয়। তবে স্থানভেদে সময় কিছুটা পরিবর্তন হতে পারে।', sortOrder: 4 },
    { question: 'NutriZaria কি ক্যাশ অন ডেলিভারি (COD) সুবিধা দেয়?', answer: 'হ্যাঁ, NutriZaria-এ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে, যা আপনাকে পণ্য গ্রহণের সময় অর্থ প্রদান করার সুযোগ দেয়।', sortOrder: 5 },
    { question: 'NutriZaria-এ বিকাশ বা নগদ ব্যবহার করে পেমেন্ট করা যায়?', answer: 'হ্যাঁ, আমরা বিকাশ, নগদ, এবং অন্যান্য মোবাইল ফিনান্সিয়াল সার্ভিস (MFS) গ্রহণ করি।', sortOrder: 6 },
    { question: 'পণ্য ফেরত দেওয়ার নীতি কী?', answer: 'যদি আপনি পণ্যে অসন্তুষ্ট হন বা ভুল পণ্য পান, তাহলে ৭ দিনের মধ্যে আমাদের সাথে যোগাযোগ করে ফেরত দেওয়ার সুযোগ পাবেন।', sortOrder: 7 },
    { question: 'NutriZaria পণ্যের গুণগত মান কিভাবে নিশ্চিত করে?', answer: 'আমরা প্রতিটি পণ্য সরাসরি উৎস থেকে সংগ্রহ করি এবং কঠোর মান নিয়ন্ত্রণ প্রক্রিয়ার মাধ্যমে পণ্য গ্রাহকদের কাছে পৌঁছাই।', sortOrder: 8 },
    { question: 'NutriZaria-এর পণ্য কি স্বাস্থ্যসম্মত এবং নিরাপদ?', answer: 'হ্যাঁ, NutriZaria-এর সব পণ্য স্বাস্থ্যসম্মত এবং সম্পূর্ণ নিরাপদ। আমরা প্রাকৃতিক ও খাঁটি উপাদান ব্যবহারে অঙ্গীকারবদ্ধ।', sortOrder: 9 },
    { question: 'NutriZaria-এর কাস্টমার সার্ভিস কিভাবে পাবো?', answer: 'আমাদের কাস্টমার সার্ভিস টিম ২৪/৭ আপনাদের সেবায় নিয়োজিত। যেকোনো প্রয়োজনে আমাদের ওয়েবসাইটের হেল্প সেকশনে যোগাযোগ করতে পারেন।', sortOrder: 10 },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }
  console.log(`${faqs.length} FAQs created`);

  const blogPosts = [
    { title: 'The Future of Organic Food in E-Commerce', slug: 'the-future-of-organic-food-in-e-commerce', category: 'Organic', author: 'Sarah Thompson', content: 'As consumers become more health-conscious, the demand for organic products continues to rise. This blog explores the future of organic food in e-commerce, and how it benefits both customers and the environment.', image: '/images/blogs/organic-food.avif', isPublished: true, publishedAt: new Date('2024-10-01') },
    { title: 'How to Choose Fresh Produce Online', slug: 'how-to-choose-fresh-produce-online', category: 'Produce', author: 'John Doe', content: 'Shopping for fresh produce online can be tricky. In this guide, we give you tips on how to choose the freshest fruits and vegetables when shopping on e-commerce platforms.', image: '/images/blogs/fresh-produce.avif', isPublished: true, publishedAt: new Date('2024-09-15') },
    { title: 'Top 10 Quick Meal Ideas with Local Ingredients', slug: 'top-10-quick-meal-ideas-with-local-ingredients', category: 'Recipes', author: 'Emily Williams', content: 'Discover how you can create quick and nutritious meals using locally-sourced ingredients. This blog provides 10 easy meal ideas for busy individuals.', image: '/images/blogs/quick-meal.avif', isPublished: true, publishedAt: new Date('2024-09-28') },
    { title: 'The Impact of E-Commerce on Food Sustainability', slug: 'the-impact-of-e-commerce-on-food-sustainability', category: 'Sustainability', author: 'Michael Green', content: 'The rise of e-commerce is changing the way we approach sustainability in the food industry. Learn how e-commerce platforms are pushing for more eco-friendly practices.', image: '/images/blogs/sustainability.avif', isPublished: true, publishedAt: new Date('2024-09-20') },
    { title: 'Understanding the Difference Between Organic and Non-Organic Foods', slug: 'understanding-the-difference-between-organic-and-non-organic-foods', category: 'Organic', author: 'Sarah Thompson', content: 'Many people are confused about the difference between organic and non-organic foods. This blog explains the differences and why organic foods are often preferred.', image: '/images/blogs/organic-vs-non-organic.avif', isPublished: true, publishedAt: new Date('2024-10-05') },
    { title: 'Top 5 Benefits of Buying Groceries Online', slug: 'top-5-benefits-of-buying-groceries-online', category: 'E-Commerce', author: 'John Doe', content: 'With the increasing shift towards online grocery shopping, this blog highlights the top 5 benefits of purchasing groceries online, including convenience, time-saving, and more.', image: '/images/blogs/online-groceries.avif', isPublished: true, publishedAt: new Date('2024-09-30') },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`${blogPosts.length} blog posts created`);

  const rolePermissions: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: Object.values(Permission),
    ADMIN: [
      Permission.VIEW_DASHBOARD, Permission.MANAGE_PRODUCTS, Permission.MANAGE_CATEGORIES,
      Permission.MANAGE_ORDERS, Permission.MANAGE_USERS, Permission.MANAGE_BLOGS,
      Permission.MANAGE_FAQS, Permission.VIEW_REPORTS, Permission.VIEW_ACTIVITY_LOGS,
      Permission.BULK_OPERATIONS,
    ],
    MANAGER: [
      Permission.VIEW_DASHBOARD, Permission.MANAGE_PRODUCTS, Permission.MANAGE_CATEGORIES,
      Permission.MANAGE_ORDERS, Permission.MANAGE_BLOGS, Permission.MANAGE_FAQS,
      Permission.VIEW_REPORTS,
    ],
    STAFF: [
      Permission.VIEW_DASHBOARD, Permission.MANAGE_ORDERS, Permission.VIEW_REPORTS,
    ],
    CUSTOMER: [],
  };

  let permCount = 0;
  for (const [role, permissions] of Object.entries(rolePermissions)) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { role_permission: { role: role as UserRole, permission } },
        update: {},
        create: { role: role as UserRole, permission },
      });
      permCount++;
    }
  }
  console.log(`${permCount} role permissions created`);

  const defaultSettings = [
    { key: 'site_name', value: 'NutriZaria', type: 'string' },
    { key: 'site_description', value: 'Authentic Pure Food Resources', type: 'string' },
    { key: 'contact_email', value: 'nutrizaria@gmail.com', type: 'string' },
    { key: 'contact_phone', value: '+880 1820999820', type: 'string' },
    { key: 'currency', value: 'bdt', type: 'string' },
    { key: 'currency_symbol', value: 'Tk', type: 'string' },
    { key: 'free_delivery_threshold', value: '2000', type: 'number' },
    { key: 'delivery_fee', value: '80', type: 'number' },
    { key: 'max_login_attempts', value: '5', type: 'number' },
    { key: 'lockout_duration_minutes', value: '30', type: 'number' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean' },
    { key: 'allow_registrations', value: 'true', type: 'boolean' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`${defaultSettings.length} default settings created`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
