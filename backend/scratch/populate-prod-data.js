const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING PRODUCTION DATA POPULATION (REFINED) ---');

  // 1. Business Info (SiteSettings)
  const siteSettings = [
    { section: 'contact', key: 'business_name', value: 'NailssentialsQC' },
    { section: 'contact', key: 'phone', value: '09625036220' },
    { section: 'contact', key: 'address', value: '133 Bukidnon St. corner Nueva Ecija Bago Bantay Quezon City.' },
    { section: 'contact', key: 'facebook', value: '@nailssentialqc' },
    { section: 'contact', key: 'instagram', value: '@nailssentialqc' },
    { section: 'hero', key: 'headline', value: 'Elevate Your Natural Beauty' },
    { section: 'hero', key: 'subheadline', value: 'Professional Nail, Hair, and Spa services in the heart of Quezon City.' }
  ];

  for (const s of siteSettings) {
    await prisma.siteSettings.upsert({
      where: { section_key_unique: { section: s.section, key: s.key } },
      update: { value: s.value },
      create: s
    });
  }

  // 2. Categories
  const categories = ['Nail Care', 'Spa Treatments', 'Hair Services', 'Waxing & Threading', 'Eyelash Services'];
  const catMap = {};
  for (const name of categories) {
    const dbCat = await prisma.serviceCategory.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    catMap[name] = dbCat.id;
  }

  // 3. Helper for Services
  async function addSvc(catName, name, price, duration = 60) {
    const priceNum = typeof price === 'string' ? parseFloat(price.replace('Php ', '').replace(',', '')) : price;
    return prisma.service.upsert({
      where: { name_category_id: { name, category_id: catMap[catName] } },
      update: { price: priceNum, duration_minutes: duration, is_active: true },
      create: { name, price: priceNum, duration_minutes: duration, category_id: catMap[catName] }
    });
  }

  // --- NAILS ---
  await addSvc('Nail Care', 'Classic Manicure', 170, 30);
  await addSvc('Nail Care', 'Classic Pedicure', 200, 45);
  await addSvc('Nail Care', 'Gel Manicure', 470, 60);
  await addSvc('Nail Care', 'Gel Pedicure', 570, 60);
  await addSvc('Nail Care', 'Nail Extension (Any Length)', 1400, 120);
  await addSvc('Nail Care', 'Biab Overlay Short', 700, 60);
  await addSvc('Nail Care', 'Biab Overlay Long', 850, 75);
  await addSvc('Nail Care', 'Biab Overlay Extra Long', 1000, 90);
  await addSvc('Nail Care', 'Kids Manicure', 150, 20);
  await addSvc('Nail Care', 'Kids Pedicure', 180, 30);
  await addSvc('Nail Care', 'Kids Footspa', 250, 30);
  await addSvc('Nail Care', 'Nail Arts (Chrome, Cat eye, Ombre, French Tip)', 200, 30);
  await addSvc('Nail Care', 'Soft Gel Extension Removal (In-House)', 150, 30);
  await addSvc('Nail Care', 'Soft Gel Extension Removal (Outside)', 300, 45);
  await addSvc('Nail Care', 'Gel Removal (In-House)', 0, 20);
  await addSvc('Nail Care', 'Gel Removal (Outside)', 150, 30);

  // --- SPA ---
  await addSvc('Spa Treatments', 'Classic Foot Spa', 350, 45);
  await addSvc('Spa Treatments', 'Classic Hand Spa', 300, 45);
  await addSvc('Spa Treatments', 'Foot Paraffin Wax', 450, 30);
  await addSvc('Spa Treatments', 'Hand Paraffin Wax', 400, 30);
  await addSvc('Spa Treatments', 'Classic Foot spa with pedicure', 500, 75);
  await addSvc('Spa Treatments', 'Foot Spa with Foot Paraffin Wax', 750, 75);

  // --- HAIR ---
  await addSvc('Hair Services', 'Haircut', 199, 30);
  await addSvc('Hair Services', 'Hair Iron', 299, 30);
  await addSvc('Hair Services', 'Hair Blowdry', 249, 30);
  await addSvc('Hair Services', 'Balayage with Hair Treatment', 3499, 180);
  await addSvc('Hair Services', 'Hair Spa Organic', 699, 60);
  await addSvc('Hair Services', 'Hair Color (Roots)', 499, 60);
  await addSvc('Hair Services', 'Hair Color (Short)', 799, 90);
  await addSvc('Hair Services', 'Hair Color (Medium)', 899, 100);
  await addSvc('Hair Services', 'Hair Color (Long)', 999, 120);
  await addSvc('Hair Services', 'Hair Rebond (Short)', 999, 180);
  await addSvc('Hair Services', 'Hair Rebond (Medium)', 1599, 210);
  await addSvc('Hair Services', 'Hair Rebond (Long)', 1999, 240);
  await addSvc('Hair Services', 'Brazilian Hair Treatment (Neck)', 999, 90);
  await addSvc('Hair Services', 'Brazilian Hair Treatment (Medium)', 1499, 120);
  await addSvc('Hair Services', 'Brazilian Hair Treatment (Long/XL)', 1999, 150);

  // --- WAXING ---
  const waxData = [
    { name: 'Eyebrow Shading', f: 150, m: 200 },
    { name: 'Eyebrow Threading', f: 250, m: 280 },
    { name: 'Eyebrow Waxing', f: 250, m: 300 },
    { name: 'Under Arm Waxing', f: 250, m: 300 },
    { name: 'Full Legs Wax', f: 700, m: 750 },
    { name: 'Brazillian Wax', f: 800, m: 950 }
  ];
  for (const w of waxData) {
    await addSvc('Waxing & Threading', `${w.name} (Female)`, w.f, 30);
    await addSvc('Waxing & Threading', `${w.name} (Male)`, w.m, 30);
  }

  // --- EYELASHES ---
  await addSvc('Eyelash Services', 'Lash Classic', 499, 90);
  await addSvc('Eyelash Services', 'Lash Volume', 799, 120);
  await addSvc('Eyelash Services', 'Lash Cat Eye', 999, 120);
  await addSvc('Eyelash Services', 'Lash Hybrid', 1099, 120);
  await addSvc('Eyelash Services', 'Lash Whispy', 1199, 120);
  await addSvc('Eyelash Services', 'Lash Lift', 649, 60);

  // --- PACKAGES ---
  const packageData = [
    { name: 'Package A: Foot spa + Mani + Pedi', price: 700, items: ['Classic Foot Spa', 'Classic Manicure', 'Classic Pedicure'] },
    { name: 'Package B: Foot spa + Manigel + Pedi', price: 1000, items: ['Classic Foot Spa', 'Gel Manicure', 'Classic Pedicure'] },
    { name: 'Package C: Foot spa + Mani + Pedigel', price: 1050, items: ['Classic Foot Spa', 'Classic Manicure', 'Gel Pedicure'] },
    { name: 'Package D: Foot spa + Manigel + Pedigel', price: 1350, items: ['Classic Foot Spa', 'Gel Manicure', 'Gel Pedicure'] },
    { name: 'Package I: Softgel Nail Extension + Pedigel', price: 1900, items: ['Nail Extension (Any Length)', 'Gel Pedicure'] },
    { name: 'Package J: Softgel Ext + Foot Spa + Pedigel', price: 2250, items: ['Nail Extension (Any Length)', 'Classic Foot Spa', 'Gel Pedicure'] }
  ];

  for (const pkg of packageData) {
    const serviceIds = [];
    for (const itemName of pkg.items) {
      const svc = await prisma.service.findFirst({ where: { name: itemName } });
      if (svc) serviceIds.push(svc.id);
    }

    if (serviceIds.length > 0) {
      let dbPkg = await prisma.servicePackage.findFirst({ where: { name: pkg.name } });
      if (dbPkg) {
        dbPkg = await prisma.servicePackage.update({
          where: { id: dbPkg.id },
          data: { price: pkg.price, is_active: true }
        });
      } else {
        dbPkg = await prisma.servicePackage.create({
          data: { name: pkg.name, price: pkg.price, is_active: true }
        });
      }
      
      await prisma.servicePackageItem.deleteMany({ where: { package_id: dbPkg.id } });
      await prisma.servicePackageItem.createMany({
        data: serviceIds.map(sid => ({ package_id: dbPkg.id, service_id: sid }))
      });
    }
  }

  console.log('--- PRODUCTION DATA POPULATION COMPLETED ---');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
