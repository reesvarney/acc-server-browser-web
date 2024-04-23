import { ServerType } from "$utils/db";
import models from "$utils/db";
import getServers from "$utils/getServers";
import type { NextApiResponse, NextApiRequest } from "next";
import { z } from "zod";
let lastCheck = 0;
let getServerPromise: Promise<String>;

const filterInput = z
  .object({
    favourites: z
      .string()
      .regex(/.*/)
      .transform((a) => {
        return a.split(",") || [];
      })
      .optional(),
    showEmpty: z
      .string()
      .regex(/.*/)
      .transform((a) => {
        return a == "true";
      })
      .optional()
      .default("false"),
    showFull: z
      .string()
      .regex(/.*/)
      .transform((a) => {
        return a == "true";
      })
      .optional()
      .default("true"),
    favouritesOnly: z
      .string()
      .regex(/.*/)
      .transform((a) => {
        return a == "true";
      })
      .optional()
      .default("false"),
    class: z
      .string()
      .regex(/.*/)
      .transform((a) => {
        return a.split(",") || [];
      })
      .optional(),
    dlc: z
      .string()
      .regex(/.*/)
      .transform((a) => {
        return a.split(",") || [];
      })
      .optional(),
    track: z
      .string()
      .regex(/.*/)
      .transform((a) => {
          return a.split(",") || [];
      })
      .optional(),
    sessions: z
      .string()
      .regex(/.*/)
      .transform((a) => {
        return a.split(",") || [];
      })
      .optional(),
    search: z.string().optional(),
    min_sa: z
      .number()
      .or(z.string().regex(/\d+/).transform(Number))
      .optional()
      .default(0),
    max_sa: z
      .number()
      .or(z.string().regex(/\d+/).transform(Number))
      .optional()
      .default(99),
    min_tm: z
      .number()
      .or(z.string().regex(/\d+/).transform(Number))
      .optional()
      .default(0),
    max_tm: z
      .number()
      .or(z.string().regex(/\d+/).transform(Number))
      .optional()
      .default(3),
    min_drivers: z
      .number()
      .or(z.string().regex(/\d+/).transform(Number))
      .optional()
      .default(0),
    max_drivers: z
      .number()
      .or(z.string().regex(/\d+/).transform(Number))
      .optional()
      .default(99),
  })
  .nullish();

export type filterType = z.infer<typeof filterInput>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{servers: Array<ServerType>, status: String}>
) {
  // This is probably bad practice but I don't think it matters too much
  const urlObj = new URL(`http://localhost` + (req.url ?? "/api/servers"));
  let rawData = req.url ? Object.fromEntries(urlObj.searchParams) : {};
  const input = filterInput.parse(rawData);
  if (Date.now() - lastCheck > 2 * 60 * 1000 || await getServerPromise === "offline") {
    lastCheck = Date.now();
    getServerPromise = getServers();
  }

  await getServerPromise;

  const queryData = {
    ...(input?.favouritesOnly && {
      id: {
        $in: input.favourites,
      },
    }),
    ...(input?.search && {
      name: {
        $regex: input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      },
    }),
    ...(input?.dlc && {
      "track.dlc": {
        $in: input.dlc,
      },
    }),
    ...(input?.track && {
      "track.id": {
        $in: input.track,
      },
    }),
    ...(input?.class && {
      class: {
        $in: input.class,
      },
    }),
    ...(input?.sessions && {
      sessions: {
        $elemMatch: {
          type: {
            $in: input.sessions,
          },
          active: true,
        },
      },
    }),
    "requirements.trackMedals": {
      $gte: input?.min_tm ?? 0,
      $lte: input?.max_tm ?? 3,
    },
    "requirements.safetyRating": {
      $gte: input?.min_sa ?? 0,
      $lte: input?.max_sa ?? 99,
    },
    "drivers.connected": {
      $gte: input?.min_drivers ?? 0,
      $lte: input?.max_drivers ?? 99,
      ...(!input?.showEmpty && {
        $ne: 0,
      }),
    },
    ...(!input?.showFull && {
      isFull: false,
    }),
  };
  let data: Array<ServerType> = await models.Server.aggregate(
    [
      {
        $match: queryData,
      },
      {
        $addFields: {
          isFavourite: {
            $in: ["$id", input?.favourites || []],
          },
        },
      },
      {
        $sort: {
          isFavourite: -1,
          "drivers.connected": -1,
        },
      },
    ],
    { allowDiskUse: true }
  );
  res.status(200).json({
    servers: data,
    status: await getServerPromise
  });
}
