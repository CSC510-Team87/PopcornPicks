import { Button } from "@nextui-org/react";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

interface WatchlistButtonProps {
  movieId: string;
  movieTitle: string;
}

export default function WatchlistButton({ movieId, movieTitle }: WatchlistButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addToWatchlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:3001/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          movieTitle
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to watchlist');
      }

      setIsAdded(true);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      color={isAdded ? "success" : "primary"}
      onClick={addToWatchlist}
      isLoading={isLoading}
      startContent={isAdded ? <Check size={16} /> : <Plus size={16} />}
    >
      {isAdded ? "Added to Watchlist" : "Add to Watchlist"}
    </Button>
  );
}