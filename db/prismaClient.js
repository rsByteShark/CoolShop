const { PrismaClient } = require('@prisma/client');

if (!global.prisma) {
    global.prisma = new PrismaClient();
}

/**@type {import("@prisma/client").PrismaClient} */
const prisma = global.prisma;


module.exports = prisma;

