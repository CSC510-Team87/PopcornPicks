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
import { Trash2 } from "lucide-react";
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
  const [alertState, setAlertState] = useState({
    show: false,
    message: '',
    type: 'default'
  });
  const router = useRouter();

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/watchlist');
      const data = await response.json();
      setMovies(Array.isArray(data) ? data : []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setAlertState({
        show: true,
        message: 'Error loading watchlist. Please try again later.',
        type: 'destructive'
      });
      setMovies([]);
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    try {
      await fetch(`http://127.0.0.1:3001/watchlist/${movieId}`, {
        method: 'DELETE'
      });
      setMovies(movies.filter(movie => movie.id !== movieId));
    } catch (error) {
      console.error('Error removing movie:', error);
      setAlertState({
        show: true,
        message: 'Error removing movie. Please try again later.',
        type: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const renderMovieList = () => {
    const moviesList = Array.isArray(movies) ? movies : [];
    
    if (moviesList.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-default-500">
            Your watchlist is empty. Start adding movies from recommendations!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {moviesList.map((movie: WatchlistMovie) => (
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
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">My Watchlist 🎬</h2>
        <p className="text-lg text-muted-foreground">
          Keep track of movies you want to watch later
        </p>
      </div>

      {alertState.show && (
        <Alert 
          variant={alertState.type === 'destructive' ? 'destructive' : 'default'}
          className="mx-auto max-w-2xl"
        >
          <AlertDescription>
            {alertState.message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-lg font-bold">Your Movies</p>
            <p className="text-sm text-default-500">
              {movies?.length || 0} {movies?.length === 1 ? 'movie' : 'movies'} in your watchlist
            </p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          {renderMovieList()}
        </CardBody>
      </Card>

      <div className="flex justify-center gap-4">
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