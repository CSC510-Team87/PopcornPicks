"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Input,
  Button,
  Divider
} from "@nextui-org/react";
import { Alert, AlertDescription } from '@/app/components/alert';
import { LoaderIcon } from "lucide-react";
import WatchlistButton from "@/app/components/watchlist-button";

export default function SearchPage() {
  const router = useRouter();
  
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [recentMovies, setRecentMovies] = useState<string[]>([]);
  const [predictedMovies, setPredictedMovies] = useState<Array<{id: string, title: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState({
    show: false,
    message: '',
    type: 'default' as const
  });

  // Fetch recent movies on component mount
  useEffect(() => {
    getRecentMovies();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching movies:', error);
      setAlertState({
        show: true,
        message: 'Error searching for movies. Please try again.',
        type: "default"
      });
    }
  };

  const handleMovieSelect = (movie: string) => {
    if (selectedMovies.length >= 5) {
      setAlertState({
        show: true,
        message: 'You can only select up to 5 movies',
        type: 'default'
      });
      return;
    }
    if (!selectedMovies.includes(movie)) {
      setSelectedMovies([...selectedMovies, movie]);
    }
    setSearchResults([]);
  };

  const removeSelectedMovie = (movieToRemove: string) => {
    setSelectedMovies(selectedMovies.filter(movie => movie !== movieToRemove));
  };

  const getRecentMovies = async () => {
    try {
      const response = await fetch('http://localhost:3001/getRecentMovies');
      const data = await response.json();
      setRecentMovies(data.map((movie: any) => movie.name));
    } catch (error) {
      console.error('Error fetching recent movies:', error);
    }
  };

  const handlePredict = async () => {
    if (selectedMovies.length === 0) {
      setAlertState({
        show: true,
        message: 'Please select at least one movie',
        type: 'default'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movies: selectedMovies }),
      });
      const data = await response.json();
      setPredictedMovies(data);
    } catch (error) {
      setAlertState({
        show: true,
        message: 'Error getting predictions',
        type: 'default'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          🎬 Pick a Movie! 🎬
        </h2>
        <p className="text-lg text-muted-foreground">
          ✨Tip: Select up to 5 movies to get a tailored watchlist✨
        </p>
      </div>

      {alertState.show && (
        <Alert 
          variant={alertState.type}
          className="mx-auto max-w-2xl"
        >
          <AlertDescription>
            {alertState.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Search and Selection Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-lg font-bold">Selected Movie(s)</p>
              </div>
            </CardHeader>
            <Divider/>
            <CardBody className="space-y-4">
              <Input 
                type="search"
                placeholder="Search for a Movie"
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-4"
                size="lg"
                isClearable
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((movie, index) => (
                    <Card
                      key={index}
                      isPressable
                      onPress={() => handleMovieSelect(movie)}
                      className="w-full"
                    >
                      <CardBody className="p-2">
                        {movie}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {/* Selected Movies */}
              <div className="space-y-2">
                {selectedMovies.map((movie, index) => (
                  <Card key={index} className="w-full">
                    <CardBody className="p-2 flex justify-between items-center">
                      {movie}
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => removeSelectedMovie(movie)}
                      >
                        Remove
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>

              <Button 
                color="primary"
                size="lg"
                onPress={handlePredict}
                isLoading={isLoading}
              >
                Get Recommendations
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Recent Movies Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-lg font-bold">Your Recents</p>
              </div>
            </CardHeader>
            <Divider/>
            <CardBody>
              <div className="space-y-2">
                {recentMovies.map((movie, index) => (
                  <Card key={index} className="w-full">
                    <CardBody className="p-2">
                      {movie}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recommended Movies Section */}
          {predictedMovies.length > 0 && (
            <Card>
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Recommended Movies</p>
                </div>
              </CardHeader>
              <Divider/>
              <CardBody>
                <div className="space-y-2">
                  {predictedMovies.map((movie) => (
                    <Card key={movie.id} className="w-full">
                      <CardBody className="p-2 flex flex-row justify-between items-center gap-4">
                        <span className="flex-1 truncate">{movie.title}</span>
                        <div className="flex-shrink-0">
                          <WatchlistButton
                            key={`watchlist-${movie.id}`}
                            movieId={movie.id}
                            movieTitle={movie.title}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

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
      </div>
    </div>
  );
}