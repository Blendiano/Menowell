import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hash = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: hash,
      dateOfBirth: new Date('1975-06-15'),
      preferredLanguage: 'en',
      notificationPreference: true,
    },
  })

  console.log(`  ✓ Created user: ${user.name}`)

  await prisma.educationalArticle.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Understanding Perimenopause',
        content: 'Perimenopause is the transitional period before menopause. It typically begins in a woman\'s 40s, but can start in the late 30s. During this time, hormone levels fluctuate, leading to various symptoms such as irregular periods, hot flashes, and sleep disturbances. Understanding these changes can help you manage symptoms effectively and know when to seek medical advice. This information is educational and not medical advice.',
        category: 'Stages',
      },
      {
        title: 'Managing Hot Flashes Naturally',
        content: 'Hot flashes are one of the most common menopause symptoms, affecting up to 80% of women. Lifestyle modifications can help reduce their frequency and intensity. Consider dressing in layers, avoiding triggers like spicy foods and caffeine, practicing deep breathing, and maintaining a cool bedroom temperature. Regular exercise and stress reduction techniques may also help. This information is educational and not medical advice.',
        category: 'Symptom Management',
      },
      {
        title: 'Nutrition During Menopause',
        content: 'A balanced diet during menopause can help manage symptoms and support long-term health. Focus on calcium-rich foods for bone health, incorporate phytoestrogens from soy and flaxseeds, eat plenty of fruits and vegetables for antioxidants, and stay hydrated. Limiting alcohol and caffeine may help reduce hot flash frequency. This information is educational and not medical advice.',
        category: 'Wellness',
      },
      {
        title: 'Exercise and Menopause',
        content: 'Regular physical activity offers numerous benefits during menopause, including improved mood, better sleep, weight management, and stronger bones. Aim for a mix of cardio, strength training, and flexibility exercises. Even moderate activities like brisk walking for 30 minutes daily can make a significant difference. Listen to your body and adjust intensity as needed. This information is educational and not medical advice.',
        category: 'Wellness',
      },
      {
        title: 'Sleep Hygiene for Better Rest',
        content: 'Sleep disturbances are common during menopause due to night sweats, anxiety, and hormonal changes. Good sleep hygiene includes maintaining a consistent sleep schedule, creating a cool and dark bedroom environment, avoiding screens before bed, and limiting caffeine and alcohol in the evening. Relaxation techniques such as progressive muscle relaxation or meditation can help prepare your body for rest. This information is educational and not medical advice.',
        category: 'Symptom Management',
      },
    ],
  })

  console.log('  ✓ Created educational articles')

  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: user.id,
        message: 'Welcome to Menowell! Start by logging your first symptom.',
        status: 'UNREAD',
      },
      {
        userId: user.id,
        message: 'New article available: "Understanding Perimenopause"',
        status: 'UNREAD',
      },
    ],
  })

  console.log('  ✓ Created notifications')
  console.log('')
  console.log('  Login with: jane@example.com / password123')
  console.log('')
  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
