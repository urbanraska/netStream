import axios from "axios";
import React, { useCallback, useMemo } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFavorites from "@/hooks/useFavorites";
import { AiOutlinePlus, AiOutlineCheck } from "react-icons/ai";

interface FavoriteButtonProps {
  movieId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ movieId }) => {
  const { mutate: mutateFavorites } = useFavorites();
  const { data: currentUser, mutate } = useCurrentUser();

  const isFavorite = useMemo(() => {
    const list = currentUser?.favoriteIds || [];
    return list.includes(movieId);
  }, [currentUser, movieId]);

  const toggleFavorites = useCallback(async () => {
    try {
      let response;
      if (isFavorite) {
        response = await axios.delete(`/api/favorite?movieId=${movieId}`);
      } else {
        response = await axios.post(`/api/favorite?movieId=${movieId}`);
      }
      const updatedFavoriteIds = response?.data?.favoriteIds;
      mutate({
        ...currentUser,
        favoriteIds: updatedFavoriteIds,
      });
      mutateFavorites();
    } catch (error) {
      console.error("Error toggling favorites:", error);
    }
  }, [movieId, isFavorite, currentUser, mutate, mutateFavorites]);

  const Icon = isFavorite ? AiOutlineCheck : AiOutlinePlus;

  return (
    <div
      onClick={toggleFavorites}
      className="
        cursor-pointer
        favorite-button
        w-6
        h-6
        lg:w-10
        lg:h-10
        border-white
        border-2
        rounded-full
        flex
        justify-center
        items-center
        transition
        hover:border-neutral-300
        "
    >
      <Icon className="text-white" size={25} />
    </div>
  );
};

export default FavoriteButton;
