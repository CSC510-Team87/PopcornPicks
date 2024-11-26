import { Button } from "@nextui-org/react";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import axios from "axios";

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
      await axios.post("http://127.0.0.1:3001/watchlist", {
        movieId,
        movieTitle
      });
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