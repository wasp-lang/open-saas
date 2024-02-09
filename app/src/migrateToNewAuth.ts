// import { PrismaClient } from '@prisma/client';
// import { EmailProviderData, ProviderName, UsernameProviderData } from 'wasp/server/auth';

// export async function migrateEmailAuth(prismaClient: PrismaClient) {
//   const users = await prismaClient.user.findMany({
//     include: {
//       auth: true,
//     },
//   });

//   for (const user of users) {
//     if (user.auth) {
//       console.log('User was already migrated, skipping', user);
//       continue;
//     }

//     if (!user.email || !user.password) {
//       console.log('Missing email auth info, skipping user', user);
//       continue;
//     }

//     const providerData: EmailProviderData = {
//       isEmailVerified: user.isEmailVerified,
//       emailVerificationSentAt: user.emailVerificationSentAt?.toISOString() ?? null,
//       passwordResetSentAt: user.passwordResetSentAt?.toISOString() ?? null,
//       hashedPassword: user.password,
//     };
//     const providerName: ProviderName = 'email';

//     await prismaClient.auth.create({
//       data: {
//         identities: {
//           create: {
//             providerName,
//             providerUserId: user.email,
//             providerData: JSON.stringify(providerData),
//           },
//         },
//         user: {
//           connect: {
//             id: user.id,
//           },
//         },
//       },
//     });
//   }
// }

// export async function migrateGoogleAuth(prismaClient: PrismaClient) {
//   return createSocialLoginMigration(prismaClient, 'google');
// }

// export async function migrateGitHubAuth(prismaClient: PrismaClient) {
//   return createSocialLoginMigration(prismaClient, 'github');
// }

// async function createSocialLoginMigration(prismaClient: PrismaClient, providerName: 'google' | 'github') {
//   const users = await prismaClient.user.findMany({
//     include: {
//       auth: true,
//       externalAuthAssociations: true,
//     },
//   });

//   for (const user of users) {
//     if (user.auth) {
//       console.log('User was already migrated, skipping', user);
//       continue;
//     }

//     const provider = user.externalAuthAssociations.find((provider) => provider.provider === providerName);

//     if (!provider) {
//       console.log(`Missing ${providerName} provider, skipping user`, user);
//       continue;
//     }

//     await prismaClient.auth.create({
//       data: {
//         identities: {
//           create: {
//             providerName,
//             providerUserId: provider.providerId,
//             providerData: JSON.stringify({}),
//           },
//         },
//         user: {
//           connect: {
//             id: user.id,
//           },
//         },
//       },
//     });
//   }
// }