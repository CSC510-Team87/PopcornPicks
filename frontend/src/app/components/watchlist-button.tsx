import { Button } from "@nextui-org/react";
import { Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface WatchlistButtonProps {
  movieId: string;
  movieTitle: string;
}

export default function WatchlistButton({ movieId, movieTitle }: WatchlistButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdded(false);
        return;
      }

      try {
        const numericMovieId = parseInt(movieId, 10);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/watchlist/check/${numericMovieId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        
        if (!response.ok) {
          console.error('Watchlist check failed:', response.status);
          return;
        }
        
        const data = await response.json();
        setIsAdded(data.isInWatchlist);
      } catch (error) {
        console.error("Error checking watchlist status:", error);
        setIsAdded(false);
      }
    };

    checkWatchlistStatus();
  }, [movieId]);

  const addToWatchlist = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const numericMovieId = parseInt(movieId, 10);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/watchlist/${numericMovieId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieTitle
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add to watchlist: ${response.status}`);
      }

      setIsAdded(true);
    } catch (error) {
      console.error("Failed to add to watchlist:", {
        error: error instanceof Error ? error.message : String(error),
        movieId,
        movieTitle,
        timestamp: new Date().toISOString()
      });
      setIsAdded(false);
      alert(error instanceof Error ? error.message : 'Failed to add to watchlist');
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
      isDisabled={isAdded}
    >
      {isAdded ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  );
}