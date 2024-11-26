import { Button } from "@nextui-org/react";
import { Plus, Check, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface WatchlistButtonProps {
  movieId: string;
  movieTitle: string;
  key?: string;
}

export default function WatchlistButton({ movieId, movieTitle }: WatchlistButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [movieExists, setMovieExists] = useState(true);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAdded(false);
        return;
      }

      try {
        const numericMovieId = parseInt(movieId, 10);
        if (isNaN(numericMovieId)) {
          console.error('Invalid movie ID:', movieId);
          setMovieExists(false);
          return;
        }

        console.log('Checking watchlist status for:', {
          movieId: numericMovieId,
          movieTitle,
          token: token.substring(0, 10) + '...' // Log part of token for debugging
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/watchlist/check/${numericMovieId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        
        if (response.status === 404) {
          console.log('Movie not found in database:', numericMovieId);
          setMovieExists(false);
          setIsAdded(false);
          return;
        }
        
        if (!response.ok) {
          console.error('Watchlist check failed:', response.status);
          setMovieExists(true);
          setIsAdded(false);
          return;
        }
        
        const data = await response.json();
        setIsAdded(data.isInWatchlist);
        setMovieExists(true);
      } catch (error) {
        console.error("Error checking watchlist status:", error);
        setIsAdded(false);
        setMovieExists(true);
      }
    };

    if (movieId) {
      checkWatchlistStatus();
    }
  }, [movieId]);

  const addToWatchlist = async () => {
    if (!movieExists) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const numericMovieId = parseInt(movieId, 10);
      if (isNaN(numericMovieId)) {
        throw new Error('Invalid movie ID');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/watchlist/${numericMovieId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieTitle,
          movieId: numericMovieId
        })
      });

      if (response.status === 404) {
        setMovieExists(false);
        throw new Error('Movie not found in database');
      }

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || `Failed to add to watchlist: ${response.status}`;
        } catch {
          errorMessage = `Failed to add to watchlist: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      setIsAdded(true);
      setMovieExists(true);
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

  if (!movieExists) {
    return (
      <Button
        size="sm"
        color="danger"
        isDisabled
        startContent={<AlertCircle size={16} />}
      >
        Not in Database
      </Button>
    );
  }

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