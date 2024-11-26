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

  const toggleWatchlist = async () => {
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

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

      console.log('Current state:', { isAdded, movieId: numericMovieId }); // Debug log

      if (isAdded) {
        // Remove from watchlist using movie ID directly
        const response = await fetch(`${baseUrl}/watchlist/movie/${numericMovieId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });

        const responseData = await response.json();
        console.log('Remove response:', responseData); // Debug log

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to remove from watchlist');
        }

        setIsAdded(false);
      } else {
        // Add to watchlist
        const response = await fetch(`${baseUrl}/watchlist/${numericMovieId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        });

        const responseData = await response.json();
        console.log('Add response:', responseData); // Debug log

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to add to watchlist');
        }

        setIsAdded(true);
      }
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        movieId,
        isAdded,
        timestamp: new Date().toISOString()
      };
      console.error("Watchlist operation failed:", errorDetails);
      alert(errorDetails.message);
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
      onClick={toggleWatchlist}
      isLoading={isLoading}
      startContent={isAdded ? <Check size={16} /> : <Plus size={16} />}
    >
      {isAdded ? "Remove from Watchlist" : "Add to Watchlist"}
    </Button>
  );
}