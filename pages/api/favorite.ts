import { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).end();
  }

  try {
    const { currentUser } = await serverAuth(req);
    const movieId = String(req.query.movieId);

    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      throw new Error("Invalid ID");
    }

    let updatedFavoriteIds;
    if (req.method === "POST") {
      updatedFavoriteIds = [...currentUser.favoriteIds, movieId];
    } else {
      updatedFavoriteIds = currentUser.favoriteIds.filter(
        (id: string) => id !== movieId
      );
    }

    const updatedUser = await prismadb.user.update({
      where: {
        email: currentUser.email || "",
      },
      data: {
        favoriteIds: updatedFavoriteIds,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error handling favorite:", error);
    return res.status(400).end();
  }
}
