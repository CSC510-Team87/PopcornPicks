"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Divider,
  Spinner
} from "@nextui-org/react";
import { Star, Trash2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from '@/app/components/alert';

interface WatchlistMovie {
  id: string;
  title: string;
  addedDate: string;
  imdbId?: string;
}

export default function WatchlistPage() {
  const [movies, setMovies] = useState<WatchlistMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/watchlist', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setError('Failed to load watchlist. Please try again later.');
      console.error('Error fetching watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/watchlist/${movieId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to remove movie from watchlist');
      }

      // Update local state to remove the movie
      setMovies(movies.filter(movie => movie.id !== movieId));
    } catch (err) {
      setError('Failed to remove movie. Please try again.');
      console.error('Error removing movie:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          My Watchlist 🎬
        </h2>
        <p className="text-lg text-muted-foreground">
          Keep track of movies you want to watch later
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Watchlist Content */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-lg font-bold">Your Movies</p>
            <p className="text-sm text-default-500">
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your watchlist
            </p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          {movies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-default-500">
                Your watchlist is empty. Start adding movies from recommendations!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {movies.map((movie) => (
                <Card key={movie.id} className="w-full">
                  <CardBody className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-medium">{movie.title}</p>
                      <p className="text-sm text-default-500">
                        Added on {new Date(movie.addedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {movie.imdbId && (
                        <Button 
                          size="sm"
                          color="primary"
                          variant="flat"
                          as="a"
                          href={`https://www.imdb.com/title/${movie.imdbId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          IMDb
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onClick={() => removeFromWatchlist(movie.id)}
                        startContent={<Trash2 size={16} />}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          size="lg"
          onClick={() => router.push("/landing")}
          color="primary"
          variant="bordered"
        >
          Return to Home
        </Button>
        <Button
          size="lg"
          onClick={() => router.push("/search")}
          color="primary"
        >
          Get Recommendations
        </Button>
      </div>
    </div>
  );
}