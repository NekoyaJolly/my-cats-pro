import { Prisma } from "@prisma/client";

export const catWithRelationsInclude = Prisma.validator<Prisma.CatInclude>()({
  breed: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  coatColor: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  father: {
    select: {
      id: true,
      name: true,
      gender: true,
    },
  },
  mother: {
    select: {
      id: true,
      name: true,
      gender: true,
    },
  },
  pedigree: {
    select: {
      id: true,
      pedigreeId: true,
      catName: true,
      breedCode: true,
      coatColorCode: true,
      genderCode: true,
      birthDate: true,
      breederName: true,
      ownerName: true,
    },
  },
  tags: {
    include: {
      tag: {
        select: {
          id: true,
          name: true,
          color: true,
          textColor: true,
          group: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

export type CatWithRelations = Prisma.CatGetPayload<{
  include: typeof catWithRelationsInclude;
}>;
