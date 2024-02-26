// import { PrismaClient } from '@prisma/client';
// import { EmailProviderData, ProviderName } from 'wasp/server/auth';

// import { ServerSetupFn } from 'wasp/server';

// const prismaClient = new PrismaClient();

// export const mySetupFunction: ServerSetupFn = async () => {
//   await createSocialLoginMigration(prismaClient, 'github');
//   await createSocialLoginMigration(prismaClient, 'google');
//   await migrateEmailAuth(prismaClient);
// };

// export async function migrateEmailAuth(prismaClient: PrismaClient) {
//   const users = await prismaClient.user.findMany({
//     include: {
//       auth: true,
//     },
//   });

//   let numOfMigratedUsers = 0;

//   for (const user of users) {
//     if (user.auth) {
//       console.log('User was already migrated, skipping', user.id);
//       continue;
//     }

//     if (!user.email || !user.password) {
//       console.log('Missing email auth info, skipping user', user.id);
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
//     numOfMigratedUsers++;
//     console.log(`migrated ${numOfMigratedUsers} users`);
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

//   let numOfMigratedUsers = 0;

//   for (const user of users) {
//     if (user.auth) {
//       console.log('User was already migrated, skipping', user.id);
//       continue;
//     }

//     const provider = user.externalAuthAssociations.find((provider) => provider.provider === providerName);

//     if (!provider) {
//       console.log(`Missing ${providerName} provider, skipping user`, user.id);
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
//     numOfMigratedUsers++;
//     console.log(`migrated ${numOfMigratedUsers} users`);
//   }
// }